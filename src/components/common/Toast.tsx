import { Snackbar, Alert as MUIAlert } from "@mui/material";

type ToastProps = {
    message: string;
    type?: "success" | "error" | "info";
    open: boolean;
    onClose: () => void;
};

export default function Toast({ message, type = "info", open, onClose }: ToastProps) {
    return (
        <Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
            <MUIAlert onClose={onClose} severity={type} variant="filled">
                {message}
            </MUIAlert>
        </Snackbar>
    );
}
