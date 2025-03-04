import { Chip } from "@mui/material";

type BadgeProps = {
    text: string;
    color?: "primary" | "secondary" | "default";
};

export default function Badge({ text, color = "primary" }: BadgeProps) {
    return <Chip label={text} color={color} />;
}
