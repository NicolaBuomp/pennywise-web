import { TextField } from "@mui/material";

type InputProps = {
    name?: string;
    label?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
};

export default function Input({ label, name, type = "text", placeholder, required, value, onChange, disabled }: InputProps) {
    return (
        <TextField
            label={label}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            value={value}
            onChange={onChange}
            disabled={disabled}
            fullWidth
            variant="outlined"
        />
    );
}
