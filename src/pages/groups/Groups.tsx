import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  CardActions, Button, Avatar, Skeleton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Add as AddIcon, People as PeopleIcon } from '@mui/icons-material';
import CreateGroupForm from '../../components/groups/CreateGroupForm';
import groupService from '../../services/groupService';
import { useDispatch } from 'react-redux';
import { showAlert } from '@/redux/slices/alertSlice';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type GroupData = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  default_currency: string;
  privacy_type: 'public' | 'private';
  created_at: string;
  membership: {
    id: string;
    role: 'admin' | 'member';
    joined_at: string;
  };
};

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<GroupData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const userGroups = await groupService.getUserGroups();
        setGroups(userGroups);
      } catch (error) {
        console.error('Errore nel caricamento dei gruppi:', error);
        dispatch(showAlert({
          message: 'Impossibile caricare i gruppi. Riprova più tardi.',
          severity: 'error'
        }));
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [dispatch]);

  const handleOpenCreateDialog = () => setIsCreateDialogOpen(true);
  const handleCloseCreateDialog = () => setIsCreateDialogOpen(false);
  
  const handleGroupCreated = (newGroup: any) => {
    setGroups(prevGroups => prevGroups ? [...prevGroups, newGroup] : [newGroup]);
    setIsCreateDialogOpen(false);
    dispatch(showAlert({
      message: 'Gruppo creato con successo!',
      severity: 'success'
    }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          I tuoi Gruppi
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Nuovo Gruppo
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map(i => (
            <Grid item key={i} xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" height={30} width="80%" sx={{ mt: 1 }} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : groups && groups.length > 0 ? (
        <Grid container spacing={3}>
          {groups.map(group => (
            <Grid item key={group.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={group.avatar_url || undefined}
                      sx={{ bgcolor: 'primary.main', mr: 2 }}
                    >
                      {!group.avatar_url && group.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {group.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Membro dal {format(new Date(group.membership.joined_at), 'd MMMM yyyy', { locale: it })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Chip 
                      label={group.membership.role === 'admin' ? 'Amministratore' : 'Membro'} 
                      size="small" 
                      color={group.membership.role === 'admin' ? 'primary' : 'default'}
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={group.privacy_type === 'public' ? 'Pubblico' : 'Privato'} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {group.description || 'Nessuna descrizione'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/groups/${group.id}`}
                    startIcon={<PeopleIcon />}
                  >
                    Visualizza
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Non sei ancora membro di nessun gruppo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crea il tuo primo gruppo per iniziare a tracciare le spese condivise
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleOpenCreateDialog}
            startIcon={<AddIcon />}
          >
            Crea un gruppo
          </Button>
        </Box>
      )}

      <Dialog 
        open={isCreateDialogOpen} 
        onClose={handleCloseCreateDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Crea un nuovo gruppo</DialogTitle>
        <DialogContent>
          <CreateGroupForm onSuccess={handleGroupCreated} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Annulla</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Groups;
