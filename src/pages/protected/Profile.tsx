import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {FaCamera, FaUser} from "react-icons/fa";
import {AppDispatch, RootState} from "../../store/store.ts";
import {fetchProfile, resetUpdateSuccess, updateProfile, uploadAvatar} from "../../store/profile/profileSlice.tsx";
import {Button, Card, Input, Select} from "../../components/common";

export default function Profile() {
    const dispatch = useDispatch<AppDispatch>();
    const {data: profile, loading, error, updateSuccess} = useSelector((state: RootState) => state.profile);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        language: "it",
        currency: "EUR",
    });

    // Carica il profilo al primo render
    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    // Aggiorna il form quando il profilo è caricato
    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name,
                last_name: profile.last_name,
                phone_number: profile.phone_number || "",
                language: profile.language,
                currency: profile.currency,
            });
        }
    }, [profile]);

    // Resetta il messaggio di successo dopo 3 secondi
    useEffect(() => {
        if (updateSuccess) {
            setTimeout(() => {
                dispatch(resetUpdateSuccess());
            }, 3000);
        }
    }, [updateSuccess, dispatch]);

    // Gestisce il caricamento dell'immagine
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            dispatch(uploadAvatar(e.target.files[0]));
        }
    };

    // Gestisce il cambio dei dati nel form
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    // Salva le modifiche nel backend
    const handleSave = () => {
        dispatch(updateProfile(formData));
    };

    return (
        <Card title="Modifica Profilo">
            {loading && <p className="text-[var(--color-primary)]">Caricamento...</p>}
            {error && <p className="text-red-500">Errore: {error}</p>}
            {updateSuccess && <p className="text-green-500">Profilo aggiornato con successo!</p>}

            {/* Immagine Profilo */}
            <div className="flex flex-col items-center">
                <div
                    className="relative w-24 h-24 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-24 h-24 rounded-full bg-[var(--color-border)] flex items-center justify-center overflow-hidden">
                            <FaUser className="text-[var(--color-text-soft)] text-4xl"/>
                        </div>
                    )}
                    <label
                        className="absolute bottom-0 right-0 bg-[var(--color-primary)] text-white p-2 rounded-full cursor-pointer">
                        <FaCamera/>
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange}/>
                    </label>
                </div>
            </div>


            {/* Form per i dati */}
            <div className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                    <Input
                        label="Nome"
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                    />
                </div>

                {/* Cognome */}
                <div>
                    <Input
                        type="text"
                        label="Cognome"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                    />
                </div>

                {/* Numero di telefono */}
                <div>
                    <Input
                        label="Telefono"
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                    />
                </div>

                {/* Lingua */}
                <div>

                    <Select
                        name="language"
                        label='Lingua'
                        value={formData.language}
                        onChange={handleChange}
                        options={[
                            {value: "it", label: "Italiano"},
                            {value: "en", label: "English"},
                            {value: "es", label: "Español"},
                            {value: "fr", label: "Français"},
                        ]}
                    />
                </div>

                {/* Valuta */}
                <div>
                    <Select
                        name="currency"
                        label='Valuta'
                        value={formData.currency}
                        onChange={handleChange}
                        options={[
                            {value: "EUR", label: "Euro (€)"},
                            {value: "USD", label: "Dollaro ($)"},
                            {value: "GBP", label: "Sterlina (£)"},
                        ]}
                    />
                </div>
            </div>

            {/* Bottone Salva */}
            <Button className="btn-primary mt-5 px-6 py-2" onClick={handleSave}>
                {loading ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
        </Card>
    );
}
