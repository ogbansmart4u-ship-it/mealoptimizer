import { useState, useEffect } from 'react';
import { Save, Star, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Template {
  id: string;
  name: string;
  data: any;
  type: string;
  createdAt: string;
  usageCount: number;
}

interface TemplateManagerProps {
  type: 'meal' | 'symptom' | 'workout';
  currentData?: any;
  onApplyTemplate: (data: any) => void;
  storageKey: string;
}

export function TemplateManager({ type, currentData, onApplyTemplate, storageKey }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [storageKey]);

  const loadTemplates = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  };

  const saveTemplates = (updatedTemplates: Template[]) => {
    localStorage.setItem(storageKey, JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !currentData) return;

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: templateName.trim(),
      data: currentData,
      type,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    saveTemplates([...templates, newTemplate]);
    setTemplateName('');
    setShowSaveDialog(false);
  };

  const handleApplyTemplate = (template: Template) => {
    const updatedTemplates = templates.map((t) =>
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    );
    saveTemplates(updatedTemplates);
    onApplyTemplate(template.data);
    setShowDialog(false);
  };

  const handleDeleteTemplate = (id: string) => {
    saveTemplates(templates.filter((t) => t.id !== id));
  };

  const sortedTemplates = [...templates].sort((a, b) => b.usageCount - a.usageCount);

  return (
    <>
      <div className="flex gap-2">
        {templates.length > 0 && (
          <button
            type="button"
            onClick={() => setShowDialog(true)}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Use Template ({templates.length})
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowSaveDialog(true)}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save as Template
        </button>
      </div>

      {/* Templates List Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quick Entry Templates</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedTemplates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No templates saved yet</p>
            ) : (
              sortedTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{template.name}</h3>
                      <p className="text-xs text-gray-500">
                        Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApplyTemplate(template)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder={`e.g., "Morning ${type}", "Post-workout ${type}"`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Template
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
