import React from 'react';

export default function Modal({ open, onClose, title, children, footer }){
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}
