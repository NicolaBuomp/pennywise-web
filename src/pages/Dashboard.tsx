// src/pages/Dashboard.tsx
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../store/store';
import {fetchProfile} from '../store/profile/profileSlice';

const Dashboard = () => {
    const {user} = useSelector((state: RootState) => state.auth);
    const {data: profile, loading} = useSelector((state: RootState) => state.profile);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchProfile());
        }

    }, [user, dispatch]);

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
                                    {profile?.full_name || 'Non specificato'}
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
                        </dl>
                    </div>
                </div>
                <div className="mt-8 bg-white shadow sm:rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Benvenuto nell'app Pennywise!</h2>
                    <p className="text-gray-600">Questa è la tua dashboard personale. Da qui potrai:</p>
                    <ul className="mt-4 list-disc pl-5 text-gray-600 space-y-2">
                        <li>Gestire i tuoi gruppi di spesa</li>
                        <li>Creare e modificare liste della spesa</li>
                        <li>Tenere traccia delle spese condivise</li>
                        <li>Visualizzare i bilanci con gli altri membri</li>
                    </ul>
                    <p className="mt-4 text-gray-600">Per iniziare, crea un nuovo gruppo o partecipa a uno esistente
                        tramite invito.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
