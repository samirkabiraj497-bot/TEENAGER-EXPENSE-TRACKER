const { supabase, isConfigured } = require('../config/supabase');
const { loadData, saveData, DEFAULT_CATEGORIES } = require('../config/localStore');
const { randomUUID } = require('crypto');

const CategoryModel = {
  /**
   * Get all expense categories
   */
  async getAll() {
    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Database error fetching categories: ${error.message}`);
      }
      return data || [];
    }

    // Local fallback
    const store = loadData();
    if (!store.categories || store.categories.length === 0) {
      store.categories = DEFAULT_CATEGORIES;
      saveData(store);
    }
    return store.categories.sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Find category by name
   */
  async findByName(name) {
    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .ilike('name', name.trim())
        .maybeSingle();

      if (error) {
        throw new Error(`Database error finding category: ${error.message}`);
      }
      return data;
    }

    const store = loadData();
    return store.categories.find(c => c.name.toLowerCase() === name.trim().toLowerCase()) || null;
  },

  /**
   * Create a new category
   */
  async create({ name, icon = 'Tag' }) {
    const trimmed = name.trim();
    const now = new Date().toISOString();

    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: trimmed, icon, created_at: now }])
        .select('*')
        .single();

      if (error) {
        throw new Error(`Database error creating category: ${error.message}`);
      }
      return data;
    }

    const store = loadData();
    const existing = store.categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      return existing;
    }

    const newCat = {
      id: randomUUID(),
      name: trimmed,
      icon,
      created_at: now
    };
    store.categories.push(newCat);
    saveData(store);
    return newCat;
  }
};

module.exports = CategoryModel;
