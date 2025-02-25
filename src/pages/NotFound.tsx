// src/pages/NotFound.tsx
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-background-light dark:bg-background-dark">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <p className="text-xl text-text-primary-light dark:text-text-primary-dark mb-8">
                La pagina che stai cercando non esiste.
            </p>
            <Link
                to="/"
                className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
                Torna alla Home
            </Link>
        </div>
    );
};

export default NotFound;