// src/components/layout/Navbar.tsx
import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link, useNavigate} from 'react-router-dom';
import {signOut} from '../../store/auth/authSlice';
import {RootState} from '../../store/store';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {user} = useSelector((state: RootState) => state.auth);
    const {data: profile} = useSelector((state: RootState) => state.profile);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await dispatch(signOut());
        navigate('/login');
    };

    // Chiudi il dropdown quando si clicca fuori da esso
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                                <div className="ml-3 relative" ref={dropdownRef}>
                                    <div>
                                        <button
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="bg-white rounded-full flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                            <div className="flex items-center">
                                                <span
                                                    className="text-text-primary-light dark:text-text-primary-dark mr-3">
                                                    {profile?.displayName || user.email}
                                                </span>
                                                <div
                                                    className="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200">
                                                    <img
                                                        src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.displayName || user.email || 'Utente')}&background=F97A6B&color=fff`}
                                                        alt="Avatar"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <svg className="ml-2 h-5 w-5 text-gray-400"
                                                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     fill="currentColor">
                                                    <path fillRule="evenodd"
                                                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                          clipRule="evenodd"/>
                                                </svg>
                                            </div>
                                        </button>
                                    </div>

                                    {dropdownOpen && (
                                        <div
                                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                Il mio profilo
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    handleLogout();
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
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