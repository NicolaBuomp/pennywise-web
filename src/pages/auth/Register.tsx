import {FormEvent, useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {resetAuthError, signUp} from "../../store/auth/authSlice";
import {RootState} from "../../store/store";
import {Button, Card, Input} from "../../components/common";

const Register = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        phone_number: "",
    });

    const [errors, setErrors] = useState({password: "", general: ""});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {loading, error, user} = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    useEffect(() => {
        dispatch(resetAuthError());
    }, [dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
        if (name === "password" || name === "confirmPassword") {
            setErrors((prev) => ({...prev, password: ""}));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {password: "", general: ""};

        if (formData.password !== formData.confirmPassword) {
            newErrors.password = "Le password non corrispondono";
            isValid = false;
        }

        if (formData.password.length < 8) {
            newErrors.password = "La password deve essere di almeno 8 caratteri";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const result = await dispatch(signUp(formData));

            if (result.meta.requestStatus === "fulfilled") {
                console.log("Registrazione completata con successo!");
                navigate("/email-verification");
            }
        } catch (err) {
            console.error("Errore durante la registrazione:", err);
            setErrors((prev) => ({...prev, general: "Si è verificato un errore durante la registrazione"}));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
            <Card title="Registrati su Pennywise">
                {error && <p className="text-red-500">{error}</p>}
                {errors.password && <p className="text-red-500">{errors.password}</p>}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <Input type="text" name="first_name" placeholder="Nome" value={formData.first_name}
                           onChange={handleChange}/>
                    <Input type="text" name="last_name" placeholder="Cognome" value={formData.last_name}
                           onChange={handleChange}/>
                    <Input type="email" name="email" placeholder="Email" value={formData.email}
                           onChange={handleChange}/>
                    <Input type="tel" name="phone_number" placeholder="Numero di telefono (opzionale)"
                           value={formData.phone_number} onChange={handleChange}/>
                    <Input type="password" name="password" placeholder="Password" value={formData.password}
                           onChange={handleChange}/>
                    <Input type="password" name="confirmPassword" placeholder="Conferma Password"
                           value={formData.confirmPassword} onChange={handleChange}/>
                    <Button type="submit"
                            className="w-full">{loading ? "Registrazione in corso..." : "Registrati"}</Button>
                </form>

                <p className="mt-4 text-center text-sm text-[var(--color-text-soft)]">
                    Hai già un account? <Link to="/login"
                                              className="text-[var(--color-primary)] hover:underline">Accedi</Link>
                </p>
            </Card>
        </div>
    );
};

export default Register;
