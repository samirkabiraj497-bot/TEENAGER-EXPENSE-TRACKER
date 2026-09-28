const fs = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../../data.json');

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Food', icon: 'Utensils', created_at: new Date().toISOString() },
  { id: '2', name: 'Transport', icon: 'Bus', created_at: new Date().toISOString() },
  { id: '3', name: 'Education', icon: 'BookOpen', created_at: new Date().toISOString() },
  { id: '4', name: 'Entertainment', icon: 'Film', created_at: new Date().toISOString() },
  { id: '5', name: 'Shopping', icon: 'ShoppingBag', created_at: new Date().toISOString() },
  { id: '6', name: 'Gaming', icon: 'Gamepad2', created_at: new Date().toISOString() },
  { id: '7', name: 'Subscriptions', icon: 'Tv', created_at: new Date().toISOString() },
  { id: '8', name: 'Mobile/Data', icon: 'Smartphone', created_at: new Date().toISOString() },
  { id: '9', name: 'Sports', icon: 'Dumbbell', created_at: new Date().toISOString() },
  { id: '10', name: 'Travel', icon: 'Plane', created_at: new Date().toISOString() },
  { id: '11', name: 'Personal Care', icon: 'Sparkles', created_at: new Date().toISOString() },
  { id: '12', name: 'Gifts', icon: 'Gift', created_at: new Date().toISOString() },
  { id: '13', name: 'Other', icon: 'Tag', created_at: new Date().toISOString() }
];

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      users: [],
      expenses: [],
      budgets: [],
      categories: DEFAULT_CATEGORIES
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: [], expenses: [], budgets: [], categories: DEFAULT_CATEGORIES };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  loadData,
  saveData,
  DEFAULT_CATEGORIES
};
