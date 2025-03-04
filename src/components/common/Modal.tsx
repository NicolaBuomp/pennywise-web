import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

type ModalProps = {
    title?: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export default function Modal({ title, isOpen, onClose, children }: ModalProps) {
    return (
        <Dialog open={isOpen} onClose={onClose}>
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Chiudi</Button>
            </DialogActions>
        </Dialog>
    );
}
