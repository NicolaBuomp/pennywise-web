// src/components/auth/ProtectedRoute.tsx
import {useEffect, useState} from 'react';
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../store/store';
import {getSession} from '../../store/auth/authSlice';

const ProtectedRoute = () => {
    const {user, loading} = useSelector((state: RootState) => state.auth);
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
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">Caricamento...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }

    const isEmailConfirmed = user.email_confirmed_at !== null && user.email_confirmed_at !== undefined;
    if (!isEmailConfirmed && location.pathname !== '/email-verification') {
        return <Navigate to="/email-verification" replace/>;
    }

    return <Outlet/>;
};

export default ProtectedRoute;
