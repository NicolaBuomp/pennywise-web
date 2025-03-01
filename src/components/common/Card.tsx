import React from "react";

type CardProps = {
    title: string;
    subtitle?: string;
    onClick?: () => void;
    className?: string;
    children: React.ReactNode;
};

export default function Card({title, subtitle, children, onClick, className}: CardProps) {
    return (
        <div
            className={`p-6 rounded-xl shadow-lg glass ${className}  ${onClick ? "cursor-pointer" : ""}`}
            onClick={onClick}
        >
            <h2 className={`text-xl font-semibold text-[var(--color-text)] ${subtitle ? "mb-1" : "mb-3"}`}>
                {title}
            </h2>
            {subtitle && <p className="text-[var(--color-text-soft)] text-sm">{subtitle}</p>}
            {children}
        </div>
    );
}
