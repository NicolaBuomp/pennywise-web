// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getSession } from './store/auth/authSlice';

// Layout
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pagine pubbliche
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';

// Pagine protette
// import Dashboard from './pages/Dashboard';
// import Groups from './pages/Groups';
// import ShoppingLists from './pages/ShoppingLists';
// import Expenses from './pages/Expenses';
import NotFound from './pages/NotFound';

const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Carica la sessione utente all'avvio dell'app
        dispatch(getSession());
    }, [dispatch]);

    return (
        <Router>
            <Routes>
                {/* Percorsi pubblici */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Percorsi protetti */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                    {/*    <Route path="/dashboard" element={<Dashboard />} />*/}
                    {/*    <Route path="/groups" element={<Groups />} />*/}
                    {/*    <Route path="/groups/:groupId" element={<Groups />} />*/}
                    {/*    <Route path="/shopping-lists/:groupId?" element={<ShoppingLists />} />*/}
                    {/*    <Route path="/expenses/:groupId?" element={<Expenses />} />*/}
                    </Route>
                </Route>

                {/* Pagina 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

export default App;