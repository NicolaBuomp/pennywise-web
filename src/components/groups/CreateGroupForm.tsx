import React, { useState } from 'react';
import { 
  Box, TextField, Button, FormControlLabel, Switch, 
  FormControl, InputLabel, Select, MenuItem, CircularProgress 
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import groupService from '../../services/groupService';
import supabase from '../../supabaseClient';

interface CreateGroupFormProps {
  onSuccess: (group: any) => void;
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      default_currency: 'EUR',
      privacy_type: 'private',
      requires_password: false,
      password: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Nome gruppo obbligatorio').max(100, 'Il nome non può superare i 100 caratteri'),
      description: Yup.string().max(500, 'La descrizione non può superare i 500 caratteri'),
      default_currency: Yup.string().required('Valuta obbligatoria'),
      privacy_type: Yup.string().oneOf(['public', 'private'], 'Tipo di privacy non valido'),
      requires_password: Yup.boolean(),
      password: Yup.string().when('requires_password', {
        is: true,
        then: Yup.string().required('Password obbligatoria').min(6, 'La password deve avere almeno 6 caratteri'),
        otherwise: Yup.string()
      })
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Utente non autenticato');
        }

        const groupData = {
          name: values.name,
          description: values.description || null,
          default_currency: values.default_currency,
          privacy_type: values.privacy_type as 'public' | 'private',
          requires_password: values.requires_password,
          password_hash: values.requires_password ? values.password : null, // Nota: in produzione questo dovrebbe essere criptato
          created_by: user.id
        };

        const newGroup = await groupService.createGroup(groupData);
        onSuccess(newGroup);
      } catch (error) {
        console.error('Errore nella creazione del gruppo:', error);
        formik.setStatus('Impossibile creare il gruppo. Riprova più tardi.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
      {formik.status && (
        <Box sx={{ color: 'error.main', mb: 2 }}>
          {formik.status}
        </Box>
      )}

      <TextField
        fullWidth
        margin="normal"
        id="name"
        name="name"
        label="Nome del gruppo"
        value={formik.values.name}
        onChange={formik.handleChange}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        disabled={isLoading}
      />

      <TextField
        fullWidth
        margin="normal"
        id="description"
        name="description"
        label="Descrizione (opzionale)"
        multiline
        rows={3}
        value={formik.values.description}
        onChange={formik.handleChange}
        error={formik.touched.description && Boolean(formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
        disabled={isLoading}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="currency-label">Valuta predefinita</InputLabel>
        <Select
          labelId="currency-label"
          id="default_currency"
          name="default_currency"
          value={formik.values.default_currency}
          onChange={formik.handleChange}
          label="Valuta predefinita"
          disabled={isLoading}
        >
          <MenuItem value="EUR">Euro (€)</MenuItem>
          <MenuItem value="USD">Dollaro USA ($)</MenuItem>
          <MenuItem value="GBP">Lira Sterlina (£)</MenuItem>
          <MenuItem value="JPY">Yen Giapponese (¥)</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="privacy-label">Tipo di privacy</InputLabel>
        <Select
          labelId="privacy-label"
          id="privacy_type"
          name="privacy_type"
          value={formik.values.privacy_type}
          onChange={formik.handleChange}
          label="Tipo di privacy"
          disabled={isLoading}
        >
          <MenuItem value="private">Privato (solo su invito)</MenuItem>
          <MenuItem value="public">Pubblico (ricercabile)</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Switch
            name="requires_password"
            checked={formik.values.requires_password}
            onChange={formik.handleChange}
            disabled={isLoading}
          />
        }
        label="Richiedi password per unirsi"
        sx={{ mt: 2, mb: 1 }}
      />

      {formik.values.requires_password && (
        <TextField
          fullWidth
          margin="normal"
          id="password"
          name="password"
          label="Password del gruppo"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          disabled={isLoading}
        />
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Crea Gruppo'}
      </Button>
    </Box>
  );
};

export default CreateGroupForm;
