import {motion} from "framer-motion";
import React from "react";

type SlideInProps = {
    children: React.ReactNode;
    isVisible: boolean;
};

export default function SlideIn({children, isVisible}: SlideInProps) {
    return (
        <motion.div
            initial={{x: "-100%", opacity: 0}}
            animate={isVisible ? {x: 0, opacity: 1} : {x: "-100%", opacity: 0}}
            transition={{duration: 0.3}}
            className="fixed left-0 top-0 h-full bg-[var(--color-bg-soft)] shadow-xl glass p-6"
        >
            {children}
        </motion.div>
    );
}
