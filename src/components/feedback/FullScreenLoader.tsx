import { Backdrop, CircularProgress, Typography } from "@mui/material";

export default function FullScreenLoader() {
    return (
        <Backdrop open={true} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <div style={{ textAlign: "center" }}>
                <CircularProgress color="inherit" />
                <Typography variant="body1" sx={{ mt: 2 }}>Caricamento in corso...</Typography>
            </div>
        </Backdrop>
    );
}
