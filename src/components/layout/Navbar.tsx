import { AppBar, Toolbar, Typography, Container } from "@mui/material";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
                <Container sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography 
                        variant="h6" 
                        component={Link} 
                        to="/dashboard" 
                        sx={{ textDecoration: "none", color: "primary.main", fontWeight: "bold" }}
                    >
                        Pennywise
                    </Typography>
                </Container>
            </Toolbar>
        </AppBar>
    );
}
