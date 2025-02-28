import {Link, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {FaBars, FaCog, FaSignOutAlt, FaTachometerAlt, FaTimes, FaUser} from "react-icons/fa";
import {motion} from "framer-motion";
import {Button} from "../common";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../store/store";
import {signOut} from "../../store/auth/authSlice";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const {user} = useSelector((state: RootState) => state.auth);

    // Effetto per aggiornare lo stato quando cambia la dimensione dello schermo
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Funzione per gestire il logout
    const handleLogout = () => {
        dispatch(signOut());
    };

    // Effetto per reindirizzare alla Home dopo il logout
    useEffect(() => {
        if (!user) {
            navigate("/"); // Reindirizza alla home se l'utente è disconnesso
        }
    }, [user, navigate]);

    // Elementi del menu
    const menuItems = [
        {name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt size={20}/>},
        {name: "Profilo", path: "/profile", icon: <FaUser size={20}/>},
        {name: "Impostazioni", path: "/settings", icon: <FaCog size={20}/>},
    ];

    return (
        <>
            {/* Pulsante per aprire la sidebar su mobile */}
            {!isDesktop && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-4 left-4 z-50 text-[var(--color-primary)] lg:hidden"
                >
                    <FaBars size={24}/>
                </button>
            )}

            {/* Sidebar principale */}
            <motion.aside
                initial={{x: "-100%"}}
                animate={{x: isOpen || isDesktop ? "0%" : "-100%"}}
                transition={{duration: 0.15, ease: "easeInOut"}}
                className={`h-full w-64 shadow-md bg-[var(--color-bg-soft)] transition-all flex flex-col z-50 
                ${isDesktop ? "relative translate-x-0" : "fixed top-0 left-0"} lg:flex`}
            >
                {/* Pulsante per chiudere la sidebar su mobile */}
                {!isDesktop && (
                    <button onClick={() => setIsOpen(false)} className="p-4 text-[var(--color-primary)] lg:hidden">
                        <FaTimes size={22}/>
                    </button>
                )}

                {/* Menu di navigazione */}
                <nav className="mt-3 flex-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-6 py-3 mx-4.5 text-[var(--color-text)] hover:bg-[var(--color-subtle)] transition-all duration-150 rounded-md
                            ${location.pathname === item.path ? "bg-[var(--color-primary)] text-white" : ""}`}
                            onClick={() => setIsOpen(false)} // Chiude la sidebar su mobile
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Sezione inferiore: Logout */}
                <div className="mt-auto mx-4.5 mb-2">
                    <Button
                        variant="icon"
                        className="flex items-center gap-4 px-6 py-3 text-red-500 hover:text-red-100 hover:bg-red-500 transition-all duration-150 w-full rounded-md"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt size={18}/>
                        <span>Logout</span>
                    </Button>
                </div>
            </motion.aside>

            {/* Overlay su mobile */}
            {!isDesktop && isOpen && (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 0.5}}
                    exit={{opacity: 0}}
                    className="fixed inset-0 bg-black z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                ></motion.div>
            )}
        </>
    );
}
