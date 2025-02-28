import {Link, useLocation} from "react-router-dom";
import {FaChevronRight, FaFolderOpen} from "react-icons/fa";

export default function Breadcrumbs() {
    const location = useLocation();
    const pathSegments = location.pathname.split("/").filter((segment) => segment);

    // Se siamo solo su "/dashboard", mostriamo solo "Dashboard"
    if (location.pathname === "/dashboard") {
        return (
            <nav className="text-2xl font-bold text-[var(--color-text)]">
                Dashboard
            </nav>
        );
    }

    return (
        <nav className="flex items-center text-2xl font-semibold text-[var(--color-text)]">
            {/* Link alla Home/Dashboard */}
            <Link to="/dashboard" className="text-[var(--color-primary)] hover:underline">
                Dashboard
            </Link>

            {/* Creiamo i segmenti del breadcrumb */}
            {pathSegments.map((segment, index) => {
                const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
                const isLast = index === pathSegments.length - 1;

                // Convertiamo la prima lettera in maiuscolo
                const formattedSegment = segment.charAt(0).toUpperCase() + segment.slice(1);

                return (
                    <div key={path} className="flex items-center">
                        <FaChevronRight className="mx-2 text-lg opacity-50"/>
                        {isLast ? (
                            <span className="font-bold text-[var(--color-text)] flex items-center gap-2">
                                {decodeURIComponent(formattedSegment)}
                                <FaFolderOpen className="text-[var(--color-primary)] text-xl"/>
                            </span>
                        ) : (
                            <Link to={path} className="text-[var(--color-primary)] hover:underline">
                                {decodeURIComponent(formattedSegment)}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
