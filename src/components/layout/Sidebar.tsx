import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import { FaBars, FaCog, FaSignOutAlt, FaTachometerAlt, FaUser } from "react-icons/fa";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { signOut } from "../../store/auth/authSlice";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);

    // Elementi del menu
    const menuItems = [
        { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
        { name: "Profilo", path: "/profile", icon: <FaUser /> },
        { name: "Impostazioni", path: "/settings", icon: <FaCog /> },
    ];

    return (
        <>
            {/* Pulsante per aprire la sidebar su mobile */}
            <IconButton
                onClick={() => setIsOpen(true)}
                sx={{ position: "fixed", top: 16, left: 16, zIndex: 1301, display: { lg: "none" } }}
            >
                <FaBars />
            </IconButton>

            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" },
                    display: { xs: "none", lg: "block" },
                }}
            >
                <List>
                    {menuItems.map((item) => (
                        <ListItemButton
                            key={item.path}
                            component={Link}
                            to={item.path}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    ))}
                </List>
                <ListItemButton onClick={() => dispatch(signOut())} sx={{ color: "error.main" }}>
                    <ListItemIcon>
                        <FaSignOutAlt />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </Drawer>

            {/* Drawer Mobile */}
            <Drawer
                open={isOpen}
                onClose={() => setIsOpen(false)}
                sx={{ [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" } }}
            >
                <List>
                    {menuItems.map((item) => (
                        <ListItemButton
                            key={item.path}
                            component={Link}
                            to={item.path}
                            selected={location.pathname === item.path}
                            onClick={() => setIsOpen(false)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    ))}
                </List>
                <ListItemButton onClick={() => dispatch(signOut())} sx={{ color: "error.main" }}>
                    <ListItemIcon>
                        <FaSignOutAlt />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </Drawer>
        </>
    );
}
