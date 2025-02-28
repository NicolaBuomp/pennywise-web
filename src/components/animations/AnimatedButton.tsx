import {motion} from "framer-motion";
import React from "react";

type AnimatedButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
};

export default function AnimatedButton({children, onClick}: AnimatedButtonProps) {
    return (
        <motion.button
            whileTap={{scale: 0.9}}
            onClick={onClick}
            className="btn-primary"
        >
            {children}
        </motion.button>
    );
}
