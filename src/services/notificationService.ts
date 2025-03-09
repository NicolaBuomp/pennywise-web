import supabase from '../supabaseClient';
import { store } from '../redux/store';
import { addNotification, updateNotification, markAsRead } from '../redux/slices/notificationSlice';

/**
 * Servizio per la gestione delle notifiche
 */
export const notificationService = {
  /**
   * Recupera le notifiche dell'utente corrente
   * @param {Object} options - Opzioni di paginazione
   * @returns {Promise<Array>} Lista delle notifiche
   */
  getUserNotifications: async (options = {}) => {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false
    } = options;

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  /**
   * Segna una notifica come letta
   * @param {string} notificationId - ID della notifica
   * @returns {Promise<Object>} Notifica aggiornata
   */
  markNotificationAsRead: async (notificationId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date()
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    
    // Aggiorna lo stato in Redux
    store.dispatch(markAsRead(notificationId));
    
    return data;
  },

  /**
   * Segna tutte le notifiche come lette
   * @returns {Promise<number>} Numero di notifiche aggiornate
   */
  markAllAsRead: async () => {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date()
      })
      .eq('is_read', false)
      .select('id');

    if (error) throw error;
    
    // Aggiorna lo stato in Redux per tutte le notifiche
    if (data && data.length > 0) {
      data.forEach(notification => {
        store.dispatch(markAsRead(notification.id));
      });
    }
    
    return data ? data.length : 0;
  },

  /**
   * Elimina una notifica
   * @param {string} notificationId - ID della notifica
   * @returns {Promise<void>}
   */
  deleteNotification: async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Registra un dispositivo per le notifiche push
   * @param {string} deviceToken - Token del dispositivo
   * @param {string} deviceType - Tipo di dispositivo ('web', 'android', 'ios')
   * @returns {Promise<Object>} Dispositivo registrato
   */
  registerDevice: async (deviceToken, deviceType) => {
    const { data, error } = await supabase
      .from('user_devices')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        device_token: deviceToken,
        device_type: deviceType,
        is_active: true,
        last_used_at: new Date()
      }, {
        onConflict: 'user_id, device_token'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Disattiva un dispositivo per le notifiche push
   * @param {string} deviceToken - Token del dispositivo
   * @returns {Promise<void>}
   */
  unregisterDevice: async (deviceToken) => {
    const { error } = await supabase
      .from('user_devices')
      .update({ is_active: false })
      .eq('device_token', deviceToken)
      .eq('user_id', (await supabase.auth.getUser()).data.user.id);

    if (error) throw error;
  }
};

/**
 * Configura le sottoscrizioni realtime per le notifiche
 * @param {string} userId - ID dell'utente corrente
 */
export const setupRealtimeSubscriptions = (userId) => {
  // Sottoscrizione per le notifiche
  const notificationsSubscription = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      // Nuova notifica ricevuta
      store.dispatch(addNotification(payload.new));
      
      // Mostra notifica nativa del browser se supportata
      if ('Notification' in window && Notification.permission === 'granted') {
        const { title, message } = payload.new;
        new Notification(title, {
          body: message,
          icon: '/logo.svg'
        });
      }
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      // Notifica aggiornata
      store.dispatch(updateNotification(payload.new));
    })
    .subscribe();

  // Sottoscrizione per i gruppi
  const groupsSubscription = supabase
    .channel('group-events')
    .on('postgres_changes', {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'expenses',
      filter: `group_id=in.(select group_id from group_members where user_id = '${userId}')`
    }, (payload) => {
      // Nuova spesa o aggiornamento spesa
      // Qui si può gestire l'aggiornamento dello stato Redux per le spese
      console.log('Expense update:', payload);
    })
    .on('postgres_changes', {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'shopping_items',
      filter: `list_id=in.(select id from shopping_lists where group_id in (select group_id from group_members where user_id = '${userId}'))`
    }, (payload) => {
      // Nuovi articoli o aggiornamenti alle liste della spesa
      // Qui si può gestire l'aggiornamento dello stato Redux per le liste
      console.log('Shopping list update:', payload);
    })
    .subscribe();

  // Restituisci le funzioni di pulizia per disattivare le sottoscrizioni
  return () => {
    supabase.removeChannel(notificationsSubscription);
    supabase.removeChannel(groupsSubscription);
  };
};

export default notificationService;