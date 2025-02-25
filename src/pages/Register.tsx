// src/pages/Register.tsx
import {FormEvent, useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {resetAuthError, signUp} from '../store/auth/authSlice';
import {RootState} from '../store/store';

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
    const [isProcessing, setIsProcessing] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Recupera lo stato di autenticazione dal redux store
    const {loading, error, user} = useSelector((state: RootState) => state.auth);

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
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Reset degli errori specifici durante la modifica
        if (name === 'password' || name === 'confirmPassword') {
            setErrors(prev => ({...prev, password: ''}));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {password: '', general: ''};

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
            setIsProcessing(true);

            // Invio tutti i dati, non solo email e password
            const result = await dispatch(signUp({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber
            }));

            // Se la registrazione è avvenuta con successo
            if (result.meta.requestStatus === 'fulfilled') {
                console.log('Registrazione completata con successo!');
                setRegistrationSuccess(true);
            }
        } catch (err) {
            console.error('Errore durante la registrazione:', err);
            setErrors(prev => ({
                ...prev,
                general: 'Si è verificato un errore durante la registrazione'
            }));
        } finally {
            setIsProcessing(false);
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
                            <path fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"></path>
                        </svg>
                        <p className="text-lg">La tua registrazione è stata completata con successo!</p>
                    </div>
                    <p className="mb-6 text-center text-gray-600">
                        Ti abbiamo inviato un'email di conferma. Verifica la tua casella di posta e segui le istruzioni
                        per attivare il tuo account.
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
                        disabled={loading || isProcessing}
                        className="w-full bg-primary text-white font-medium rounded-lg py-2.5 px-5 text-center hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-70"
                    >
                        {loading || isProcessing ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registrazione in corso...
                            </div>
                        ) : (
                            'Registrati'
                        )}
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