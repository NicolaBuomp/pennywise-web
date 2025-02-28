import React from "react";

type ButtonProps = {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "glass" | "icon" | "floating";
    className?: string;
};

export default function Button({children, onClick, variant = "primary", className}: ButtonProps) {
    const baseClass =
        "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all duration-200 ease-in-out cursor-pointer";

    const variants = {
        primary: "bg-[var(--color-primary)] text-white hover:brightness-110 shadow-lg",
        secondary: "bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",
        glass: "bg-[var(--theme-glass-bg)] backdrop-blur-md border border-[var(--theme-glass-border)] shadow-lg text-[var(--color-text)]",
        icon: "p-2 rounded-full bg-transparent hover:bg-[var(--color-subtle)]",
        floating: "p-3 rounded-full shadow-lg bg-[var(--color-primary)] text-white fixed bottom-6 right-6",
    };

    return (
        <button onClick={onClick} className={`${baseClass} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
}
