import React from "react";

type SelectProps = {
    name?: string;
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    className?: string;
};

export default function Select({label, value, name, onChange, options, className}: SelectProps) {
    return (
        <>
        {label && <label className="text-sm font-semibold text-[var(--color-text)]">{label}</label>}
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full mt-1 px-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none glass ${className}`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </>
    );
}
