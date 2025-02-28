import React from "react";

type CardProps = {
    title: string;
    children: React.ReactNode;
};

export default function Card({title, children}: CardProps) {
    return (
        <div className="p-6 rounded-xl shadow-lg glass">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{title}</h2>
            {children}
        </div>
    );
}
