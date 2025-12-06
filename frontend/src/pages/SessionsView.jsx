import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, Loader2, Trash2, Download, Copy, GitBranch, FileText,
  Plus, History, GitCompare, ArrowLeft, RefreshCw
} from 'lucide-react';

function SessionsView({ currentMessages, currentGraphData, currentTranscriptId, onLoadSession }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');

  const API_BASE = 'http://127.0.0.1:8000/api/sessions';

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setSessions(res.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentSession = async () => {
    if (!sessionName.trim()) {
      alert('Please enter a session name');
      return;
    }

    try {
      await axios.post(API_BASE, {
        name: sessionName,
        description: sessionDescription,
        conversation_id: currentTranscriptId,
        transcript_id: currentTranscriptId,
        messages: currentMessages.map(msg => ({
          id: msg.id || Date.now() + Math.random(),
          sender: msg.sender,
          text: msg.text,
          timestamp: new Date().toISOString()
        })),
        graph_data: currentGraphData
      });
      setSaveDialogOpen(false);
      setSessionName('');
      setSessionDescription('');
      loadSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session');
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const res = await axios.get(`${API_BASE}/${sessionId}`);
      const session = res.data;
      if (onLoadSession) {
        onLoadSession({
          messages: session.messages || [],
          graphData: session.graph_data,
          transcriptId: session.transcript_id
        });
      }
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Failed to load session');
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await axios.delete(`${API_BASE}/${sessionId}`);
      loadSessions();
      if (selectedSession?.session_id === sessionId) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  const exportSession = async (sessionId, format = 'json') => {
    try {
      const res = await axios.get(`${API_BASE}/${sessionId}/export?format=${format}`);
      const data = res.data;
      
      const blob = new Blob([format === 'json' ? JSON.stringify(data.data, null, 2) : data.data], {
        type: data.content_type
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session_${sessionId}.${format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting session:', error);
      alert('Failed to export session');
    }
  };

  const createVersion = async (sessionId) => {
    try {
      await axios.post(`${API_BASE}/${sessionId}/version`);
      loadSessions();
      alert('Version created successfully');
    } catch (error) {
      console.error('Error creating version:', error);
      alert('Failed to create version');
    }
  };

  const compareSessions = async () => {
    if (selectedForComparison.length !== 2) {
      alert('Please select exactly 2 sessions to compare');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/compare`, {
        session_id1: selectedForComparison[0],
        session_id2: selectedForComparison[1]
      });
      setComparisonResult(res.data);
    } catch (error) {
      console.error('Error comparing sessions:', error);
      alert('Failed to compare sessions');
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
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Session Management</h1>
          <p className="text-gray-400">Save, load, and manage conversation sessions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSaveDialogOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Save Current Session
          </button>
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              comparisonMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            Compare
          </button>
        </div>
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Save Session</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="Session name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setSaveDialogOpen(false);
                    setSessionName('');
                    setSessionDescription('');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentSession}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* Sessions List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-semibold">Saved Sessions ({sessions.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No saved sessions</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedSession?.session_id === session.session_id
                      ? 'border-teal-500 bg-gray-700'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{session.name}</h3>
                      {session.description && (
                        <p className="text-sm text-gray-400 mt-1">{session.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{session.messages?.length || 0} messages</span>
                        <span>v{session.version}</span>
                        <span>{new Date(session.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {comparisonMode && (
                      <input
                        type="checkbox"
                        checked={selectedForComparison.includes(session.session_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedForComparison.length < 2) {
                              setSelectedForComparison([...selectedForComparison, session.session_id]);
                            }
                          } else {
                            setSelectedForComparison(selectedForComparison.filter(id => id !== session.session_id));
                          }
                        }}
                        className="ml-2"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Session Details / Comparison */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
          {comparisonMode && selectedForComparison.length === 2 ? (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Comparison Result</h2>
                <button
                  onClick={compareSessions}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                >
                  Compare Now
                </button>
              </div>
              {comparisonResult && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded">
                    <h3 className="font-medium mb-2">Similarity Score: {(comparisonResult.similarity_score * 100).toFixed(1)}%</h3>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Message Differences</h3>
                    <p className="text-sm text-gray-400">
                      {comparisonResult.messages_only_in_1?.length || 0} messages only in {comparisonResult.session1?.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {comparisonResult.messages_only_in_2?.length || 0} messages only in {comparisonResult.session2?.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Graph Differences</h3>
                    <div className="space-y-2 text-sm">
                      <p>Nodes added: {comparisonResult.graph_differences?.nodes_added?.length || 0}</p>
                      <p>Nodes removed: {comparisonResult.graph_differences?.nodes_removed?.length || 0}</p>
                      <p>Links added: {comparisonResult.graph_differences?.links_added?.length || 0}</p>
                      <p>Links removed: {comparisonResult.graph_differences?.links_removed?.length || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : selectedSession ? (
            <>
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{selectedSession.name}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadSession(selectedSession.session_id)}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Load Session"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => createVersion(selectedSession.session_id)}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Create Version"
                    >
                      <GitBranch className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportSession(selectedSession.session_id, 'markdown')}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Export Markdown"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSession(selectedSession.session_id)}
                      className="p-2 hover:bg-gray-700 rounded text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedSession.description && (
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-gray-400">{selectedSession.description}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium mb-2">Details</h3>
                  <div className="text-sm space-y-1 text-gray-400">
                    <p>Version: {selectedSession.version}</p>
                    <p>Created: {new Date(selectedSession.created_at).toLocaleString()}</p>
                    <p>Updated: {new Date(selectedSession.updated_at).toLocaleString()}</p>
                    <p>Messages: {selectedSession.messages?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Messages</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedSession.messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 rounded text-sm ${
                          msg.sender === 'user' ? 'bg-teal-900/30' : 'bg-gray-700'
                        }`}
                      >
                        <span className="font-medium">{msg.sender}:</span> {msg.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-2 opacity-30" />
                <p>Select a session to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionsView;

