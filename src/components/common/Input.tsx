import React from "react";

type InputProps = {
    name?: string;
    label?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
};

export default function Input({
                                  type = "text",
                                  label,
                                  name,
                                  placeholder,
                                  required,
                                  value,
                                  onChange,
                                  disabled,
                                  className
                              }: InputProps) {
    return (
        <>
            {label && <label className="text-sm font-semibold text-[var(--color-text)]">{label}</label>}
            <input
                name={name}
                required={required}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full mt-1 px-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text)] placeholder-[var(--color-text-soft)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none glass ${className}`}
            />
        </>
    );
}
