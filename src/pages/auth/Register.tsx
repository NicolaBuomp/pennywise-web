// src/pages/Register.tsx
import {FormEvent, useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {resetAuthError, signUp} from '../../store/auth/authSlice.ts';
import {RootState} from '../../store/store.ts';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
    });

    const [errors, setErrors] = useState({password: '', general: ''});
    const [isProcessing, setIsProcessing] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {loading, error, user} = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        dispatch(resetAuthError());
    }, [dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
        if (name === 'password' || name === 'confirmPassword') {
            setErrors((prev) => ({...prev, password: ''}));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {password: '', general: ''};

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
        if (!validateForm()) return;
        try {
            setIsProcessing(true);
            const result = await dispatch(signUp({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber
            }));

            if (result.meta.requestStatus === 'fulfilled') {
                console.log('Registrazione completata con successo!');
                navigate('/email-verification');
            }
        } catch (err) {
            console.error('Errore durante la registrazione:', err);
            setErrors((prev) => ({...prev, general: 'Si è verificato un errore durante la registrazione'}));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 py-8 px-4">
            <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Crea un account</h1>
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                           placeholder="Nome"
                           className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                           required/>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                           placeholder="Cognome"
                           className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                           required/>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email"
                           className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                           required/>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                           placeholder="Numero di telefono"
                           className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"/>
                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                           placeholder="Password"
                           className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                           required minLength={8}/>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword}
                           onChange={handleChange} placeholder="Conferma Password"
                           className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                           required/>
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    <button type="submit" disabled={loading || isProcessing}
                            className="w-full bg-primary text-white font-medium rounded-lg py-2.5 px-5 text-center hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-70">Registrati
                    </button>
                </form>
                <p className="text-sm text-gray-600">Hai già un account? <Link to="/login"
                                                                               className="text-primary hover:underline">Accedi</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
