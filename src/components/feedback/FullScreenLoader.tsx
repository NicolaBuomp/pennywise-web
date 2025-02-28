import {motion} from "framer-motion";
import Spinner from "./Spinner.tsx";

export default function FullScreenLoader() {
    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="fixed inset-0 flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)]"
        >
            <div className="flex flex-col items-center gap-4">
                <Spinner/>
                <p>Caricamento in corso...</p>
            </div>
        </motion.div>
    );
}
