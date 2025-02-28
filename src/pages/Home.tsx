import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../store/store";
import {Button, Card} from "../components/common";

const Home = () => {
    const {user} = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    // Se l'utente è autenticato, lo reindirizziamo alla dashboard
    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
            {/* Navbar */}
            <header className="bg-[var(--color-bg-soft)] shadow-md p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-[var(--color-primary)]">Pennywise</h1>
                    <div className="flex gap-3">
                        <Button variant="secondary" to="/login">
                            Accedi
                        </Button>
                        <Button variant="primary" to="/register">
                            Registrati
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-16 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-extrabold">
                        Gestisci le tue spese <br/>
                        <span className="text-[var(--color-primary)]">in modo intelligente</span>
                    </h2>
                    <p className="mt-4 text-lg text-[var(--color-text-soft)]">
                        Pennywise semplifica la gestione delle spese condivise e delle liste della spesa nei gruppi.
                    </p>
                    <Button className="mt-6 px-6 py-3 text-lg" to="/register">
                        Inizia gratis
                    </Button>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-[var(--color-bg-soft)]">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
                    <Card title="Dividi le spese" subtitle="Semplifica la gestione delle spese condivise nei gruppi.">
                        <div className="flex items-center justify-center">
                            <span className="text-3xl">💰</span>
                        </div>
                    </Card>
                    <Card title="Liste della spesa" subtitle="Crea e condividi liste della spesa con il gruppo.">
                        <div className="flex items-center justify-center">
                            <span className="text-3xl">🛒</span>
                        </div>
                    </Card>
                    <Card title="Organizza gruppi" subtitle="Crea gruppi per coinquilini, amici e famiglia.">
                        <div className="flex items-center justify-center">
                            <span className="text-3xl">👥</span>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 text-center">
                <Card title="Pronto a iniziare?" subtitle="Registrati gratuitamente oggi.">
                    <Button className="mt-4 px-6 py-3 text-lg" to="/register">
                        Crea account gratuito
                    </Button>
                </Card>
            </section>

            {/* Footer */}
            <footer className="bg-[var(--color-bg-soft)] border-t border-[var(--color-border)] py-6 text-center">
                <p className="text-[var(--color-text-soft)]">
                    &copy; {new Date().getFullYear()} Pennywise. Tutti i diritti riservati.
                </p>
            </footer>
        </div>
    );
};

export default Home;
