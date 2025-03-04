import { Button as MUIButton } from "@mui/material";
import { Link } from "react-router-dom";

type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "contained" | "outlined" | "text";
    color?: "primary" | "secondary";
    disabled?: boolean;
    to?: string;
};

export default function Button({ children, onClick, variant = "contained", color = "primary", disabled, to }: ButtonProps) {
    if (to) {
        return (
            <MUIButton component={Link} to={to} variant={variant} color={color} disabled={disabled}>
                {children}
            </MUIButton>
        );
    }

    return (
        <MUIButton onClick={onClick} variant={variant} color={color} disabled={disabled}>
            {children}
        </MUIButton>
    );
}
