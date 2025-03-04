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

// Material UI imports (per i componenti che non hai ancora personalizzato)
import {
    Box, CircularProgress, Checkbox, Divider, 
    FormControlLabel, Stack, Typography
} from "@mui/material";
import { ArrowBack, Edit, Delete, Check, Close } from "@mui/icons-material";

// Componenti personalizzati
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";

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
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>Caricamento dettagli gruppo...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="body1" color="error" sx={{ mb: 2 }}>
                    Si è verificato un errore: {error}
                </Typography>
                {groupId && (
                    <Button onClick={() => dispatch(fetchGroupDetails(groupId))}>
                        Riprova
                    </Button>
                )}
            </Box>
        );
    }

    if (!group) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="body1" color="error" sx={{ mb: 2 }}>
                    Gruppo non trovato
                </Typography>
                <Button onClick={() => navigate("/dashboard")}>
                    Torna alla dashboard
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Dettagli Gruppo</Typography>
                <Button 
                    variant="outlined"
                    onClick={() => navigate("/dashboard")}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowBack sx={{ mr: 1 }} /> 
                        Torna alla dashboard
                    </Box>
                </Button>
            </Box>

            {/* Card Principale: Dettagli o Modifica */}
            <Card 
                title={isEditing ? "Modifica Gruppo" : `Gruppo: ${group.name}`}
            >
                {isEditing ? (
                    <Stack spacing={3}>
                        {/* Nome gruppo */}
                        <Input
                            label="Nome del gruppo"
                            name="name"
                            value={editFormData.name}
                            onChange={handleInputChange}
                            required={true}
                        />
                        
                        {/* Richiedi password */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="require_password"
                                    checked={editFormData.require_password}
                                    onChange={handleInputChange}
                                />
                            }
                            label="Richiedi password per entrare nel gruppo"
                        />
                        
                        {/* Campo password (visibile solo se richiedi password è attivo) */}
                        {editFormData.require_password && (
                            <Box>
                                <Input
                                    type="password"
                                    label="Password del gruppo"
                                    name="password"
                                    value={editFormData.password}
                                    onChange={handleInputChange}
                                    required={editFormData.require_password}
                                    placeholder="Inserisci una password per l'accesso al gruppo"
                                />
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                    Gli utenti dovranno fornire questa password per entrare nel gruppo
                                </Typography>
                            </Box>
                        )}
                        
                        {/* Pulsanti */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={() => setIsEditing(false)}
                            >
                                Annulla
                            </Button>
                            <Button
                                onClick={handleSaveChanges}
                                disabled={!editFormData.name.trim() || 
                                        (editFormData.require_password && !editFormData.password.trim())}
                            >
                                Salva Modifiche
                            </Button>
                        </Box>
                    </Stack>
                ) : (
                    <>
                        <Typography variant="body1" color="textSecondary">
                            TAG: <Box component="span" fontWeight="bold">{group.tag}</Box>
                        </Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                            Creato il: {new Date(group.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Ruolo: <Box component="span" fontWeight="bold">{group.user_role}</Box>
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Accesso: <Box component="span" fontWeight="bold">
                            {group.require_password ? 'Protetto da password' : 'Libero'}
                            </Box>
                        </Typography>

                        {group.user_role === "admin" && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Edit sx={{ mr: 1 }} /> Modifica
                                        </Box>
                                    </Button>
                                    <Button
                                        color="secondary"
                                        onClick={handleDeleteGroup}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Delete sx={{ mr: 1 }} /> Elimina gruppo
                                        </Box>
                                    </Button>
                                </Box>
                            </>
                        )}
                    </>
                )}
            </Card>

            {/* Sezione membri */}
<Box sx={{ mb: 4 }}>
    <Typography variant="h5" sx={{ mb: 2 }}>Membri del gruppo</Typography>
    {!group.members || group.members.length === 0 ? (
        <Typography variant="body2" color="textSecondary">Nessun membro nel gruppo.</Typography>
    ) : (
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
            {group.members.map((member) => (
                <Box key={member.id} sx={{ width: { xs: '100%', md: '48%' }, flexGrow: 1 }}>
                    <Card title={member.full_name || "Utente"}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                                Ruolo: 
                            </Typography>
                            <Badge text={member.role || "Membro"} />
                        </Box>
                        {/* Se siamo admin, possiamo rimuovere i membri (tranne admin) */}
                        {group.user_role === "admin" && member.role !== "admin" && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleRemoveMember(member.id, member.full_name)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                    <Close sx={{ mr: 1 }} /> Rimuovi
                                </Box>
                            </Button>
                        )}
                    </Card>
                </Box>
            ))}
        </Stack>
    )}
</Box>

{/* Sezione richieste di ingresso (solo admin) */}
{group.user_role === "admin" && group.join_requests && group.join_requests.length > 0 && (
    <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Richieste di ingresso</Typography>
        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
            {group.join_requests
                .filter((r) => r.status === "pending")
                .map((request) => (
                    <Box key={request.id} sx={{ width: { xs: '100%', md: '48%' }, flexGrow: 1 }}>
                        <Card title={`Richiesta da: ${request.user_info?.full_name || "Utente"}`}>
                            <Typography variant="body2" color="textSecondary">
                                Stato: {request.status}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Inviata il: {new Date(request.created_at).toLocaleDateString()}
                            </Typography>
                            <Box sx={{ display: 'flex', mt: 2 }}>
                                <Button
                                    onClick={() => handleApproveRequest(request.id)}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                        <Check sx={{ mr: 1 }} /> Approva
                                    </Box>
                                </Button>
                                <Button
                                    color="secondary"
                                    onClick={() => handleDenyRequest(request.id)}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Close sx={{ mr: 1 }} /> Rifiuta
                                    </Box>
                                </Button>
                            </Box>
                        </Card>
                    </Box>
                ))}
        </Stack>
    </Box>
)}

            {/* Modale di conferma */}
            <Modal
                title={confirmationModal.title}
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal({...confirmationModal, isOpen: false})}
            >
                <Typography>{confirmationModal.message}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                    <Button 
                        variant="outlined"
                        onClick={() => setConfirmationModal({...confirmationModal, isOpen: false})}
                    >
                        Annulla
                    </Button>
                    <Button 
                        onClick={confirmAction}
                    >
                        Conferma
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
}