import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Save, Trash2, Plus, Loader2, Layout, Users, GitBranch, Clock } from 'lucide-react';

function CustomViewsView({ currentGraphData, onApplyView }) {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewName, setViewName] = useState('');
  const [viewDescription, setViewDescription] = useState('');
  const [viewType, setViewType] = useState('custom');
  const [activeFilters, setActiveFilters] = useState({
    Requirement: true,
    Stakeholder: true,
    TestCase: true,
    Feature: true,
    Constraint: true,
    Team: true,
  });

  const API_BASE = 'http://127.0.0.1:8000/api/views';

  useEffect(() => {
    loadViews();
  }, []);

  const loadViews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setViews(res.data);
    } catch (error) {
      console.error('Error loading views:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentView = async () => {
    if (!viewName.trim()) {
      alert('Please enter a view name');
      return;
    }

    try {
      await axios.post(API_BASE, {
        name: viewName,
        description: viewDescription,
        view_type: viewType,
        filters: {},
        layout_config: {},
        active_filters: activeFilters
      });
      setCreateDialogOpen(false);
      setViewName('');
      setViewDescription('');
      setViewType('custom');
      loadViews();
    } catch (error) {
      console.error('Error saving view:', error);
      alert('Failed to save view');
    }
  };

  const deleteView = async (viewId) => {
    if (!confirm('Are you sure you want to delete this view?')) return;

    try {
      await axios.delete(`${API_BASE}/${viewId}`);
      loadViews();
      if (selectedView?.view_id === viewId) {
        setSelectedView(null);
      }
    } catch (error) {
      console.error('Error deleting view:', error);
      alert('Failed to delete view');
    }
  };

  const createPresetView = async (presetType, name) => {
    try {
      const endpoint = {
        stakeholder: 'presets/stakeholder',
        dependency: 'presets/dependency',
        feature_cluster: 'presets/feature-cluster',
        timeline: 'presets/timeline'
      }[presetType];

      await axios.post(`${API_BASE}/${endpoint}`, {
        name: name || `${presetType} View`
      });
      loadViews();
    } catch (error) {
      console.error('Error creating preset view:', error);
      alert('Failed to create preset view');
    }
  };

  const applyView = (view) => {
    if (onApplyView) {
      onApplyView({
        activeFilters: view.active_filters || {},
        layoutConfig: view.layout_config || {},
        nodePositions: view.node_positions
      });
    }
  };

  const getViewTypeIcon = (type) => {
    switch (type) {
      case 'stakeholder':
        return <Users className="w-4 h-4" />;
      case 'dependency':
        return <GitBranch className="w-4 h-4" />;
      case 'feature_cluster':
        return <Layout className="w-4 h-4" />;
      case 'timeline':
        return <Clock className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Custom Graph Views</h1>
          <p className="text-gray-400">Save and manage personalized graph layouts and perspectives</p>
        </div>
        <button
          onClick={() => setCreateDialogOpen(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create View
        </button>
      </div>

      {createDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Create Custom View</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="View name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={viewDescription}
                  onChange={(e) => setViewDescription(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">View Type</label>
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="custom">Custom</option>
                  <option value="stakeholder">Stakeholder</option>
                  <option value="dependency">Dependency</option>
                  <option value="feature_cluster">Feature Cluster</option>
                  <option value="timeline">Timeline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Active Filters</label>
                <div className="space-y-2">
                  {Object.keys(activeFilters).map((filter) => (
                    <label key={filter} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeFilters[filter]}
                        onChange={(e) =>
                          setActiveFilters({
                            ...activeFilters,
                            [filter]: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <span className="text-sm">{filter}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setViewName('');
                    setViewDescription('');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentView}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
        <h3 className="font-medium mb-3">Quick Presets</h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => createPresetView('stakeholder', 'Stakeholder View')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Stakeholder
          </button>
          <button
            onClick={() => createPresetView('dependency', 'Dependency View')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-2"
          >
            <GitBranch className="w-4 h-4" />
            Dependency
          </button>
          <button
            onClick={() => createPresetView('feature_cluster', 'Feature Cluster View')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-2"
          >
            <Layout className="w-4 h-4" />
            Feature Cluster
          </button>
          <button
            onClick={() => createPresetView('timeline', 'Timeline View')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Timeline
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Views List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-semibold">Saved Views ({views.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {views.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Eye className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No saved views</p>
              </div>
            ) : (
              views.map((view) => (
                <div
                  key={view.view_id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedView?.view_id === view.view_id
                      ? 'border-teal-500 bg-gray-700'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedView(view)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getViewTypeIcon(view.view_type)}
                        <h3 className="font-medium">{view.name}</h3>
                      </div>
                      {view.description && (
                        <p className="text-sm text-gray-400 mt-1">{view.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500 capitalize">{view.view_type.replace('_', ' ')}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(view.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* View Details */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
          {selectedView ? (
            <>
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{selectedView.name}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyView(selectedView)}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Apply View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteView(selectedView.view_id)}
                      className="p-2 hover:bg-gray-700 rounded text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedView.description && (
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-gray-400">{selectedView.description}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium mb-2">Details</h3>
                  <div className="text-sm space-y-1 text-gray-400">
                    <p>Type: {selectedView.view_type.replace('_', ' ')}</p>
                    <p>Created: {new Date(selectedView.created_at).toLocaleString()}</p>
                    <p>Updated: {new Date(selectedView.updated_at).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Active Filters</h3>
                  <div className="space-y-1">
                    {Object.entries(selectedView.active_filters || {}).map(([filter, active]) => (
                      <div key={filter} className="flex items-center gap-2 text-sm">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            active ? 'bg-teal-400' : 'bg-gray-600'
                          }`}
                        />
                        <span className={active ? 'text-gray-200' : 'text-gray-500'}>
                          {filter}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Eye className="w-16 h-16 mx-auto mb-2 opacity-30" />
                <p>Select a view to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomViewsView;

