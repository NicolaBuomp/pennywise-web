import { FormControl, InputLabel, MenuItem, Select as MUISelect } from "@mui/material";

type SelectProps = {
    name?: string;
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<{ value: unknown }>) => void;
    options: { value: string; label: string }[];
};

export default function Select({ label, value, name, onChange, options }: SelectProps) {
    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <MUISelect name={name} value={value} onChange={onChange}>
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </MUISelect>
        </FormControl>
    );
}
