import {useSelector} from "react-redux";
import {Skeleton} from "../../components/feedback";
import {RootState} from "../../store/store.ts";
import {Card} from "../../components/common";

export default function Dashboard() {
    const {data: profile, loading, error} = useSelector((state: RootState) => state.profile);

    return (
        <div className="p-2.5">
            {loading ? (
                <Skeleton width="100%" height="100px"/>
            ) : (
                <Card title='Profilo Utente'>
                    <p className="text-[var(--color-text-soft)] mt-2">Benvenuto, {profile?.full_name || "Utente"}!</p>
                </Card>
            )}
        </div>
    );
}
