import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';

// Importare le pagine dell'applicazione
// ... altre importazioni di pagine

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotte pubbliche */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Rotte pubbliche ristrette (non accessibili se autenticati) */}
          <Route element={<PublicRoute restricted />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>
        
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          {/* Altre rotte protette */}
        </Route>
        
        {/* Pagina 404 Not Found */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
