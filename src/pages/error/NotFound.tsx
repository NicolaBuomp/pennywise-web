import {Link} from "react-router-dom";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-6xl font-bold text-[var(--color-primary)]">404</h1>
            <p className="text-[var(--color-text-soft)]">Pagina non trovata.</p>
            <Link to="/dashboard" className="btn-primary mt-4">Torna alla Dashboard</Link>
        </div>
    );
}
