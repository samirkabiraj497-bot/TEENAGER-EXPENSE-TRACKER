import api from './api';

const analyticsService = {
  async getSummary(period = 'month', from = null, to = null) {
    const params = { period };
    if (from) params.from = from;
    if (to) params.to = to;
    return api.get('/analytics/summary', { params });
  },

  async getCategoryAnalytics(period = 'month', from = null, to = null) {
    const params = { period };
    if (from) params.from = from;
    if (to) params.to = to;
    return api.get('/analytics/category', { params });
  },

  async getTimelineAnalytics(period = 'month', from = null, to = null) {
    const params = { period };
    if (from) params.from = from;
    if (to) params.to = to;
    return api.get('/analytics/monthly', { params });
  },

  async getComparison() {
    return api.get('/analytics/comparison');
  },

  async getSuggestions() {
    return api.get('/analytics/suggestions');
  }
};

export default analyticsService;
