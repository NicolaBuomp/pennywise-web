import {motion} from "framer-motion";
import React from "react";

type FadeInProps = {
    children: React.ReactNode;
    delay?: number;
};

export default function FadeIn({children, delay = 0}: FadeInProps) {
    return (
        <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3, delay}}
        >
            {children}
        </motion.div>
    );
}
