// src/components/layout/Navbar.tsx
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from '../../store/auth/authSlice';
import { RootState } from '../../store/store';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        await dispatch(signOut());
        navigate('/login');
    };

    return (
        <nav className="bg-surface-light dark:bg-surface-dark shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/dashboard" className="text-xl font-bold text-primary">
                                Pennywise
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/dashboard"
                                className="border-transparent text-text-primary-light dark:text-text-primary-dark hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/groups"
                                className="border-transparent text-text-primary-light dark:text-text-primary-dark hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Gruppi
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                            {user && (
                                <div className="ml-3 relative">
                                    <div className="flex items-center">
                    <span className="text-text-primary-light dark:text-text-primary-dark mr-3">
                      {user.email}
                    </span>
                                        <button
                                            onClick={handleLogout}
                                            className="bg-primary text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;