import { Skeleton as MUISkeleton } from "@mui/material";

export default function Skeleton({ width = "100%", height = 20 }) {
    return <MUISkeleton variant="rectangular" width={width} height={height} />;
}
