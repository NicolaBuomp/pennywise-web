export default function Skeleton({width = "100%", height = "20px"}) {
    return (
        <div
            className="animate-pulse bg-[var(--color-subtle)] rounded-md"
            style={{width, height}}
        ></div>
    );
}
