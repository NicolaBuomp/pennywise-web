import React from "react";

type InputProps = {
    name?: string;
    label?: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
};

export default function Input({type = "text", label, name, placeholder, value, onChange, className}: InputProps) {
    return (
        <>
            {label && <label className="text-sm font-semibold text-[var(--color-text)]">{label}</label>}
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full mt-1 px-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text)] placeholder-[var(--color-text-soft)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none glass ${className}`}
            />
        </>
    );
}
