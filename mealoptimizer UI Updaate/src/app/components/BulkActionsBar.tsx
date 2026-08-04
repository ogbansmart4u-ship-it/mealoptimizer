import { Trash2, Edit, X, CheckSquare } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onEdit?: () => void;
  onCancel: () => void;
  onSelectAll?: () => void;
  totalCount?: number;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onEdit,
  onCancel,
  onSelectAll,
  totalCount,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-gray-900 text-white px-6 py-4 shadow-2xl z-50 animate-slide-up">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="font-semibold">{selectedCount} selected</p>
          {onSelectAll && totalCount && selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <CheckSquare className="h-3 w-3" />
              Select all ({totalCount})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onEdit && selectedCount === 1 && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 transition"
          >
            <Trash2 className="h-4 w-4" />
            Delete {selectedCount > 1 ? `(${selectedCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
