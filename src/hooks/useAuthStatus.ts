// src/hooks/useAuthStatus.ts
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { getSession } from '../store/auth/authSlice';
import { supabase } from '../lib/supabase';

/**
 * Hook personalizzato per recuperare e monitorare lo stato di autenticazione,
 * con particolare attenzione allo stato di verifica dell'email.
 */
const useAuthStatus = () => {
    const { user, loading: reduxLoading } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    // Verifica lo stato dell'email
    const checkEmailVerification = async () => {
        try {
            setLoading(true);

            if (!user) {
                await dispatch(getSession());
                return;
            }

            // Controlla se l'email è verificata in base ai dati in Redux
            if (user.email_confirmed_at) {
                setIsEmailVerified(true);
            } else {
                // Se non è verificata, fai un controllo diretto con Supabase
                // per assicurarti di avere i dati più aggiornati
                const { data } = await supabase.auth.getUser();

                if (data.user?.email_confirmed_at) {
                    setIsEmailVerified(true);
                    // Aggiorna lo stato in Redux
                    await dispatch(getSession());
                } else {
                    setIsEmailVerified(false);
                }
            }

            setLastChecked(new Date());
        } catch (error) {
            console.error('Error checking email verification status:', error);
            setIsEmailVerified(false);
        } finally {
            setLoading(false);
        }
    };

    // Controlla lo stato all'avvio e quando cambia l'utente
    useEffect(() => {
        checkEmailVerification();
    }, [user?.id]); // Verifica quando cambia l'ID utente

    // Funzione per forzare un nuovo controllo
    const refreshStatus = () => {
        checkEmailVerification();
    };

    return {
        user,
        isEmailVerified,
        loading: loading || reduxLoading,
        lastChecked,
        refreshStatus
    };
};

export default useAuthStatus;