import _React from 'react';

export default function Modal({ open, onClose, title, children, footer }){
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-700/50 flex items-center justify-center z-500">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="bg-white dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 shadow-xl max-w-md w-full relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-4 text-gray-500 dark:text-indigo-500/80 hover:text-black"
          >
            ✕
          </button>
          {children}
        </div>
        <div className="flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}
