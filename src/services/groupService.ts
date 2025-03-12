import supabase from '../supabaseClient';
import store from '../redux/store';

/**
 * Verifica se l'email dell'utente è verificata utilizzando lo stato Redux
 * @returns {boolean}
 */
const checkIsEmailVerified = () => {
  // Usa lo stato Redux invece di fare una chiamata API
  const state = store.getState();
  return state.auth.isEmailVerified;
};

/**
 * Servizio per la gestione dei gruppi
 */
export const groupService = {
  /**
   * Recupera tutti i gruppi dell'utente corrente
   * @returns {Promise<Array>} Lista dei gruppi
   */
  getUserGroups: async () => {
    try {
      // 1. Prima otteniamo le appartenenze ai gruppi dell'utente
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('id, role, joined_at, group_id')
        .order('joined_at', { ascending: false });

      if (membershipError) throw membershipError;
      if (!memberships || memberships.length === 0) return [];

      // 2. Otteniamo le informazioni complete sui gruppi in una query separata
      const groupIds = memberships.map(membership => membership.group_id);
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);

      if (groupsError) throw groupsError;

      // 3. Combiniamo i risultati
      return groups.map(group => {
        const membership = memberships.find(m => m.group_id === group.id);
        return {
          ...group,
          membership: {
            id: membership?.id,
            role: membership?.role,
            joined_at: membership?.joined_at
          }
        };
      });
    } catch (error) {
      console.error('Errore nel caricamento dei gruppi:', error);
      throw error;
    }
  },

  /**
   * Recupera un singolo gruppo per ID
   * @param {string} groupId - ID del gruppo
   * @returns {Promise<Object>} Dettagli del gruppo
   */
  getGroupById: async (groupId) => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Recupera tutti i membri di un gruppo
   * @param {string} groupId - ID del gruppo
   * @returns {Promise<Array>} Lista dei membri
   */
  getGroupMembers: async (groupId) => {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        id,
        role,
        joined_at,
        user:users(id, username, display_name, avatar_url, email)
      `)
      .eq('group_id', groupId)
      .order('joined_at');

    if (error) throw error;
    return data.map(membership => ({
      id: membership.id,
      role: membership.role,
      joined_at: membership.joined_at,
      user: membership.user
    }));
  },

  /**
   * Crea un nuovo gruppo
   * @param {Object} groupData - Dati del gruppo
   * @returns {Promise<Object>} Gruppo creato
   */
  createGroup: async (groupData) => {
    // Crea il gruppo
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert([groupData])
      .select()
      .single();

    if (groupError) throw groupError;

    // Aggiungi il creatore come admin
    const { error: memberError } = await supabase
      .from('group_members')
      .insert([{
        group_id: group.id,
        user_id: groupData.created_by,
        role: 'admin'
      }]);

    if (memberError) throw memberError;

    // Aggiungi le categorie di default per il gruppo
    const defaultCategories = [
      { name: 'Alimentari', color: '#4CAF50', icon: 'shopping_cart', group_id: group.id },
      { name: 'Affitto', color: '#2196F3', icon: 'home', group_id: group.id },
      { name: 'Bollette', color: '#FFC107', icon: 'bolt', group_id: group.id },
      { name: 'Trasporti', color: '#9C27B0', icon: 'directions_car', group_id: group.id },
      { name: 'Svago', color: '#F44336', icon: 'sports_esports', group_id: group.id },
      { name: 'Altro', color: '#607D8B', icon: 'more_horiz', group_id: group.id }
    ];

    const { error: categoriesError } = await supabase
      .from('expense_categories')
      .insert(defaultCategories);

    if (categoriesError) throw categoriesError;

    return group;
  },

  /**
   * Aggiorna un gruppo esistente
   * @param {string} groupId - ID del gruppo
   * @param {Object} groupData - Dati aggiornati
   * @returns {Promise<Object>} Gruppo aggiornato
   */
  updateGroup: async (groupId, groupData) => {
    const { data, error } = await supabase
      .from('groups')
      .update(groupData)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Elimina un gruppo
   * @param {string} groupId - ID del gruppo
   * @returns {Promise<void>}
   */
  deleteGroup: async (groupId) => {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
  },

  /**
   * Crea un invito al gruppo
   * @param {string} groupId - ID del gruppo
   * @param {number} maxUses - Numero massimo di utilizzi (default: 1)
   * @param {string} expiresIn - Scadenza dell'invito (formato PostgreSQL interval, default: '7 days')
   * @returns {Promise<Object>} Invito creato
   */
  createGroupInvite: async (groupId, maxUses = 1, expiresIn = '7 days') => {
    const { data, error } = await supabase
      .rpc('create_group_invite', {
        p_group_id: groupId,
        p_created_by: (await supabase.auth.getUser()).data.user.id,
        p_expires_in: expiresIn,
        p_max_uses: maxUses
      });

    if (error) throw error;

    // Ottieni i dettagli dell'invito
    const { data: invite, error: inviteError } = await supabase
      .from('group_invites')
      .select('*')
      .eq('id', data)
      .single();

    if (inviteError) throw inviteError;
    return invite;
  },

  /**
   * Utilizza un invito al gruppo
   * @param {string} inviteToken - Token dell'invito
   * @returns {Promise<boolean>} Esito dell'operazione
   */
  useGroupInvite: async (inviteToken) => {
    const { data, error } = await supabase
      .rpc('use_group_invite', {
        p_invite_token: inviteToken,
        p_user_id: (await supabase.auth.getUser()).data.user.id
      });

    if (error) throw error;
    return data;
  },

  /**
   * Cerca gruppi pubblici
   * @param {string} query - Testo di ricerca
   * @param {number} limit - Limite risultati
   * @param {number} offset - Offset paginazione
   * @returns {Promise<Array>} Lista dei gruppi trovati
   */
  searchPublicGroups: async (query = '', limit = 20, offset = 0) => {
    const { data, error } = await supabase
      .rpc('search_public_groups', {
        p_query: query,
        p_limit: limit,
        p_offset: offset
      });

    if (error) throw error;
    return data;
  },

  /**
   * Richiede di unirsi a un gruppo pubblico
   * @param {string} groupId - ID del gruppo
   * @param {string} message - Messaggio opzionale
   * @returns {Promise<Object>} Dettagli della richiesta
   */
  requestJoinGroup: async (groupId, message = '') => {
    const { data, error } = await supabase
      .rpc('request_join_group', {
        p_group_id: groupId,
        p_user_id: (await supabase.auth.getUser()).data.user.id,
        p_message: message
      });

    if (error) throw error;
    return data;
  },

  /**
   * Risponde a una richiesta di adesione
   * @param {string} requestId - ID della richiesta
   * @param {boolean} approved - Se approvare o rifiutare
   * @returns {Promise<boolean>} Esito dell'operazione
   */
  respondToJoinRequest: async (requestId, approved) => {
    const { data, error } = await supabase
      .rpc('respond_to_join_request', {
        p_request_id: requestId,
        p_admin_id: (await supabase.auth.getUser()).data.user.id,
        p_approved: approved
      });

    if (error) throw error;
    return data;
  },

  /**
   * Ottiene le richieste di adesione in attesa per un gruppo
   * @param {string} groupId - ID del gruppo
   * @returns {Promise<Array>} Lista delle richieste
   */
  getPendingJoinRequests: async (groupId) => {
    const { data, error } = await supabase
      .from('group_join_requests')
      .select(`
        id,
        message,
        status,
        created_at,
        user:users(id, username, display_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Aggiorna il ruolo di un membro del gruppo
   * @param {string} membershipId - ID dell'appartenenza
   * @param {string} newRole - Nuovo ruolo ('admin' o 'member')
   * @returns {Promise<Object>} Membro aggiornato
   */
  updateMemberRole: async (membershipId, newRole) => {
    const { data, error } = await supabase
      .from('group_members')
      .update({ role: newRole })
      .eq('id', membershipId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Rimuove un membro dal gruppo
   * @param {string} membershipId - ID dell'appartenenza
   * @returns {Promise<void>}
   */
  removeMember: async (membershipId) => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', membershipId);

    if (error) throw error;
  },

  /**
   * Abbandona un gruppo
   * @param {string} groupId - ID del gruppo
   * @returns {Promise<void>}
   */
  leaveGroup: async (groupId) => {
    const userId = (await supabase.auth.getUser()).data.user.id;
    
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (membershipError) throw membershipError;

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', membership.id);

    if (error) throw error;
  },

  /**
   * Verifica se l'utente è admin del gruppo
   * @param {string} groupId - ID del gruppo
   * @returns {Promise<boolean>} true se admin
   */
  isGroupAdmin: async (groupId) => {
    // Rimosso controllo ridondante sulla verifica email

    const userId = (await supabase.auth.getUser()).data.user.id;
    
    const { data, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data.role === 'admin';
  }
};

export default groupService;