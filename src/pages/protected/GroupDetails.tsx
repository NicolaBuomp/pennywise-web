import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../../store/store.ts";
import {
    approveJoinRequest,
    deleteGroup,
    denyJoinRequest,
    fetchGroupDetails,
    removeMember,
    resetCurrentGroup,
    resetGroupsError,
    selectCurrentGroup,
    selectGroupsError,
    selectGroupsLoading,
    updateGroup,
} from "../../store/groups/groupsSlice.ts";
import {Button, Card, Input, Modal} from "../../components/common";

/**
 * Page: Dettagli di un gruppo
 * - Mostra info gruppo
 * - Permette di modificare nome/descrizione se admin
 * - Permette di eliminare il gruppo se admin
 * - Visualizza membri e richieste di ingresso
 */
export default function GroupDetails() {
    const {groupId} = useParams<{ groupId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // ▶ Stato globale
    const group = useSelector(selectCurrentGroup);
    const isLoading = useSelector(selectGroupsLoading);
    const error = useSelector(selectGroupsError);

    // ▶ Stati locali
    // ─────────────────────────────────────────────────────────────────────────────
    // Modale di conferma per azioni distruttive
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        action: string | null;
        title: string;
        message: string;
        data: any;
    }>({
        isOpen: false,
        action: null,
        title: "",
        message: "",
        data: null,
    });

    // Modal "modifica gruppo"
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: "",
        require_password: false,
        password: "",
    });

    // ▶ Lifecycle
    // ─────────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (groupId) {
            dispatch(fetchGroupDetails(groupId));
        }
        return () => {
            dispatch(resetCurrentGroup());
            dispatch(resetGroupsError());
        };
    }, [dispatch, groupId]);

    // Quando i dettagli del gruppo cambiano, popola il form di modifica
    useEffect(() => {
        if (group) {
            setEditFormData({
                name: group.name || "",
                require_password: group.require_password || false,
                password: "", // Password non viene mai restituita dall'API
            });
        }
    }, [group]);

    // ─────────────────────────────────────────────────────────────────────────────
    // Handlers di conferma azione
    // ─────────────────────────────────────────────────────────────────────────────
    const handleApproveRequest = (requestId: string) => {
        setConfirmationModal({
            isOpen: true,
            action: "approve",
            title: "Conferma approvazione",
            message: "Sei sicuro di voler approvare questa richiesta di ingresso?",
            data: requestId,
        });
    };

    const handleDenyRequest = (requestId: string) => {
        setConfirmationModal({
            isOpen: true,
            action: "deny",
            title: "Conferma rifiuto",
            message: "Sei sicuro di voler rifiutare questa richiesta di ingresso?",
            data: requestId,
        });
    };

    const handleRemoveMember = (userId: string, userName: string) => {
        setConfirmationModal({
            isOpen: true,
            action: "remove",
            title: "Conferma rimozione",
            message: `Rimuovere ${userName || "questo utente"} dal gruppo?`,
            data: userId,
        });
    };

    const handleDeleteGroup = () => {
        setConfirmationModal({
            isOpen: true,
            action: "delete",
            title: "Conferma eliminazione",
            message:
                "Sei sicuro di voler eliminare questo gruppo? Questa azione è irreversibile.",
            data: null,
        });
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // Modifica form
    // ─────────────────────────────────────────────────────────────────────────────

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const {name, value, type, checked} = e.target as HTMLInputElement;
        
        // Gestisce i checkbox
        if (type === 'checkbox') {
            setEditFormData((prev) => ({...prev, [name]: checked}));
            
            // Se disabilita la password, resetta il campo password
            if (name === 'require_password' && !checked) {
                setEditFormData((prev) => ({...prev, password: ''}));
            }
        } else {
            setEditFormData((prev) => ({...prev, [name]: value}));
        }
    };

    const handleSaveChanges = async () => {
        if (!groupId) return;
        
        // Valida il form
        if (!editFormData.name.trim()) {
            alert("Il nome del gruppo è obbligatorio.");
            return;
        }
        
        if (editFormData.require_password && !editFormData.password.trim()) {
            alert("La password è obbligatoria quando l'accesso è protetto da password.");
            return;
        }
        
        try {
            // Prepara i dati da inviare
            const groupData: any = {
                name: editFormData.name,
                require_password: editFormData.require_password,
            };
            
            // Aggiungi password solo se necessario
            if (editFormData.require_password) {
                groupData.password = editFormData.password;
            }
            
            await dispatch(
                updateGroup({
                    groupId,
                    groupData
                })
            ).unwrap();
            setIsEditing(false);
            alert("Gruppo aggiornato con successo!");
        } catch (err: any) {
            alert(err.message || "Si è verificato un errore durante l'aggiornamento.");
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // Conferma l'azione selezionata nel modal
    // ─────────────────────────────────────────────────────────────────────────────
    const confirmAction = async () => {
        if (!groupId) return;
        const {action, data} = confirmationModal;

        try {
            switch (action) {
                case "approve":
                    if (data) {
                        await dispatch(approveJoinRequest({groupId, requestId: data})).unwrap();
                        alert("Richiesta approvata con successo!");
                    }
                    break;
                case "deny":
                    if (data) {
                        await dispatch(denyJoinRequest({groupId, requestId: data})).unwrap();
                        alert("Richiesta rifiutata con successo!");
                    }
                    break;
                case "remove":
                    if (data) {
                        await dispatch(removeMember({groupId, userId: data})).unwrap();
                        alert("Membro rimosso con successo!");
                    }
                    break;
                case "delete":
                    await dispatch(deleteGroup(groupId)).unwrap();
                    alert("Gruppo eliminato con successo!");
                    navigate("/dashboard");
                    return; // Evitiamo di ri-chiudere manualmente il modal (usciremo dalla pagina)
            }
        } catch (error: any) {
            alert(error.message || "Si è verificato un errore.");
        }
        setConfirmationModal({...confirmationModal, isOpen: false});
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // Rendering
    // ─────────────────────────────────────────────────────────────────────────────

    if (isLoading) {
        return <div className="p-8 text-center">Caricamento dettagli gruppo...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600 mb-4">Si è verificato un errore: {error}</p>
                {groupId && (
                    <Button
                        onClick={() => dispatch(fetchGroupDetails(groupId))}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                        Riprova
                    </Button>
                )}
            </div>
        );
    }

    if (!group) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600 mb-4">Gruppo non trovato</p>
                <Button
                    onClick={() => navigate("/dashboard")}
                >
                    Torna alla dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Dettagli Gruppo</h2>
                <Button
                    onClick={() => navigate("/dashboard")}
                >
                    ← Torna alla dashboard
                </Button>
            </div>

            {/* Card Principale: Dettagli o Modifica */}
            <Card title={isEditing ? "Modifica Gruppo" : `Gruppo: ${group.name}`} className="mb-6">
                {isEditing ? (
                    <div className="space-y-3">
                        {/* Nome gruppo */}
                        <Input
                            label="Nome del gruppo"
                            name="name"
                            value={editFormData.name}
                            onChange={handleInputChange}
                            className="w-full"
                            required
                        />
                        
                        {/* Richiedi password */}
                        <div className="flex items-center mt-4">
                            <input
                                type="checkbox"
                                id="require_password"
                                name="require_password"
                                checked={editFormData.require_password}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="require_password" className="ml-2 block text-sm text-gray-900">
                                Richiedi password per entrare nel gruppo
                            </label>
                        </div>
                        
                        {/* Campo password (visibile solo se richiedi password è attivo) */}
                        {editFormData.require_password && (
                            <div className="mt-4">
                                <Input
                                    type="password"
                                    label="Password del gruppo"
                                    name="password"
                                    value={editFormData.password}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    required={editFormData.require_password}
                                    placeholder="Inserisci una password per l'accesso al gruppo"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Gli utenti dovranno fornire questa password per entrare nel gruppo
                                </p>
                            </div>
                        )}
                        
                        {/* Pulsanti */}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                            >
                                Annulla
                            </Button>
                            <Button
                                onClick={handleSaveChanges}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                disabled={!editFormData.name.trim() || 
                                        (editFormData.require_password && !editFormData.password.trim())}
                            >
                                Salva Modifiche
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-600">
                            TAG: <strong>{group.tag}</strong>
                        </p>
                        <p className="text-gray-600 mt-2">
                            Creato il: {new Date(group.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                            Ruolo: <strong>{group.user_role}</strong>
                        </p>
                        <p className="text-gray-600">
                            Accesso: <strong>{group.require_password ? 'Protetto da password' : 'Libero'}</strong>
                        </p>

                        {group.user_role === "admin" && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                >
                                    ✏️ Modifica
                                </Button>
                                <Button
                                    onClick={handleDeleteGroup}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                >
                                    🗑️ Elimina gruppo
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Sezione membri */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Membri del gruppo</h3>
                {!group.members || group.members.length === 0 ? (
                    <p className="text-gray-500">Nessun membro nel gruppo.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.members.map((member) => (
                            <Card key={member.id} title={member.full_name || "Utente"}>
                                <p className="text-sm text-gray-600">
                                    Ruolo: {member.role || "Membro"}
                                </p>
                                {/* Se siamo admin, possiamo rimuovere i membri (tranne admin) */}
                                {group.user_role === "admin" && member.role !== "admin" && (
                                    <Button
                                        onClick={() => handleRemoveMember(member.id, member.full_name)}
                                        className="mt-2 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200"
                                    >
                                        ❌ Rimuovi
                                    </Button>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Sezione richieste di ingresso (solo admin) */}
            {group.user_role === "admin" && group.join_requests && group.join_requests.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Richieste di ingresso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.join_requests
                            .filter((r) => r.status === "pending")
                            .map((request) => (
                                <Card key={request.id} title={`Richiesta da: ${request.user_info?.full_name || "Utente"}`}>
                                    <p className="text-sm text-gray-600">Stato: {request.status}</p>
                                    <p className="text-sm text-gray-600">
                                        Inviata il: {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="mt-3 flex">
                                        <Button
                                            onClick={() => handleApproveRequest(request.id)}
                                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mr-2"
                                        >
                                            ✅ Approva
                                        </Button>
                                        <Button
                                            onClick={() => handleDenyRequest(request.id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                        >
                                            ❌ Rifiuta
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                    </div>
                </div>
            )}

            {/* Modale di conferma */}
            <Modal
                title={confirmationModal.title}
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal({...confirmationModal, isOpen: false})}
            >
                <div className="p-4">
                    <p className="text-gray-600 mb-6">{confirmationModal.message}</p>
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={() => setConfirmationModal({...confirmationModal, isOpen: false})}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                        >
                            Annulla
                        </Button>
                        <Button
                            onClick={confirmAction}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Conferma
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}