const { supabase, isConfigured } = require('../config/supabase');
const { loadData, saveData } = require('../config/localStore');
const { randomUUID } = require('crypto');

const BudgetModel = {
  /**
   * Find budgets for a user for a given month and year
   */
  async findUserBudgets(userId, month, year) {
    if (isConfigured() && supabase) {
      let query = supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (month) query = query.eq('month', parseInt(month, 10));
      if (year) query = query.eq('year', parseInt(year, 10));

      query = query.order('category', { ascending: true });

      const { data, error } = await query;
      if (error) {
        throw new Error(`Database error fetching budgets: ${error.message}`);
      }
      return data || [];
    }

    const store = loadData();
    return store.budgets.filter(b => {
      if (b.user_id !== userId) return false;
      if (month && b.month !== parseInt(month, 10)) return false;
      if (year && b.year !== parseInt(year, 10)) return false;
      return true;
    }).sort((a, b) => a.category.localeCompare(b.category));
  },

  /**
   * Find budget by ID ensuring user ownership
   */
  async findById(id, userId) {
    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw new Error(`Database error fetching budget: ${error.message}`);
      }
      return data;
    }

    const store = loadData();
    return store.budgets.find(b => b.id === id && b.user_id === userId) || null;
  },

  /**
   * Upsert a budget (create or update if exists for same user, category, month, year)
   */
  async upsertBudget({ userId, category, amount, month, year }) {
    const now = new Date().toISOString();
    const cleanAmount = parseFloat(amount);
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);
    const trimmedCategory = category.trim();

    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: userId,
            category: trimmedCategory,
            amount: cleanAmount,
            month: parsedMonth,
            year: parsedYear,
            updated_at: now
          },
          { onConflict: 'user_id, category, month, year' }
        )
        .select('*')
        .single();

      if (error) {
        throw new Error(`Database error saving budget: ${error.message}`);
      }
      return data;
    }

    const store = loadData();
    const existingIndex = store.budgets.findIndex(
      b => b.user_id === userId &&
           b.category.toLowerCase() === trimmedCategory.toLowerCase() &&
           b.month === parsedMonth &&
           b.year === parsedYear
    );

    if (existingIndex !== -1) {
      store.budgets[existingIndex] = {
        ...store.budgets[existingIndex],
        amount: cleanAmount,
        updated_at: now
      };
      saveData(store);
      return store.budgets[existingIndex];
    }

    const newBudget = {
      id: randomUUID(),
      user_id: userId,
      category: trimmedCategory,
      amount: cleanAmount,
      month: parsedMonth,
      year: parsedYear,
      created_at: now,
      updated_at: now
    };

    store.budgets.push(newBudget);
    saveData(store);
    return newBudget;
  },

  /**
   * Update budget by ID
   */
  async update(id, userId, updates) {
    const now = new Date().toISOString();
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => ['amount', 'category'].includes(key))
    );
    cleanUpdates.updated_at = now;
    if (cleanUpdates.amount !== undefined) cleanUpdates.amount = parseFloat(cleanUpdates.amount);

    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();

      if (error) {
        throw new Error(`Database error updating budget: ${error.message}`);
      }
      return data;
    }

    const store = loadData();
    const index = store.budgets.findIndex(b => b.id === id && b.user_id === userId);
    if (index === -1) return null;

    store.budgets[index] = {
      ...store.budgets[index],
      ...cleanUpdates
    };
    saveData(store);
    return store.budgets[index];
  },

  /**
   * Delete budget by ID
   */
  async delete(id, userId) {
    if (isConfigured() && supabase) {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Database error deleting budget: ${error.message}`);
      }
      return true;
    }

    const store = loadData();
    const initialLen = store.budgets.length;
    store.budgets = store.budgets.filter(b => !(b.id === id && b.user_id === userId));
    const wasDeleted = store.budgets.length < initialLen;
    if (wasDeleted) {
      saveData(store);
    }
    return wasDeleted;
  }
};

module.exports = BudgetModel;
