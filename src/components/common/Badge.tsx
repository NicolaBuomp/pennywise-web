type BadgeProps = {
    text: string;
    color?: "primary" | "secondary" | "accent";
};

export default function Badge({text, color = "primary"}: BadgeProps) {
    const colors = {
        primary: "bg-[var(--color-primary)] text-white",
        secondary: "bg-[var(--color-secondary)] text-white",
        accent: "bg-[var(--color-accent)] text-white",
    };

    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[color]}`}>{text}</span>;
}
