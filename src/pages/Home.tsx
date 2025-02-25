// src/pages/Home.tsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const Home = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    // Se l'utente è già autenticato, reindirizza alla dashboard
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header/Navigation */}
            <header className="bg-surface-light dark:bg-surface-dark shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-primary">Pennywise</h1>
                        </div>
                        <div className="flex">
                            <Link
                                to="/login"
                                className="bg-transparent hover:bg-primary text-primary hover:text-white border border-primary font-medium py-2 px-4 rounded-md mr-3 transition-colors"
                            >
                                Accedi
                            </Link>
                            <Link
                                to="/register"
                                className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                Registrati
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                        <div>
                            <h2 className="text-4xl font-extrabold text-text-primary-light dark:text-text-primary-dark sm:text-5xl">
                                <span className="block">Gestisci le tue spese</span>
                                <span className="block text-primary">in modo intelligente</span>
                            </h2>
                            <p className="mt-4 text-xl text-text-secondary-light dark:text-text-secondary-dark">
                                Pennywise semplifica la gestione delle spese condivise e delle liste della spesa nei gruppi. Organizza, dividi e tieni traccia con facilità.
                            </p>
                            <div className="mt-8">
                                <Link
                                    to="/register"
                                    className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-md transition-colors text-lg"
                                >
                                    Inizia gratis
                                </Link>
                            </div>
                        </div>
                        <div className="mt-10 lg:mt-0">
                            <div className="relative bg-surface-light dark:bg-surface-dark rounded-lg shadow-xl p-6">
                                <div className="space-y-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark">Dividi le spese</h3>
                                            <p className="text-text-secondary-light dark:text-text-secondary-dark">Semplifica la gestione delle spese condivise nei gruppi.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark">Liste della spesa</h3>
                                            <p className="text-text-secondary-light dark:text-text-secondary-dark">Crea e condividi liste della spesa con i membri del gruppo.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark">Organizza gruppi</h3>
                                            <p className="text-text-secondary-light dark:text-text-secondary-dark">Crea gruppi per coinquilini, amici, famiglia e viaggi.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-surface-light dark:bg-surface-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-text-primary-light dark:text-text-primary-dark">
                            Caratteristiche principali
                        </h2>
                        <p className="mt-4 max-w-2xl text-xl text-text-secondary-light dark:text-text-secondary-dark mx-auto">
                            Tutto ciò di cui hai bisogno per gestire le spese condivise e le liste della spesa nei tuoi gruppi.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="bg-background-light dark:bg-background-dark rounded-lg shadow-md p-6">
                            <div className="h-12 w-12 rounded-md bg-primary flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-text-primary-light dark:text-text-primary-dark">Dividi equamente le spese</h3>
                            <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                                Dividi automaticamente le spese tra i membri del gruppo e tieni traccia di chi deve cosa a chi.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-background-light dark:bg-background-dark rounded-lg shadow-md p-6">
                            <div className="h-12 w-12 rounded-md bg-primary flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-text-primary-light dark:text-text-primary-dark">Liste della spesa in tempo reale</h3>
                            <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                                Crea e condividi liste della spesa che si aggiornano in tempo reale quando qualcuno completa un elemento.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-background-light dark:bg-background-dark rounded-lg shadow-md p-6">
                            <div className="h-12 w-12 rounded-md bg-primary flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-text-primary-light dark:text-text-primary-dark">Sicuro e privato</h3>
                            <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                                I tuoi dati sono protetti con autenticazione sicura e tutte le transazioni sono private.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-primary rounded-lg shadow-xl overflow-hidden">
                        <div className="px-6 py-12 md:px-12 md:py-16 text-center">
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                <span className="block">Pronto a iniziare?</span>
                                <span className="block">Registrati gratuitamente oggi.</span>
                            </h2>
                            <p className="mt-4 text-xl leading-6 text-indigo-100">
                                Nessuna carta di credito richiesta. Inizia subito a gestire le tue spese e liste della spesa.
                            </p>
                            <div className="mt-8">
                                <Link
                                    to="/register"
                                    className="bg-white text-primary hover:bg-gray-100 font-medium py-3 px-6 rounded-md transition-colors text-lg"
                                >
                                    Crea account gratuito
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex justify-center md:justify-start">
                            <h2 className="text-xl font-bold text-primary">Pennywise</h2>
                        </div>
                        <div className="mt-8 md:mt-0">
                            <p className="text-center md:text-right text-text-secondary-light dark:text-text-secondary-dark">
                                &copy; {new Date().getFullYear()} Pennywise. Tutti i diritti riservati.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;