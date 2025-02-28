import React from "react";

type CardProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
};

export default function Card({title, subtitle, children}: CardProps) {
    return (
        <div className="p-6 rounded-xl shadow-lg glass">
            <h2 className={`text-xl font-semibold text-[var(--color-text)] ${subtitle ? "mb-1" : "mb-3"}`}>
                {title}
            </h2>
            {subtitle && (
                <p className="text-[var(--color-text-soft)] text-sm">{subtitle}</p>
            )}
            {children}
        </div>
    );
}
