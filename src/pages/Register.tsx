// src/pages/Register.tsx
import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signUp, resetAuthError } from '../store/auth/authSlice.ts';
import { RootState, AppDispatch } from '../store/store.ts';
import { supabase } from '../lib/supabase.ts';

const Register = () => {
    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
    });

    const [errors, setErrors] = useState({
        password: '',
        general: ''
    });

    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Recupera lo stato di autenticazione dal redux store
    const { loading, error, user } = useSelector((state: RootState) => state.auth);

    // Reindirizza se già autenticato
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Resetta gli errori quando il componente viene montato
    useEffect(() => {
        dispatch(resetAuthError());
    }, [dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Reset degli errori specifici durante la modifica
        if (name === 'password' || name === 'confirmPassword') {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { password: '', general: '' };

        // Validazione password
        if (formData.password !== formData.confirmPassword) {
            newErrors.password = 'Le password non corrispondono';
            isValid = false;
        }

        if (formData.password.length < 8) {
            newErrors.password = 'La password deve essere di almeno 8 caratteri';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Primo passo: registra l'utente con Supabase Auth
            const result = await dispatch(signUp({ email: formData.email, password: formData.password }));

            if (signUp.fulfilled.match(result)) {
                // Se la registrazione è avvenuta con successo
                const userData = result.payload;

                // Se abbiamo un user ID, aggiorniamo i dati del profilo
                if (userData?.user?.id) {
                    // Aggiorna i metadati utente con le informazioni aggiuntive
                    const { error: updateError } = await supabase.auth.updateUser({
                        data: {
                            first_name: formData.firstName,
                            last_name: formData.lastName,
                            phone: formData.phoneNumber
                        }
                    });

                    if (updateError) {
                        console.error('Errore durante l\'aggiornamento del profilo:', updateError);
                        setErrors(prev => ({
                            ...prev,
                            general: 'Registrazione completata, ma ci sono stati problemi nel salvare i dati del profilo'
                        }));
                    }

                    // Crea un record del profilo nella tabella profiles (se esiste nel tuo schema)
                    try {
                        const { error: profileError } = await supabase
                            .from('profiles')
                            .insert([
                                {
                                    id: userData.user.id,
                                    first_name: formData.firstName,
                                    last_name: formData.lastName,
                                    phone_number: formData.phoneNumber,
                                    updated_at: new Date()
                                }
                            ]);

                        if (profileError) {
                            console.error('Errore durante la creazione del profilo:', profileError);
                        }
                    } catch (err) {
                        // Se la tabella profiles non esiste ancora, ignora l'errore
                        console.log('Nota: La tabella profiles potrebbe non esistere ancora');
                    }
                }

                // Mostra il messaggio di successo
                setRegistrationSuccess(true);
            }
        } catch (err) {
            console.error('Errore durante la registrazione:', err);
            setErrors(prev => ({
                ...prev,
                general: 'Si è verificato un errore durante la registrazione'
            }));
        }
    };

    // Se la registrazione è avvenuta con successo, mostra il messaggio di conferma
    if (registrationSuccess) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Registrazione Completata</h1>
                    <div className="mb-6 text-center text-green-600">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <p className="text-lg">La tua registrazione è stata completata con successo!</p>
                    </div>
                    <p className="mb-6 text-center text-gray-600">
                        Ti abbiamo inviato un'email di conferma. Verifica la tua casella di posta e segui le istruzioni per attivare il tuo account.
                    </p>
                    <div className="flex justify-center">
                        <Link
                            to="/login"
                            className="px-4 py-2 bg-primary text-white font-medium rounded-lg text-center hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
                        >
                            Vai al Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 py-8 px-4">
            <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Crea un account</h1>

                {(error || errors.general) && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error || errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                Nome
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="lastName"
                                className="block mb-1 text-sm font-medium text-gray-700"
                            >
                                Cognome
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block mb-1 text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phoneNumber"
                            className="block mb-1 text-sm font-medium text-gray-700"
                        >
                            Numero di telefono
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block mb-1 text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                            minLength={8}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block mb-1 text-sm font-medium text-gray-700"
                        >
                            Conferma Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                            required
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-medium rounded-lg py-2.5 px-5 text-center hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-70"
                    >
                        {loading ? 'Registrazione in corso...' : 'Registrati'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Hai già un account?{' '}
                        <Link to="/login" className="text-primary hover:underline">
                            Accedi
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;