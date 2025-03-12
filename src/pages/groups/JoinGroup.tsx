import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container, Typography, Box, Card, CardContent, Button,
  LinearProgress, Alert, Paper
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import groupService from '../../services/groupService';
import { useDispatch } from 'react-redux';
import { showAlert } from '@/redux/slices/alertSlice';

const JoinGroup: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [groupName, setGroupName] = useState<string>('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const joinGroup = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        // Utilizzare il token di invito per unirsi al gruppo
        const result = await groupService.useGroupInvite(token);
        
        if (result) {
          setStatus('success');
          // Assumiamo che il risultato contenga il nome del gruppo
          setGroupName(result.name || 'gruppo');
          
          dispatch(showAlert({
            message: 'Ti sei unito al gruppo con successo!',
            severity: 'success'
          }));
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Errore nell\'unirsi al gruppo:', error);
        setStatus('error');
        dispatch(showAlert({
          message: 'Impossibile unirsi al gruppo. L\'invito potrebbe essere scaduto o non valido.',
          severity: 'error'
        }));
      }
    };

    joinGroup();
  }, [token, dispatch]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Invito al gruppo
          </Typography>
        </Box>

        {status === 'loading' && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
              Stiamo elaborando il tuo invito...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Ti sei unito al gruppo con successo!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Ora fai parte del gruppo {groupName}.
            </Typography>
            <Button 
              variant="contained" 
              component={Link} 
              to="/groups"
              sx={{ mr: 1 }}
            >
              Vai ai tuoi gruppi
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ textAlign: 'center' }}>
            <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Impossibile unirsi al gruppo
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              L'invito potrebbe essere scaduto, non valido o potresti già essere membro di questo gruppo.
            </Typography>
            <Button 
              variant="contained" 
              component={Link} 
              to="/groups"
            >
              Vai ai tuoi gruppi
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default JoinGroup;
