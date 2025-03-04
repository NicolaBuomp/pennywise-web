import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/store";
import { useNavigate } from "react-router-dom";
import {
    createGroup,
    fetchGroups,
    requestJoinGroup,
    resetGroupsError,
    searchGroupByTag,
    selectGroups,
    selectGroupsError,
    selectGroupsLoading,
} from "../../store/groups/groupsSlice";
import { Card, Input, Modal, Button, Badge } from "../../components/common";
import { Stack, Box, Typography, FormControlLabel, Checkbox } from "@mui/material";
import { Spinner } from "../../components/feedback";

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

    useEffect(() => {
        dispatch(fetchGroups());
        return () => {
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
            if (!result) setSearchError("Nessun gruppo trovato con questo TAG");
        } catch (error: any) {
            setSearchError(error.message || "Errore nella ricerca");
            setSearchedGroup(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return;
        setIsCreating(true);

        try {
            await dispatch(
                createGroup({
                    name: groupName,
                    ...(requirePassword ? { requirePassword, password } : {}),
                })
            ).unwrap();

            setIsCreateModalOpen(false);
            setGroupName("");
            setRequirePassword(false);
            setPassword("");
        } catch (error: any) {
            alert(error.message || "Errore nella creazione del gruppo");
        } finally {
            setIsCreating(false);
        }
    };

    const handleRequestJoin = async () => {
        if (!searchedGroup?.id) return;
        
        if (searchedGroup.require_password && !joinPassword.trim()) {
            alert("Questo gruppo richiede una password per entrare.");
            return;
        }
        
        try {
            await dispatch(requestJoinGroup({
                groupId: searchedGroup.id,
                password: joinPassword
            })).unwrap();
            
            setIsRequestModalOpen(false);
            setJoinPassword("");
            alert("Richiesta inviata con successo!");
            setSearchedGroup(null);
            setSearchTag("");
        } catch (error: any) {
            alert(error.message || "Errore nell'invio della richiesta");
        }
    };

    return (
        <Stack spacing={3} mt={4} width="100%" maxWidth="800px" mx="auto">
            <Typography variant="h4">I tuoi gruppi</Typography>

            {/* Pulsante Crea Gruppo */}
            <Box display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary" onClick={() => setIsCreateModalOpen(true)}>
                    Crea Gruppo
                </Button>
            </Box>

            {/* Campo di ricerca per TAG */}
            <Stack direction="row" spacing={2}>
                <Input 
                    label="Cerca un gruppo per TAG" 
                    value={searchTag} 
                    onChange={(e) => setSearchTag(e.target.value)}
                    disabled={isSearching}
                />
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handleSearchGroup} 
                    disabled={isSearching || !searchTag.trim()}
                >
                    {isSearching ? <Spinner /> : "Cerca"}
                </Button>
            </Stack>

            {searchError && <Typography color="error">{searchError}</Typography>}

            {/* Risultato ricerca */}
            {searchedGroup && (
                <Card title={searchedGroup.name}>
                    <Typography variant="body2">TAG: {searchedGroup.tag}</Typography>
                    <Button variant="contained" color="secondary" onClick={() => setIsRequestModalOpen(true)}>
                        ✋ Richiedi di entrare
                    </Button>
                </Card>
            )}

            {/* Lista gruppi */}
            {groupsLoading ? (
                <Box display="flex" justifyContent="center"><Spinner /></Box>
            ) : groups.length === 0 ? (
                <Typography textAlign="center" color="text.secondary">
                    Non sei ancora membro di nessun gruppo.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {groups.map((group) => (
                        <Card key={group.id} onClick={() => navigate(`/groups/${group.id}`)}>
                            <Typography variant="h6">{group.name}</Typography>
                            <Typography variant="body2">TAG: {group.tag}</Typography>
                            <Badge text={group.user_role || "Membro"} />
                        </Card>
                    ))}
                </Stack>
            )}

            {/* Modale Creazione Gruppo */}
            <Modal title="Crea un nuovo gruppo" isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <Stack spacing={2}>
                    <Input label="Nome del gruppo" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                    <FormControlLabel
                        control={<Checkbox checked={requirePassword} onChange={() => setRequirePassword(!requirePassword)} />}
                        label="Proteggi con password?"
                    />
                    {requirePassword && <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />}
                    <Button onClick={handleCreateGroup} disabled={isCreating}>
                        {isCreating ? <Spinner /> : "Crea Gruppo"}
                    </Button>
                </Stack>
            </Modal>

            {/* Modale Richiesta di ingresso - QUESTA È LA PARTE MANCANTE */}
        <Modal 
            title="Richiedi di entrare nel gruppo" 
            isOpen={isRequestModalOpen} 
            onClose={() => setIsRequestModalOpen(false)}
        >
            <Stack spacing={2}>
                {searchedGroup?.require_password && (
                    <Input 
                        label="Password del gruppo" 
                        type="password" 
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                    />
                )}
                <Typography variant="body2">
                    {searchedGroup?.require_password 
                        ? "Questo gruppo richiede una password per entrare."
                        : "Vuoi davvero richiedere l'accesso a questo gruppo?"}
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleRequestJoin}
                >
                    Richiedi di entrare
                </Button>
            </Stack>
        </Modal>
        </Stack>
    );
}
