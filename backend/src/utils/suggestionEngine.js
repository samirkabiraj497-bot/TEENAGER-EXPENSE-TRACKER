/**
 * Produces transparent, rule-based recommendations from a user's own records.
 * These are informational prompts, not financial advice or guarantees.
 */
function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function totalForCategory(expenses, category) {
  return expenses
    .filter(expense => expense.category.toLowerCase() === category.toLowerCase())
    .reduce((total, expense) => total + Number(expense.amount), 0);
}

function generateSuggestions({ periodExpenses = [], currentMonthExpenses = [], previousMonthExpenses = [], budgets = [], topCategory = null, totalSpent = 0 }) {
  const suggestions = [];

  budgets.forEach(budget => {
    const limit = Number(budget.amount);
    const spent = Number(budget.spent || 0);
    const usage = limit > 0 ? (spent / limit) * 100 : 0;
    if (usage >= 100) {
      suggestions.push({ id: `budget-exceeded-${budget.category}`, type: 'alert', level: 'danger', icon: 'AlertTriangle', title: `${budget.category} budget exceeded`, category: budget.category, message: `You have spent ${formatCurrency(spent)} against your ${formatCurrency(limit)} monthly limit (${Math.round(usage)}% used).`, actionable: 'Pause discretionary spending in this category until next month.' });
    } else if (usage >= 80) {
      suggestions.push({ id: `budget-warning-${budget.category}`, type: 'warning', level: 'warning', icon: 'AlertCircle', title: `${budget.category} budget alert (${Math.round(usage)}% used)`, category: budget.category, message: `You have used ${formatCurrency(spent)} of your ${formatCurrency(limit)} budget, leaving ${formatCurrency(limit - spent)} this month.`, actionable: 'Track your remaining daily allowance closely.' });
    }
  });

  if (topCategory && totalSpent > 0) {
    const share = (topCategory.amount / totalSpent) * 100;
    if (share >= 30) {
      const categoryName = topCategory.category;
      const icon = categoryName.toLowerCase().includes('game') ? 'Gamepad2' : categoryName.toLowerCase().includes('shop') ? 'ShoppingBag' : categoryName.toLowerCase().includes('trans') ? 'Bus' : 'Utensils';
      suggestions.push({ id: `high-share-${categoryName}`, type: 'insight', level: 'info', icon, title: `${categoryName} is your biggest spending category`, category: categoryName, message: `You spent ${formatCurrency(topCategory.amount)} on ${categoryName}, or ${Math.round(share)}% of your recorded spending this month.`, actionable: `Consider a weekly target of about ${formatCurrency(Math.round(topCategory.amount / 4))} for ${categoryName}.` });
    }
  }

  const subscriptionExpenses = periodExpenses.filter(expense => expense.category.toLowerCase().includes('subscription') || /spotify|netflix|prime|discord|youtube/i.test(expense.title));
  if (subscriptionExpenses.length >= 2) {
    const total = subscriptionExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    suggestions.push({ id: 'subscriptions-audit', type: 'tip', level: 'info', icon: 'Tv', title: `Review ${subscriptionExpenses.length} subscriptions`, message: `You spent ${formatCurrency(total)} across multiple subscriptions this month.`, actionable: 'Keep the services you actively use and check for student plans.' });
  }

  const transportExpenses = periodExpenses.filter(expense => expense.category.toLowerCase().includes('transport') || /cab|uber|ola|auto/i.test(expense.title));
  const transportTotal = transportExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  if (totalSpent > 0 && transportTotal / totalSpent >= 0.2) {
    suggestions.push({ id: 'transport-check', type: 'tip', level: 'info', icon: 'Bus', title: 'Transportation is a large expense', message: `Transportation accounts for ${formatCurrency(transportTotal)} of your spending this month.`, actionable: 'Compare public transit, cycling, ride sharing, or student passes where practical.' });
  }

  ['Entertainment', 'Gaming', 'Food'].forEach(category => {
    const current = totalForCategory(currentMonthExpenses, category);
    const previous = totalForCategory(previousMonthExpenses, category);
    if (previous > 0 && current > previous * 1.25) {
      suggestions.push({ id: `mom-increase-${category}`, type: 'trend', level: 'warning', icon: 'TrendingUp', category, title: `${category} spending increased`, message: `Your ${category} spending is ${formatCurrency(current - previous)} higher than last month (${formatCurrency(current)} vs ${formatCurrency(previous)}).`, actionable: `A budget cap for ${category} can help prevent a month-end surprise.` });
    }
  });

  const microExpenses = periodExpenses.filter(expense => Number(expense.amount) <= 100);
  if (microExpenses.length >= 4) {
    const total = microExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    suggestions.push({ id: 'micro-spending-habit', type: 'habit', level: 'info', icon: 'Coffee', title: `Small purchases add up (${microExpenses.length} items)`, message: `You made ${microExpenses.length} purchases of ₹100 or less, totaling ${formatCurrency(total)}.`, actionable: 'Try one no-spend day each week and see what changes.' });
  }

  if (suggestions.length === 0) {
    suggestions.push({ id: 'general-good-job', type: 'tip', level: 'success', icon: 'CheckCircle', title: 'Great start on tracking your expenses', message: 'Keep recording expenses consistently. More records make the insights more useful.', actionable: 'Set category budgets under the Budgets tab when you are ready.' });
  }
  return suggestions;
}

module.exports = { generateSuggestions };
