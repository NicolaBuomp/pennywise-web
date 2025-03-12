import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Card, CardContent, Avatar,
  Grid, Divider, Chip, Button, Tabs, Tab, LinearProgress,
  IconButton, List, ListItem, ListItemAvatar, ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  People as PeopleIcon,
  Settings as SettingsIcon,
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import groupService from '../../services/groupService';
import { useDispatch } from 'react-redux';
import { showAlert } from '@/redux/slices/alertSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`group-tabpanel-${index}`}
      aria-labelledby={`group-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [groupData, setGroupData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadGroupDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Load group details
        const group = await groupService.getGroupById(id);
        setGroupData(group);
        
        // Load group members
        const membersList = await groupService.getGroupMembers(id);
        setMembers(membersList);
        
        // Check if current user is admin
        const adminStatus = await groupService.isGroupAdmin(id);
        setIsAdmin(adminStatus);
        
      } catch (error) {
        console.error('Errore nel caricamento dei dettagli del gruppo:', error);
        dispatch(showAlert({
          message: 'Impossibile caricare i dettagli del gruppo.',
          severity: 'error'
        }));
      } finally {
        setLoading(false);
      }
    };

    loadGroupDetails();
  }, [id, dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCopyInviteLink = async () => {
    try {
      if (!id) return;
      const invite = await groupService.createGroupInvite(id, 10, '30 days');
      const inviteUrl = `${window.location.origin}/join-group/${invite.invite_token}`;
      
      await navigator.clipboard.writeText(inviteUrl);
      dispatch(showAlert({
        message: 'Link di invito copiato negli appunti!',
        severity: 'success'
      }));
    } catch (error) {
      console.error('Errore nella creazione del link di invito:', error);
      dispatch(showAlert({
        message: 'Impossibile generare il link di invito.',
        severity: 'error'
      }));
    }
  };

  const handleLeaveGroup = async () => {
    if (!id || !groupData) return;
    
    if (confirm('Sei sicuro di voler abbandonare questo gruppo?')) {
      try {
        await groupService.leaveGroup(id);
        dispatch(showAlert({
          message: 'Hai abbandonato il gruppo con successo.',
          severity: 'success'
        }));
        // Redirect alla lista dei gruppi
        window.location.href = '/groups';
      } catch (error) {
        console.error('Errore nell\'abbandonare il gruppo:', error);
        dispatch(showAlert({
          message: 'Impossibile abbandonare il gruppo.',
          severity: 'error'
        }));
      }
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!groupData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" color="error">Gruppo non trovato</Typography>
        <Button component={Link} to="/groups" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Torna ai gruppi
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        component={Link} 
        to="/groups" 
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Torna ai gruppi
      </Button>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={groupData.avatar_url || undefined}
                  sx={{ width: 64, height: 64, bgcolor: 'primary.main', mr: 2 }}
                >
                  {!groupData.avatar_url && groupData.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1">
                    {groupData.name}
                  </Typography>
                  <Box sx={{ display: 'flex', mt: 1 }}>
                    <Chip 
                      label={groupData.privacy_type === 'public' ? 'Pubblico' : 'Privato'} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      icon={<PeopleIcon />} 
                      label={`${members.length} membri`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
              
              {groupData.description && (
                <Typography variant="body1" sx={{ mt: 3 }}>
                  {groupData.description}
                </Typography>
              )}
              
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                Creato il {format(new Date(groupData.created_at), 'd MMMM yyyy', { locale: it })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
                <Button 
                  variant="contained" 
                  startIcon={<PersonAddIcon />}
                  onClick={handleCopyInviteLink}
                  fullWidth
                >
                  Invita Membri
                </Button>
                
                {isAdmin && (
                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    component={Link}
                    to={`/groups/${id}/edit`}
                    fullWidth
                  >
                    Modifica Gruppo
                  </Button>
                )}
                
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={isAdmin ? <DeleteIcon /> : <ExitToAppIcon />}
                  onClick={isAdmin ? undefined : handleLeaveGroup}
                  fullWidth
                >
                  {isAdmin ? 'Elimina Gruppo' : 'Abbandona Gruppo'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="group tabs">
            <Tab label="Membri" id="group-tab-0" />
            <Tab label="Spese" id="group-tab-1" />
            <Tab label="Saldi" id="group-tab-2" />
            {isAdmin && <Tab label="Impostazioni" id="group-tab-3" />}
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" sx={{ mb: 2 }}>Membri del gruppo</Typography>
          <List>
            {members.map((member) => (
              <ListItem 
                key={member.id}
                divider
              >
                <ListItemAvatar>
                  <Avatar src={member.user.avatar_url}>
                    {member.user.display_name?.charAt(0) || member.user.username?.charAt(0) || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.user.display_name || member.user.username}
                  secondary={
                    <>
                      {member.role === 'admin' ? 'Amministratore' : 'Membro'} • {member.user.email}
                      <br />
                      Membro dal {format(new Date(member.joined_at), 'd MMMM yyyy', { locale: it })}
                    </>
                  }
                />
                {isAdmin && member.role !== 'admin' && (
                  <ListItemSecondaryAction>
                    <IconButton edge="end">
                      <SettingsIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6">Spese del gruppo</Typography>
          <Typography variant="body2" color="text.secondary">
            Qui verranno visualizzate le spese del gruppo.
          </Typography>
          {/* Implementazione futura del componente spese */}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6">Saldi tra membri</Typography>
          <Typography variant="body2" color="text.secondary">
            Qui verranno visualizzati i saldi tra i membri del gruppo.
          </Typography>
          {/* Implementazione futura del componente saldi */}
        </TabPanel>
        
        {isAdmin && (
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6">Impostazioni del gruppo</Typography>
            {/* Implementazione futura delle impostazioni del gruppo */}
          </TabPanel>
        )}
      </Box>
    </Container>
  );
};

export default GroupDetail;
