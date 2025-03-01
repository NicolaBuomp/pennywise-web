import React from "react";

type ModalProps = {
    title?: string;
    subtitle?: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export default function Modal({title, subtitle, isOpen, onClose, children}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
            <div className="relative bg-[var(--color-bg-soft)] p-6 rounded-2xl shadow-2xl max-w-lg w-full mx-4">
                {/* Bottone di chiusura */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Chiudi">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                {/* Titolo e sottotitolo */}
                {title && <h2 className="text-2xl font-semibold text-[var(--color-text)] text-center mb-2">{title}</h2>}
                {subtitle && <p className="text-[var(--color-text-soft)] text-center mb-4">{subtitle}</p>}

                {/* Contenuto della modale */}
                <div className="mt-2">{children}</div>
            </div>
        </div>
    );
}
