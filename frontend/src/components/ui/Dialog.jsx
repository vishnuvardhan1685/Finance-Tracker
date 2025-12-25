import React from 'react';
import { X } from 'lucide-react';

const Dialog = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div
        className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
        onClick={onClose}
        >
        <div
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden ft-surface"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-[color:var(--ft-text)]">{title}</h2>
            <button 
                onClick={onClose} 
                className="p-1 rounded-xl hover:bg-white/5 text-[color:var(--ft-muted)] hover:text-[color:var(--ft-text)] transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
        </div>
    );
};

export default Dialog;
