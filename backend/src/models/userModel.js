const { supabase, isConfigured } = require('../config/supabase');
const { loadData, saveData } = require('../config/localStore');
const { randomUUID } = require('crypto');

const UserModel = {
  /**
   * Find a user by email
   */
  async findByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();

    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) {
        throw new Error(`Database error finding user: ${error.message}`);
      }
      return data;
    }

    // Local fallback
    const store = loadData();
    return store.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  },

  /**
   * Find a user by ID
   */
  async findById(id) {
    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, created_at, updated_at')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Database error finding user by ID: ${error.message}`);
      }
      return data;
    }

    // Local fallback
    const store = loadData();
    const user = store.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  /**
   * Create a new user
   */
  async create({ name, email, password_hash }) {
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            name: name.trim(),
            email: normalizedEmail,
            password_hash,
            created_at: now,
            updated_at: now
          }
        ])
        .select('id, name, email, created_at, updated_at')
        .single();

      if (error) {
        throw new Error(`Database error creating user: ${error.message}`);
      }
      return data;
    }

    // Local fallback
    const store = loadData();
    const newUser = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
      created_at: now,
      updated_at: now
    };
    store.users.push(newUser);
    saveData(store);

    const { password_hash: _, ...safeUser } = newUser;
    return safeUser;
  },

  /**
   * Update user details
   */
  async update(id, updates) {
    const now = new Date().toISOString();

    if (isConfigured() && supabase) {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select('id, name, email, created_at, updated_at')
        .single();

      if (error) {
        throw new Error(`Database error updating user: ${error.message}`);
      }
      return data;
    }

    // Local fallback
    const store = loadData();
    const index = store.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    store.users[index] = {
      ...store.users[index],
      ...updates,
      updated_at: now
    };
    saveData(store);
    const { password_hash, ...safeUser } = store.users[index];
    return safeUser;
  }
};

module.exports = UserModel;
