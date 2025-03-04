import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";

type AlertProps = {
    message: string;
    onConfirm: () => void;
    onClose: () => void;
    open: boolean;
};

export default function Alert({ message, onConfirm, onClose, open }: AlertProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Conferma</DialogTitle>
            <DialogContent>{message}</DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Annulla</Button>
                <Button onClick={onConfirm} color="primary" variant="contained">Conferma</Button>
            </DialogActions>
        </Dialog>
    );
}
