import {motion} from "framer-motion";

type AlertProps = {
    message: string;
    onConfirm: () => void;
    onClose: () => void;
};

export default function Alert({message, onConfirm, onClose}: AlertProps) {
    return (
        <motion.div
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.9}}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md"
        >
            <div className="bg-[var(--color-bg-soft)] p-6 rounded-lg shadow-lg glass">
                <p className="text-[var(--color-text)] mb-4">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="btn-secondary">
                        Annulla
                    </button>
                    <button onClick={onConfirm} className="btn-primary">
                        Conferma
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
