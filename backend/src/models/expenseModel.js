const { supabase, isConfigured } = require('../config/supabase');
const { loadData, saveData } = require('../config/localStore');
const { randomUUID } = require('crypto');

const ExpenseModel = {
  /**
   * Find expenses for a specific user with filtering, search, sorting and pagination
   */
  async findUserExpenses(userId, { category, fromDate, toDate, search, sort = 'newest', limit = 50, offset = 0 } = {}) {
    if (isConfigured() && supabase) {
      let query = supabase
        .from('expenses')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      if (fromDate) {
        query = query.gte('expense_date', fromDate);
      }

      if (toDate) {
        query = query.lte('expense_date', toDate);
      }

      if (search && search.trim()) {
        query = query.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
      }

      // Sort options: 'newest', 'oldest', 'highest', 'lowest'
      switch (sort) {
        case 'oldest':
          query = query.order('expense_date', { ascending: true }).order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('amount', { ascending: false });
          break;
        case 'lowest':
          query = query.order('amount', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('expense_date', { ascending: false }).order('created_at', { ascending: false });
          break;
      }

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, count, error } = await query;
      if (error) {
        throw new Error(`Database error fetching expenses: ${error.message}`);
      }
      return { expenses: data || [], totalCount: count || 0 };
    }

    // Local fallback
    const store = loadData();
    let userExpenses = store.expenses.filter(e => e.user_id === userId);

    if (category && category !== 'All') {
      userExpenses = userExpenses.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }

    if (fromDate) {
      userExpenses = userExpenses.filter(e => e.expense_date >= fromDate);
    }

    if (toDate) {
      userExpenses = userExpenses.filter(e => e.expense_date <= toDate);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      userExpenses = userExpenses.filter(
        e => (e.title && e.title.toLowerCase().includes(q)) ||
             (e.description && e.description.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sort) {
      case 'oldest':
        userExpenses.sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date) || new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'highest':
        userExpenses.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        userExpenses.sort((a, b) => a.amount - b.amount);
        break;
      case 'newest':
      default:
        userExpenses.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date) || new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    const totalCount = userExpenses.length;
    const paginated = limit ? userExpenses.slice(offset, offset + limit) : userExpenses;

    return { expenses: paginated, totalCount };
  },

  /**
   * Find a single expense by ID ensuring it belongs to the user
   */
  async findById(id, userId) {
    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw new Error(`Database error fetching expense: ${error.message}`);
      }
      return data;
    }

    const store = loadData();
    return store.expenses.find(e => e.id === id && e.user_id === userId) || null;
  },

  /**
   * Create an expense for a user
   */
  async create({ userId, title, amount, category, description = '', expense_date, payment_method = 'Cash' }) {
    const now = new Date().toISOString();
    const formattedDate = expense_date || new Date().toISOString().split('T')[0];

    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: userId,
            title: title.trim(),
            amount: parseFloat(amount),
            category: category.trim(),
            description: description ? description.trim() : '',
            expense_date: formattedDate,
            payment_method: payment_method.trim(),
            created_at: now,
            updated_at: now
          }
        ])
        .select('*')
        .single();

      if (error) {
        throw new Error(`Database error creating expense: ${error.message}`);
      }
      return data;
    }

    const store = loadData();
    const newExpense = {
      id: randomUUID(),
      user_id: userId,
      title: title.trim(),
      amount: parseFloat(amount),
      category: category.trim(),
      description: description ? description.trim() : '',
      expense_date: formattedDate,
      payment_method: payment_method.trim(),
      created_at: now,
      updated_at: now
    };

    store.expenses.push(newExpense);
    saveData(store);
    return newExpense;
  },

  /**
   * Update an expense ensuring user ownership
   */
  async update(id, userId, updates) {
    const now = new Date().toISOString();
    const allowedFields = ['title', 'amount', 'category', 'description', 'expense_date', 'payment_method'];
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key))
    );
    cleanUpdates.updated_at = now;
    if (cleanUpdates.amount !== undefined) {
      cleanUpdates.amount = parseFloat(cleanUpdates.amount);
    }

    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();

      if (error) {
        throw new Error(`Database error updating expense: ${error.message}`);
      }
      return data;
    }

    const store = loadData();
    const index = store.expenses.findIndex(e => e.id === id && e.user_id === userId);
    if (index === -1) return null;

    store.expenses[index] = {
      ...store.expenses[index],
      ...cleanUpdates
    };
    saveData(store);
    return store.expenses[index];
  },

  /**
   * Delete an expense ensuring user ownership
   */
  async delete(id, userId) {
    if (isConfigured() && supabase) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Database error deleting expense: ${error.message}`);
      }
      return true;
    }

    const store = loadData();
    const initialLen = store.expenses.length;
    store.expenses = store.expenses.filter(e => !(e.id === id && e.user_id === userId));
    const wasDeleted = store.expenses.length < initialLen;
    if (wasDeleted) {
      saveData(store);
    }
    return wasDeleted;
  },

  /**
   * Get raw expenses list for period for analytics calculations
   */
  async getForPeriod(userId, fromDate, toDate) {
    if (isConfigured() && supabase) {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);

      if (fromDate) query = query.gte('expense_date', fromDate);
      if (toDate) query = query.lte('expense_date', toDate);

      query = query.order('expense_date', { ascending: true });

      const { data, error } = await query;
      if (error) {
        throw new Error(`Database error fetching period expenses: ${error.message}`);
      }
      return data || [];
    }

    const store = loadData();
    return store.expenses.filter(e => {
      if (e.user_id !== userId) return false;
      if (fromDate && e.expense_date < fromDate) return false;
      if (toDate && e.expense_date > toDate) return false;
      return true;
    }).sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date));
  }
};

module.exports = ExpenseModel;
