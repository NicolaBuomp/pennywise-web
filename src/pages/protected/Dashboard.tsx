import {useSelector} from "react-redux";
import {Skeleton} from "../../components/feedback";
import {RootState} from "../../store/store.ts";
import {Card} from "../../components/common";

export default function Dashboard() {
    const {profile, loading} = useSelector((state: RootState) => state.profile);

    return (
        <div className="p-8">
            <h1 className="text-3xl pb-5 font-bold text-[var(--color-text)]">Dashboard</h1>
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
