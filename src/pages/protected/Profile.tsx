import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchProfile, updateProfile } from "../../store/profile/profileSlice";
import { Avatar, Button, Card, Grid, TextField } from "@mui/material";

export default function Profile() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: profile } = useSelector((state: RootState) => state.profile);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        language: "it",
        currency: "EUR",
    });

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

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

    return (
        <Card title="Modifica Profilo">
            <Grid container spacing={3}>
                <Grid item xs={12} display="flex" justifyContent="center">
                    <Avatar sx={{ width: 80, height: 80 }} src={profile?.avatar_url} />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Nome" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Cognome" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </Grid>

                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={() => dispatch(updateProfile(formData))}>
                        Salva Modifiche
                    </Button>
                </Grid>
            </Grid>
        </Card>
    );
}
