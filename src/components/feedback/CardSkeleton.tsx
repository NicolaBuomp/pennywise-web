import Skeleton from "./Skeleton.tsx";

export default function CardSkeleton() {
    return (
        <div className="p-6 rounded-xl shadow-lg glass space-y-3">
            <Skeleton width="60%" height="24px"/>
            <Skeleton width="100%" height="18px"/>
            <Skeleton width="80%" height="18px"/>
        </div>
    );
}
