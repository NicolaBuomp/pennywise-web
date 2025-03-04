import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store/store.ts";
import {Button, Card, Input, Modal} from "../../components/common";
import {
    createGroup,
    fetchGroups,
    requestJoinGroup,
    resetGroupsError,
    searchGroupByTag,
    selectGroups,
    selectGroupsError,
    selectGroupsLoading,
} from "../../store/groups/groupsSlice.ts";
import {useNavigate} from "react-router-dom";


const generateTag = (name: string): string => {
    if (!name.trim()) return "";

    // Rimuoviamo caratteri non alfanumerici
    const cleanedName = name.replace(/[^a-zA-Z0-9]/g, "");
    const uppercaseName = cleanedName.toUpperCase();

    // Generiamo 4 cifre random
    const randomDigits = Math.floor(1000 + Math.random() * 9000);

    return `${uppercaseName}#${randomDigits}`;
};

export default function Dashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // ▶ Stato globale
    const groups = useSelector(selectGroups);
    const groupsLoading = useSelector(selectGroupsLoading);
    const groupsError = useSelector(selectGroupsError);

    // ▶ Stato locale: Ricerca
    const [searchTag, setSearchTag] = useState("");
    const [searchedGroup, setSearchedGroup] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // ▶ Stato locale: Creazione gruppo
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [requirePassword, setRequirePassword] = useState(false);
    const [password, setPassword] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [joinPassword, setJoinPassword] = useState("");

    // ▶ Stato locale: Richiesta di ingresso
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // ▶ Al mount, carichiamo i gruppi
    useEffect(() => {
        dispatch(fetchGroups());
        return () => {
            // Puliamo eventuali errori se il componente viene smontato
            dispatch(resetGroupsError());
        };
    }, [dispatch]);

    const handleSearchGroup = async () => {
        if (!searchTag.trim()) return;
        setIsSearching(true);
        setSearchError(null);
        

        try {
            const result = await dispatch(searchGroupByTag(searchTag)).unwrap();
            setSearchedGroup(result || null);

            if (!result) {
                setSearchError("Nessun gruppo trovato con questo TAG");
            }
        } catch (error: any) {
            setSearchError(error.message || "Si è verificato un errore durante la ricerca");
            setSearchedGroup(null);
        } finally {
            setIsSearching(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // CREAZIONE GRUPPI
    // ─────────────────────────────────────────────────────────────────────────────

    // Aggiorna il tag in base al nome
    const handleGroupNameChange = (value: string) => {
        setGroupName(value);
    };

    // Resetta il form di creazione
    const resetCreateGroupForm = () => {
        setGroupName("");
        setRequirePassword(false);
        setPassword("");
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return;
        setIsCreating(true);

        try {
            await dispatch(
                createGroup({
                    name: groupName,
                    ...(requirePassword ? {requirePassword, password} : {}),
                })
            ).unwrap();

            // Dopo la creazione, chiudiamo il modal e resettiamo i campi
            setIsCreateModalOpen(false);
            resetCreateGroupForm();

            // Eventuale notifica di successo (opzionale)
            alert("Gruppo creato con successo!");
        } catch (error: any) {
            alert(error.message || "Si è verificato un errore nella creazione del gruppo");
        } finally {
            setIsCreating(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // RICHIESTA DI INGRESSO
    // ─────────────────────────────────────────────────────────────────────────────

    const handleRequestJoin = async () => {
        if (!searchedGroup?.id) return;
        
        // Check if password is required but not provided
        if (searchedGroup.require_password && !joinPassword.trim()) {
            alert("Questo gruppo richiede una password per entrare.");
            return;
        }
        
        try {
            // Pass the password as a parameter to the action
            await dispatch(requestJoinGroup({
                groupId: searchedGroup.id,
                password: joinPassword
            })).unwrap();
            
            setIsRequestModalOpen(false);
            setJoinPassword(""); // Clear the password field
            alert("Richiesta inviata con successo!");
            setSearchedGroup(null); // Clear the searched group after request
            setSearchTag(""); // Clear the search field
        } catch (error: any) {
            alert(error.message || "Si è verificato un errore nell'invio della richiesta");
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────────

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">I tuoi gruppi</h2>

            {/* Pulsante per creare un nuovo gruppo */}
            <div className="flex justify-end mb-4">
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                    ➕ Crea Gruppo
                </Button>
            </div>

            {/* Campo di ricerca per TAG */}
            <div className="flex gap-2 mt-4 mb-6">
                <Input
                    type="text"
                    value={searchTag}
                    onChange={(e) => setSearchTag(e.target.value)}
                    placeholder="Cerca un gruppo per TAG"
                    className="border p-2 rounded-md w-full"
                    disabled={isSearching}
                />
                <Button
                    onClick={handleSearchGroup}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
                    disabled={isSearching || !searchTag.trim()}
                >
                    {isSearching ? "Cercando..." : "🔍 Cerca"}
                </Button>
            </div>

            {/* Eventuale messaggio di errore nella ricerca */}
            {searchError && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                    {searchError}
                </div>
            )}

            {/* Risultato ricerca */}
            {searchedGroup && (
                <div className="mb-6 mt-4">
                    <h3 className="text-lg font-medium mb-2">Risultato ricerca</h3>
                    <Card title={searchedGroup.name} className="border-2 border-green-400">
                        <p className="text-gray-600">TAG: {searchedGroup.tag}</p>
                        {searchedGroup.description && (
                            <p className="text-gray-600 mt-2">{searchedGroup.description}</p>
                        )}
                        <Button
                            onClick={() => setIsRequestModalOpen(true)}
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md"
                        >
                            ✋ Richiedi di entrare
                        </Button>
                    </Card>
                </div>
            )}

            {/* Separatore */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Lista gruppi dell'utente */}
            <h3 className="text-lg font-medium mb-4">Gruppi di cui sei membro</h3>
            {groupsLoading ? (
                <div className="text-center py-8">Caricamento gruppi in corso...</div>
            ) : groupsError ? (
                <div className="text-center py-8 text-red-600">
                    Errore: {groupsError}
                </div>
            ) : groups?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>Non sei ancora membro di nessun gruppo.</p>
                    <p className="mt-2">Crea un gruppo o cerca un gruppo per TAG per unirti!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {groups.map((group) => (
                        <Card
                            key={group.id}
                            title={group.name}
                            onClick={() => navigate(`/groups/${group.id}`)}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <p className="text-sm text-gray-600">TAG: {group.tag}</p>
                            {group.description && (
                                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                                Ruolo: <strong>{group.userRole || "Membro"}</strong>
                            </p>
                            {group.membersCount && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Membri: <strong>{group.membersCount}</strong>
                                </p>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Modale per la creazione del gruppo */}
            <Modal
                title="Crea un nuovo gruppo"
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            >
                <Input
                    type="text"
                    value={groupName}
                    onChange={(e) => handleGroupNameChange(e.target.value)}
                    placeholder="Nome del gruppo"
                    className="w-full border p-2 rounded-md"
                />

                {requirePassword && (
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password del gruppo"
                        className="w-full border p-2 rounded-md mt-2"
                    />
                )}

                {/* Checkbox per protezione con password */}
                <div className="mt-3 flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={requirePassword}
                        onChange={() => setRequirePassword(!requirePassword)}
                        className="h-5 w-5"
                    />
                    <span>Proteggi con password?</span>
                </div>



                <Button
                    onClick={handleCreateGroup}
                    className="mt-4 w-full bg-green-500 text-white py-2 rounded-md"
                    disabled={
                        !groupName.trim() ||
                        (requirePassword && !password.trim()) ||
                        isCreating
                    }
                >
                    {isCreating ? "Creando..." : "➕ Crea Gruppo"}
                </Button>
            </Modal>

            {/* Modale di conferma per la richiesta di ingresso */}
            <Modal
    title="Richiedi di entrare"
    isOpen={isRequestModalOpen}
    onClose={() => {
        setIsRequestModalOpen(false);
        setJoinPassword(""); // Clear password when closing
    }}
>
    <div className="p-4">
        <p className="mb-4">
            Vuoi richiedere di entrare nel gruppo <strong>{searchedGroup?.name}</strong>?
        </p>
        <p className="text-sm text-gray-600 mb-4">
            La tua richiesta dovrà essere approvata dall'amministratore del gruppo.
        </p>
        
        {/* Mostra campo password solo se necessario */}
        {searchedGroup?.require_password && (
            <div className="mb-4">
                <p className="text-sm font-semibold mb-2">
                    ⚠️ Questo gruppo è protetto da password
                </p>
                <Input
                    type="password"
                    label="Password del gruppo"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    placeholder="Inserisci la password del gruppo"
                    className="w-full"
                    required
                />
            </div>
        )}
        
        <div className="flex justify-end gap-2 mt-4">
            <Button
                onClick={() => {
                    setIsRequestModalOpen(false);
                    setJoinPassword("");
                }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
            >
                Annulla
            </Button>
            <Button
                onClick={handleRequestJoin}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
                disabled={searchedGroup?.require_password && !joinPassword.trim()}
            >
                Conferma
            </Button>
        </div>
    </div>
</Modal>
        </div>
    );
}
