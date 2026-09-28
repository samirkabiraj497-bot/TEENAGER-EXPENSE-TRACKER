import api from './api';

const budgetService = {
  async getBudgets(month, year) {
    return api.get('/budgets', {
      params: { month, year }
    });
  },

  async saveBudget({ category, amount, month, year }) {
    return api.post('/budgets', { category, amount, month, year });
  },

  async updateBudget(id, { category, amount }) {
    return api.put(`/budgets/${id}`, { category, amount });
  },

  async deleteBudget(id) {
    return api.delete(`/budgets/${id}`);
  }
};

export default budgetService;
