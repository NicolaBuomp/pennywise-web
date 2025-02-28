import {useDispatch, useSelector} from "react-redux";
import {motion} from "framer-motion";
import {FaMoon, FaSun} from "react-icons/fa";
import {RootState} from "../../store/store.ts";
import {toggleTheme} from "../../store/theme/themeSlice.ts";

export default function ThemeToggle() {
    const dispatch = useDispatch();
    const theme = useSelector((state: RootState) => state.theme.theme);

    return (
        <div
            className={`relative flex items-center w-16 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-300"
            }`}
            onClick={() => dispatch(toggleTheme())}
        >
            {/* Sole (Light mode) */}
            <FaSun className={`absolute left-2 text-yellow-500 text-lg transition-all duration-300 ${
                theme === "dark" ? "opacity-100" : "opacity-0"
            }`}
            />

            {/* Luna (Dark mode) */}
            <FaMoon className={`absolute right-2 text-gray-600 text-lg transition-all duration-300 ${
                theme === "dark" ? "opacity-0" : "opacity-100"
            }`}
            />

            {/* Pulsante animato */}
            <motion.div
                layout
                className={`w-7 h-7 rounded-full shadow-lg ${
                    theme === "dark" ? "bg-[var(--color-primary)]" : "bg-white"
                }`}
                initial={false}
                animate={{x: theme === "dark" ? 32 : 0}}
                transition={{type: "spring", stiffness: 250, damping: 20}}
            />
        </div>
    );
}
