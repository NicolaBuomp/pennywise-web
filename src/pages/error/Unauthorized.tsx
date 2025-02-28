import {Link} from "react-router-dom";

export default function Unauthorized() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
            <h1 className="text-6xl font-bold text-[var(--color-primary)]">403</h1>
            <p className="text-xl text-[var(--color-text-soft)] mt-4">
                Accesso negato. Non hai i permessi per visualizzare questa pagina.
            </p>
            <Link to="/dashboard" className="btn-primary mt-6">
                Torna alla Dashboard
            </Link>
        </div>
    );
}
