// src/components/layout/Sidebar.tsx
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { RootState } from '../../store/store';

const Sidebar = () => {
    const { groups } = useSelector((state: RootState) => state.groups);

    return (
        <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark min-h-screen">
            <div className="p-4">
                <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                    Menu
                </h2>
                <nav className="space-y-2">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center p-2 rounded-md ${
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'text-text-primary-light dark:text-text-primary-dark hover:bg-background-light dark:hover:bg-background-dark'
                            }`
                        }
                    >
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/groups"
                        className={({ isActive }) =>
                            `flex items-center p-2 rounded-md ${
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'text-text-primary-light dark:text-text-primary-dark hover:bg-background-light dark:hover:bg-background-dark'
                            }`
                        }
                    >
                        <span>I miei gruppi</span>
                    </NavLink>

                    {groups.length > 0 && (
                        <div className="pt-4">
                            <h3 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                Gruppi recenti
                            </h3>
                            <div className="space-y-1">
                                {groups.slice(0, 5).map((group) => (
                                    <NavLink
                                        key={group.id}
                                        to={`/groups/${group.id}`}
                                        className={({ isActive }) =>
                                            `flex items-center p-2 rounded-md ${
                                                isActive
                                                    ? 'bg-primary text-white'
                                                    : 'text-text-primary-light dark:text-text-primary-dark hover:bg-background-light dark:hover:bg-background-dark'
                                            }`
                                        }
                                    >
                                        <span>{group.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;