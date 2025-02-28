import {motion} from "framer-motion";
import {useEffect} from "react";

type ToastProps = {
    message: string;
    type?: "success" | "error" | "info";
    onClose: () => void;
};

export default function Toast({message, type = "info", onClose}: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    };

    return (
        <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white shadow-lg ${colors[type]}`}
        >
            {message}
        </motion.div>
    );
}
