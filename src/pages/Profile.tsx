// src/pages/Profile.tsx
import {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../store/store';
import {fetchProfile, resetUpdateSuccess, updateProfile, uploadAvatar} from '../store/profile/profileSlice';
import {UpdateProfileRequest} from '../types/profile';

const Profile = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {data: profile, loading, error, updateSuccess} = useSelector((state: RootState) => state.profile);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState<UpdateProfileRequest>({
        firstName: '',
        lastName: '',
        displayName: '',
        phoneNumber: '',
        language: 'it',
        currency: 'EUR',
        theme: 'light'
    });

    // Carica il profilo all'avvio
    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    // Popola il form quando il profilo viene caricato
    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                displayName: profile.displayName || '',
                phoneNumber: profile.phoneNumber || '',
                language: profile.language || 'it',
                currency: profile.currency || 'EUR',
                theme: profile.theme || 'light'
            });
        }
    }, [profile]);

    // Reset del messaggio di successo dopo alcuni secondi
    useEffect(() => {
        if (updateSuccess) {
            const timer = setTimeout(() => {
                dispatch(resetUpdateSuccess());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [updateSuccess, dispatch]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);

            // Crea un'anteprima dell'immagine
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Prima carica l'avatar se disponibile
        if (avatarFile) {
            await dispatch(uploadAvatar(avatarFile));
        }

        // Poi aggiorna il profilo
        await dispatch(updateProfile(formData));

        if (!error) {
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);

        // Reset dell'anteprima avatar quando si annulla l'editing
        if (isEditing) {
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    };

    if (loading && !profile) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Il Mio Profilo</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {updateSuccess && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                    Profilo aggiornato con successo!
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Sezione superiore con avatar e info principali */}
                <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative">
                        {isEditing ? (
                            <div className="w-32 h-32 rounded-full border-2 border-gray-200 overflow-hidden">
                                <img
                                    src={avatarPreview || profile?.avatarUrl || '/img/default-avatar.png'}
                                    alt="Avatar anteprima"
                                    className="w-full h-full object-cover"
                                />

                                <label htmlFor="avatar-upload"
                                       className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                    <span>Cambia</span>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                        ) : (
                            <div className="w-32 h-32 rounded-full border-2 border-gray-200 overflow-hidden">
                                <img
                                    src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.displayName || 'Utente')}&background=F97A6B&color=fff`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl font-semibold">{profile?.displayName || 'Utente'}</h2>
                        <p className="text-gray-600">{profile?.firstName} {profile?.lastName}</p>

                        {!isEditing && (
                            <div className="mt-4">
                                <button
                                    onClick={toggleEdit}
                                    className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Modifica Profilo
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form di modifica o vista dettagli */}
                <div className="p-6">
                    {isEditing ? (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cognome
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome visualizzato
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Numero di telefono
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lingua
                                    </label>
                                    <select
                                        name="language"
                                        value={formData.language}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    >
                                        <option value="it">Italiano</option>
                                        <option value="en">English</option>
                                        <option value="es">Español</option>
                                        <option value="fr">Français</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valuta
                                    </label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    >
                                        <option value="EUR">Euro (€)</option>
                                        <option value="USD">US Dollar ($)</option>
                                        <option value="GBP">British Pound (£)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tema
                                    </label>
                                    <select
                                        name="theme"
                                        value={formData.theme}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    >
                                        <option value="light">Chiaro</option>
                                        <option value="dark">Scuro</option>
                                        <option value="system">Sistema</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={toggleEdit}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Annulla
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                           fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvataggio in corso...
                    </span>
                                    ) : (
                                        'Salva Modifiche'
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                    <p className="mt-1">{profile?.id}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Telefono</h3>
                                    <p className="mt-1">{profile?.phoneNumber || 'Non specificato'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Lingua</h3>
                                    <p className="mt-1">
                                        {profile?.language === 'it' ? 'Italiano' :
                                            profile?.language === 'en' ? 'English' :
                                                profile?.language === 'es' ? 'Español' :
                                                    profile?.language === 'fr' ? 'Français' :
                                                        'Non specificata'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Valuta</h3>
                                    <p className="mt-1">
                                        {profile?.currency === 'EUR' ? 'Euro (€)' :
                                            profile?.currency === 'USD' ? 'US Dollar ($)' :
                                                profile?.currency === 'GBP' ? 'British Pound (£)' :
                                                    'Non specificata'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Tema</h3>
                                    <p className="mt-1">
                                        {profile?.theme === 'light' ? 'Chiaro' :
                                            profile?.theme === 'dark' ? 'Scuro' :
                                                profile?.theme === 'system' ? 'Sistema' :
                                                    'Non specificato'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Ultimo accesso</h3>
                                    <p className="mt-1">
                                        {profile?.lastActive ? new Date(profile.lastActive).toLocaleString('it-IT') : 'Non disponibile'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-500">Informazioni account</h3>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500">Account creato il</p>
                                        <p>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('it-IT') : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Ultimo aggiornamento</p>
                                        <p>{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('it-IT') : '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;