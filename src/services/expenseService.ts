import supabase from '../supabaseClient';

/**
 * Servizio per la gestione delle spese
 */
export const expenseService = {
  /**
   * Recupera tutte le spese di un gruppo
   * @param {string} groupId - ID del gruppo
   * @param {Object} options - Opzioni di paginazione e filtri
   * @returns {Promise<Array>} Lista delle spese
   */
  getExpenses: async (groupId, options = {}) => {
    const {
      page = 1,
      limit = 20,
      orderBy = { column: 'date', order: 'desc' },
      filters = {},
    } = options;

    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*),
        paid_by:users!paid_by(id, username, display_name, avatar_url),
        expense_shares(
          id, 
          amount, 
          percentage, 
          is_settled, 
          settled_at,
          user:users!expense_shares_user_id_fkey(id, username, display_name, avatar_url)
        )
      `)
      .eq('group_id', groupId)
      .order(orderBy.column, { ascending: orderBy.order === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    // Applica filtri se presenti
    if (filters.from) {
      query = query.gte('date', filters.from);
    }
    if (filters.to) {
      query = query.lte('date', filters.to);
    }
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters.paidBy) {
      query = query.eq('paid_by', filters.paidBy);
    }
    if (filters.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  /**
   * Recupera una singola spesa per ID
   * @param {string} expenseId - ID della spesa
   * @returns {Promise<Object>} Dettagli della spesa
   */
  getExpenseById: async (expenseId) => {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*),
        paid_by:users!paid_by(id, username, display_name, avatar_url),
        expense_shares(
          id, 
          amount, 
          percentage, 
          is_settled, 
          settled_at,
          user:users!expense_shares_user_id_fkey(id, username, display_name, avatar_url)
        ),
        group:groups(*)
      `)
      .eq('id', expenseId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crea una nuova spesa
   * @param {Object} expenseData - Dati della spesa
   * @param {Array} shares - Divisione della spesa tra gli utenti
   * @returns {Promise<Object>} Spesa creata
   */
  createExpense: async (expenseData, shares) => {
    // Inizia transazione
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Crea le quote per ogni utente
    const sharesData = shares.map(share => ({
      expense_id: expense.id,
      user_id: share.user_id,
      amount: share.amount,
      percentage: share.percentage,
      is_settled: share.user_id === expenseData.paid_by, // Auto-liquidazione se pagata dall'utente stesso
    }));

    const { error: sharesError } = await supabase
      .from('expense_shares')
      .insert(sharesData);

    if (sharesError) throw sharesError;

    return expense;
  },

  /**
   * Aggiorna una spesa esistente
   * @param {string} expenseId - ID della spesa
   * @param {Object} expenseData - Dati aggiornati
   * @param {Array} shares - Quote aggiornate
   * @returns {Promise<Object>} Spesa aggiornata
   */
  updateExpense: async (expenseId, expenseData, shares) => {
    // Aggiorna la spesa
    const { error: expenseError } = await supabase
      .from('expenses')
      .update(expenseData)
      .eq('id', expenseId);

    if (expenseError) throw expenseError;

    // Elimina le quote vecchie
    const { error: deleteError } = await supabase
      .from('expense_shares')
      .delete()
      .eq('expense_id', expenseId);

    if (deleteError) throw deleteError;

    // Crea le nuove quote
    const sharesData = shares.map(share => ({
      expense_id: expenseId,
      user_id: share.user_id,
      amount: share.amount,
      percentage: share.percentage,
      is_settled: share.is_settled || share.user_id === expenseData.paid_by,
      settled_at: share.settled_at,
    }));

    const { error: sharesError } = await supabase
      .from('expense_shares')
      .insert(sharesData);

    if (sharesError) throw sharesError;

    return { id: expenseId };
  },

  /**
   * Elimina una spesa
   * @param {string} expenseId - ID della spesa
   * @returns {Promise<void>}
   */
  deleteExpense: async (expenseId) => {
    // Supabase eliminerà in cascata le expense_shares grazie ai vincoli foreign key
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
  },

  /**
   * Ottiene le categorie di spesa (globali e di gruppo)
   * @param {string} groupId - ID del gruppo (opzionale)
   * @returns {Promise<Array>} Lista delle categorie
   */
  getCategories: async (groupId = null) => {
    let query = supabase
      .from('expense_categories')
      .select('*');

    if (groupId) {
      // Categorie globali + categorie specifiche del gruppo
      query = query.or(`global.eq.true,group_id.eq.${groupId}`);
    } else {
      // Solo categorie globali
      query = query.eq('global', true);
    }

    const { data, error } = await query.order('name');
    if (error) throw error;
    return data;
  },

  /**
   * Crea una nuova categoria
   * @param {Object} categoryData - Dati della categoria
   * @returns {Promise<Object>} Categoria creata
   */
  createCategory: async (categoryData) => {
    const { data, error } = await supabase
      .from('expense_categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Ottiene le spese ricorrenti di un gruppo
   * @param {string} groupId - ID del gruppo
   * @returns {Promise<Array>} Lista delle spese ricorrenti
   */
  getRecurringExpenses: async (groupId) => {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select(`
        *,
        category:expense_categories(*),
        paid_by:users!paid_by(id, username, display_name, avatar_url),
        recurring_expense_shares(
          id, 
          percentage, 
          fixed_amount,
          user:users!recurring_expense_shares_user_id_fkey(id, username, display_name, avatar_url)
        )
      `)
      .eq('group_id', groupId)
      .order('next_occurrence');

    if (error) throw error;
    return data;
  },

  /**
   * Crea una nuova spesa ricorrente
   * @param {Object} recurringData - Dati della spesa ricorrente
   * @param {Array} shares - Divisione della spesa tra gli utenti
   * @returns {Promise<Object>} Spesa ricorrente creata
   */
  createRecurringExpense: async (recurringData, shares) => {
    // Crea la spesa ricorrente
    const { data: recurring, error: recurringError } = await supabase
      .from('recurring_expenses')
      .insert([recurringData])
      .select()
      .single();

    if (recurringError) throw recurringError;

    // Crea le quote per ogni utente
    const sharesData = shares.map(share => ({
      recurring_expense_id: recurring.id,
      user_id: share.user_id,
      percentage: share.percentage,
      fixed_amount: share.fixed_amount,
    }));
    
    const { error: sharesError } = await supabase
      .from('recurring_expense_shares')
      .insert(sharesData);

    if (sharesError) throw sharesError;

    return recurring;
  },

  /**
   * Aggiorna una spesa ricorrente
   * @param {string} recurringId - ID della spesa ricorrente
   * @param {Object} recurringData - Dati aggiornati
   * @param {Array} shares - Quote aggiornate
   * @returns {Promise<Object>} Spesa ricorrente aggiornata
   */
  updateRecurringExpense: async (recurringId, recurringData, shares) => {
    // Aggiorna la spesa ricorrente
    const { error: recurringError } = await supabase
      .from('recurring_expenses')
      .update(recurringData)
      .eq('id', recurringId);

    if (recurringError) throw recurringError;

    // Elimina le quote vecchie
    const { error: deleteError } = await supabase
      .from('recurring_expense_shares')
      .delete()
      .eq('recurring_expense_id', recurringId);

    if (deleteError) throw deleteError;

    // Crea le nuove quote
    const sharesData = shares.map(share => ({
      recurring_expense_id: recurringId,
      user_id: share.user_id,
      percentage: share.percentage,
      fixed_amount: share.fixed_amount,
    }));

    const { error: sharesError } = await supabase
      .from('recurring_expense_shares')
      .insert(sharesData);

    if (sharesError) throw sharesError;

    return { id: recurringId };
  },

  /**
   * Elimina una spesa ricorrente
   * @param {string} recurringId - ID della spesa ricorrente
   * @returns {Promise<void>}
   */
  deleteRecurringExpense: async (recurringId) => {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', recurringId);

    if (error) throw error;
  },

  /**
   * Ottiene i saldi di un gruppo
   * @param {string} groupId - ID del gruppo
   * @returns {Promise<Array>} Lista dei saldi
   */
  getBalances: async (groupId) => {
    const { data, error } = await supabase
      .from('balances')
      .select(`
        *,
        from_user:users!balances_from_user_id_fkey(id, username, display_name, avatar_url),
        to_user:users!balances_to_user_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('group_id', groupId);

    if (error) throw error;
    return data;
  },

  /**
   * Registra un pagamento di rimborso
   * @param {Object} settlementData - Dati del rimborso
   * @returns {Promise<Object>} Rimborso registrato
   */
  registerSettlement: async (settlementData) => {
    const { data, error } = await supabase
      .rpc('register_settlement', {
        p_group_id: settlementData.group_id,
        p_from_user_id: settlementData.from_user_id,
        p_to_user_id: settlementData.to_user_id,
        p_amount: settlementData.amount,
        p_currency: settlementData.currency,
        p_notes: settlementData.notes || null
      });

    if (error) throw error;
    return data;
  },

  /**
   * Ottiene lo storico dei rimborsi di un gruppo
   * @param {string} groupId - ID del gruppo
   * @param {Object} options - Opzioni di paginazione
   * @returns {Promise<Array>} Lista dei rimborsi
   */
  getSettlements: async (groupId, options = {}) => {
    const {
      page = 1,
      limit = 20,
      orderBy = { column: 'date', order: 'desc' },
    } = options;

    const { data, error, count } = await supabase
      .from('settlements')
      .select(`
        *,
        from_user:users!settlements_from_user_id_fkey(id, username, display_name, avatar_url),
        to_user:users!settlements_to_user_id_fkey(id, username, display_name, avatar_url)
      `, { count: 'exact' })
      .eq('group_id', groupId)
      .order(orderBy.column, { ascending: orderBy.order === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return { data, count };
  },

  /**
   * Ottiene statistiche delle spese
   * @param {string} groupId - ID del gruppo
   * @param {string} period - Periodo ('month', 'year', ecc.)
   * @returns {Promise<Object>} Dati statistici
   */
  getExpenseStats: async (groupId, period = 'month') => {
    let timeFilter;
    const now = new Date();
    
    switch (period) {
      case 'week':
        timeFilter = new Date(now.setDate(now.getDate() - 7)).toISOString();
        break;
      case 'month':
        timeFilter = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        break;
      case 'year':
        timeFilter = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
        break;
      default:
        timeFilter = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    }

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        id,
        amount,
        currency,
        date,
        category_id,
        category:expense_categories(name, color)
      `)
      .eq('group_id', groupId)
      .gte('date', timeFilter)
      .order('date');

    if (error) throw error;
    return data;
  },
};

export default expenseService;