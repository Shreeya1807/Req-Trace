import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Download, Loader2, Layers, Box, Link as LinkIcon, FileQuestion } from 'lucide-react';

function DocumentsView({ currentGraphData, currentMessages }) {
  const [documentType, setDocumentType] = useState('architecture');
  const [documentFormat, setDocumentFormat] = useState('markdown');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [componentType, setComponentType] = useState('');

  const API_BASE = 'http://127.0.0.1:8000/api/documents';

  const documentTypes = [
    {
      id: 'architecture',
      label: 'Architecture Diagram',
      icon: Layers,
      description: 'Generate architecture diagrams from graph structure'
    },
    {
      id: 'component_spec',
      label: 'Component Specification',
      icon: Box,
      description: 'Create component specifications from requirement nodes'
    },
    {
      id: 'interface_design',
      label: 'Interface Design',
      icon: LinkIcon,
      description: 'Generate interface designs from relationships'
    },
    {
      id: 'design_rationale',
      label: 'Design Rationale',
      icon: FileQuestion,
      description: 'Produce design rationale from conversation context'
    }
  ];

  const generateDocument = async () => {
    if (!currentGraphData || !currentGraphData.nodes || currentGraphData.nodes.length === 0) {
      alert('Please load a graph first');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/generate`, {
        graph_data: currentGraphData,
        conversation_context: currentMessages || [],
        document_type: documentType,
        format: documentFormat,
        options: componentType ? { component_type: componentType } : {}
      });

      setGeneratedContent(res.data);
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = () => {
    if (!generatedContent) return;

    const blob = new Blob([generatedContent.content], {
      type: documentFormat === 'markdown' ? 'text/markdown' : 'application/pdf'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document_${documentType}_${Date.now()}.${documentFormat === 'markdown' ? 'md' : 'pdf'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-teal-400 mb-2">Document Generation</h1>
        <p className="text-gray-400">Automatically generate design documents from your requirement graph</p>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* Configuration Panel */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-xl font-semibold mb-4">Document Type</h2>
            <div className="space-y-3">
              {documentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setDocumentType(type.id)}
                    className={`w-full p-4 rounded-lg border transition-colors text-left ${
                      documentType === type.id
                        ? 'border-teal-500 bg-gray-700'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-teal-400 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium">{type.label}</h3>
                        <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {documentType === 'component_spec' && (
            <div>
              <label className="block text-sm font-medium mb-2">Component Type Filter (Optional)</label>
              <input
                type="text"
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                placeholder="e.g., Feature, Requirement"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Output Format</label>
            <select
              value={documentFormat}
              onChange={(e) => setDocumentFormat(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="markdown">Markdown (.md)</option>
              <option value="pdf">PDF (Coming Soon)</option>
            </select>
          </div>

          <div className="space-y-2">
            <button
              onClick={generateDocument}
              disabled={loading || !currentGraphData}
              className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generate Document
                </>
              )}
            </button>

            {generatedContent && (
              <button
                onClick={downloadDocument}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download {documentFormat.toUpperCase()}
              </button>
            )}
          </div>

          <div className="text-sm text-gray-400 space-y-2">
            <p className="font-medium">Current Graph Status:</p>
            <p>
              {currentGraphData?.nodes?.length || 0} nodes,{' '}
              {currentGraphData?.links?.length || 0} links
            </p>
            <p>{currentMessages?.length || 0} conversation messages available</p>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold">Document Preview</h2>
            {generatedContent && (
              <span className="text-xs text-gray-400">
                Generated: {new Date(generatedContent.generated_at).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
              </div>
            ) : generatedContent ? (
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-900 p-4 rounded border border-gray-700">
                  {generatedContent.content}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileText className="w-16 h-16 mb-4 opacity-30" />
                <p>Select a document type and click "Generate Document"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentsView;

