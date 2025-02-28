import React from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export default function Modal({isOpen, onClose, children}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
            <div className="bg-[var(--color-bg-soft)] p-6 rounded-lg shadow-xl glass">
                {children}
                <button onClick={onClose} className="mt-4 w-full bg-[var(--color-primary)] text-white py-2 rounded-md">
                    Chiudi
                </button>
            </div>
        </div>
    );
}
