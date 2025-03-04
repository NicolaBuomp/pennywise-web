import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout() {
    return (
        <Box display="flex" height="100vh">
            {/* Sidebar */}
            <Sidebar />

            {/* Contenuto principale */}
            <Box display="flex" flexDirection="column" flex={1} bgcolor="background.default">
                {/* Navbar */}
                <Navbar />

                {/* Contenuto dinamico delle pagine */}
                <Container sx={{ py: 4, flexGrow: 1, overflowY: "auto", minHeight: "calc(100vh - 56px)" }}>
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
}
