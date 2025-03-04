import { Card as MUICard, CardContent, CardHeader, Skeleton, Box } from "@mui/material";

type CardProps = {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    loading?: boolean;
    onClick?: () => void;
};

export default function Card({ title, subtitle, children, onClick, loading = false }: CardProps) {
    return (
        <MUICard onClick={onClick} sx={{ cursor: onClick ? "pointer" : "default" }}>
            <CardHeader
                title={loading ? <Skeleton variant="text" width="60%" height={24} /> : title}
                subheader={loading ? <Skeleton variant="text" width="40%" height={18} /> : subtitle}
            />
            <CardContent>
                {loading ? (
                    <>
                        <Skeleton variant="text" width="100%" height={18} />
                        <Skeleton variant="text" width="80%" height={18} sx={{ mt: 1 }} />
                        <Skeleton variant="rectangular" width="100%" height={120} sx={{ mt: 2, borderRadius: 1 }} />
                    </>
                ) : (
                    <Box>
                        {children}
                    </Box>
                )}
            </CardContent>
        </MUICard>
    );
}