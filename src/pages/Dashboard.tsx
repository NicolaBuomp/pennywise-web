// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { signOut } from '../store/auth/authSlice';
import { supabase } from '../lib/supabase';
import { AuthUser } from '../types/auth';

interface UserProfile {
    id: string;
    name: string | null;
    surname: string | null;
    phone_number: string | null;
    avatar_url: string | null;
    updated_at: string;
}

const Dashboard = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [tableExists, setTableExists] = useState(true);

    useEffect(() => {
        // Carica i dati del profilo
        const loadProfile = async () => {
            try {
                if (!user?.id) return;

                setLoading(true);

                // Recupera il profilo dalla tabella profiles
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    // Se l'errore è dovuto alla mancanza della tabella, usa i metadati dell'utente
                    if (error.code === '42P01') {
                        console.warn('La tabella profiles non esiste ancora. Utilizzando solo i metadati utente.');
                        setTableExists(false);
                        const authUser = user as AuthUser;
                        setProfile({
                            id: authUser.id,
                            name: authUser.user_metadata?.name || null,
                            surname: authUser.user_metadata?.surname || null,
                            phone_number: authUser.user_metadata?.phone || null,
                            avatar_url: authUser.user_metadata?.avatar_url || null,
                            updated_at: authUser.updated_at || new Date().toISOString()
                        });
                    } else {
                        console.error('Errore nel caricamento del profilo:', error);
                    }
                } else if (data) {
                    setProfile(data as UserProfile);
                }
            } catch (err) {
                console.error('Errore imprevisto:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {!tableExists && (
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    La tabella "profiles" non è stata trovata nel database. Esegui lo script SQL per crearla o contatta l'amministratore.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {user?.email_confirmed_at ? (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">
                                    Il tuo indirizzo email è stato verificato il {new Date(user.email_confirmed_at).toLocaleString('it-IT')}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    Il tuo indirizzo email non è ancora stato verificato. Controlla la tua casella di posta.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Informazioni profilo
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Dettagli e informazioni personali
                        </p>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Nome completo</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {profile?.name && profile?.surname
                                        ? `${profile.name} ${profile.surname}`
                                        : 'Non specificato'}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user?.email || 'Non disponibile'}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Numero di telefono</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {profile?.phone_number || 'Non specificato'}
                                </dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {user?.id}
                                </dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Ultimo aggiornamento</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {profile?.updated_at
                                        ? new Date(profile.updated_at).toLocaleString('it-IT')
                                        : 'Non disponibile'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="mt-8 bg-white shadow sm:rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Benvenuto nell'app Pennywise!</h2>
                    <p className="text-gray-600">
                        Questa è la tua dashboard personale. Da qui potrai:
                    </p>
                    <ul className="mt-4 list-disc pl-5 text-gray-600 space-y-2">
                        <li>Gestire i tuoi gruppi di spesa</li>
                        <li>Creare e modificare liste della spesa</li>
                        <li>Tenere traccia delle spese condivise</li>
                        <li>Visualizzare i bilanci con gli altri membri</li>
                    </ul>
                    <p className="mt-4 text-gray-600">
                        Per iniziare, crea un nuovo gruppo o partecipa a uno esistente tramite invito.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;