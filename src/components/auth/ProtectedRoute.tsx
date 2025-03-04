import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getSession } from '../../store/auth/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = () => {
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!user) {
                await dispatch(getSession());
            }
            setIsChecking(false);
        };
        checkAuth();
    }, [dispatch, user]);

    if (loading || isChecking) {
        return (
            <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                minHeight="100vh"
                bgcolor="background.default"
            >
                <CircularProgress color="primary" />
                <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
                    Caricamento...
                </Typography>
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const isEmailConfirmed = user.email_confirmed_at !== null && user.email_confirmed_at !== undefined;
    if (!isEmailConfirmed && location.pathname !== '/email-verification') {
        return <Navigate to="/email-verification" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
