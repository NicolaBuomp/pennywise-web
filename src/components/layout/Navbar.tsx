import {Link} from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-4 py-4.5 bg-[var(--color-bg-soft)]">
            <div className="flex-1 flex justify-center">
                <Link to="/dashboard" className="text-xl font-bold text-[var(--color-primary)]">
                    Pennywise
                </Link>
            </div>
        </nav>
    );
}
