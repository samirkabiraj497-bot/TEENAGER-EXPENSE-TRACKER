const ExpenseModel = require('../models/expenseModel');
const BudgetModel = require('../models/budgetModel');
const { generateSuggestions } = require('../utils/suggestionEngine');

/**
 * Helper to compute date range based on filter name
 */
function resolveDateRange(filter, customFrom, customTo) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayStr = now.toISOString().split('T')[0];

  switch (filter) {
    case 'today':
      return { from: todayStr, to: todayStr, label: 'Today' };

    case 'week': {
      // Start of current week (Monday)
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diffToMonday));
      const fromStr = monday.toISOString().split('T')[0];
      return { from: fromStr, to: todayStr, label: 'This Week' };
    }

    case 'last_month': {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const lastDayOfPrev = new Date(prevYear, prevMonth + 1, 0).getDate();
      const fromStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-01`;
      const toStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(lastDayOfPrev).padStart(2, '0')}`;
      return { from: fromStr, to: toStr, label: 'Last Month' };
    }

    case 'year': {
      return { from: `${year}-01-01`, to: `${year}-12-31`, label: 'This Year' };
    }

    case 'custom': {
      return {
        from: customFrom || `${year}-${String(month + 1).padStart(2, '0')}-01`,
        to: customTo || todayStr,
        label: 'Custom Range'
      };
    }

    case 'month':
    default: {
      const lastDay = new Date(year, month + 1, 0).getDate();
      const fromStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const toStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      return { from: fromStr, to: toStr, label: 'This Month' };
    }
  }
}

const AnalyticsController = {
  /**
   * Get Dashboard Summary
   * GET /api/analytics/summary
   */
  async getSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const { period = 'month', from, to } = req.query;

      const dateRange = resolveDateRange(period, from, to);
      const expenses = await ExpenseModel.getForPeriod(userId, dateRange.from, dateRange.to);

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const todayExpenses = expenses.filter(e => e.expense_date === todayStr);
      const todaySpent = todayExpenses.reduce((s, e) => s + Number(e.amount), 0);

      const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
      const transactionCount = expenses.length;

      // Calculate days in period for average
      const startDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);
      const diffTime = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
      const averageDailySpending = totalSpent > 0 ? (totalSpent / diffTime) : 0;

      // Group by Category
      const catTotals = {};
      expenses.forEach(e => {
        catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount);
      });

      let topCategory = null;
      let highestCatAmount = 0;
      Object.keys(catTotals).forEach(cat => {
        if (catTotals[cat] > highestCatAmount) {
          highestCatAmount = catTotals[cat];
          topCategory = {
            category: cat,
            amount: Number(highestCatAmount.toFixed(2)),
            percentage: totalSpent > 0 ? Math.round((highestCatAmount / totalSpent) * 100) : 0
          };
        }
      });

      // Budgets for current month
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const rawBudgets = await BudgetModel.findUserBudgets(userId, currentMonth, currentYear);
      const totalBudget = rawBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
      const remainingBudget = Math.max(0, totalBudget - totalSpent);

      // Health Indicators (informative metrics based on actual records)
      const budgetUsagePercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      const savingsPotential = Math.max(0, totalBudget - totalSpent);
      
      // Spending consistency score: check standard deviation across active days
      let spendingConsistencyScore = 85;
      if (transactionCount > 2) {
        const amounts = expenses.map(e => Number(e.amount));
        const avg = totalSpent / transactionCount;
        const variance = amounts.reduce((acc, a) => acc + Math.pow(a - avg, 2), 0) / transactionCount;
        const stdDev = Math.sqrt(variance);
        // Normalized score
        spendingConsistencyScore = Math.max(40, Math.min(95, Math.round(100 - (stdDev / (avg || 1)) * 20)));
      }

      const categoryConcentration = topCategory ? topCategory.percentage : 0;

      return res.status(200).json({
        success: true,
        data: {
          period: dateRange.label,
          fromDate: dateRange.from,
          toDate: dateRange.to,
          totalSpent: Number(totalSpent.toFixed(2)),
          todaySpent: Number(todaySpent.toFixed(2)),
          averageDailySpending: Number(averageDailySpending.toFixed(2)),
          totalBudget: Number(totalBudget.toFixed(2)),
          remainingBudget: Number(remainingBudget.toFixed(2)),
          topCategory,
          transactionCount,
          healthIndicators: {
            budgetUsagePercent,
            savingsPotential: Number(savingsPotential.toFixed(2)),
            spendingConsistencyScore,
            categoryConcentration,
            disclaimer: 'Indicators are calculated from your recorded spending and do not constitute financial advice.'
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get Category Spending breakdown for Donut and Bar charts
   * GET /api/analytics/category
   */
  async getCategoryAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const { period = 'month', from, to } = req.query;

      const dateRange = resolveDateRange(period, from, to);
      const expenses = await ExpenseModel.getForPeriod(userId, dateRange.from, dateRange.to);

      const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);

      // Group totals
      const categoryMap = {};
      expenses.forEach(e => {
        if (!categoryMap[e.category]) {
          categoryMap[e.category] = {
            category: e.category,
            total: 0,
            count: 0
          };
        }
        categoryMap[e.category].total += Number(e.amount);
        categoryMap[e.category].count += 1;
      });

      const categoriesData = Object.values(categoryMap).map(c => ({
        category: c.category,
        total: Number(c.total.toFixed(2)),
        count: c.count,
        percentage: totalSpent > 0 ? Number(((c.total / totalSpent) * 100).toFixed(1)) : 0
      })).sort((a, b) => b.total - a.total);

      return res.status(200).json({
        success: true,
        data: {
          totalSpent: Number(totalSpent.toFixed(2)),
          categories: categoriesData
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get Timeline/Daily/Weekly spending line chart data
   * GET /api/analytics/monthly
   */
  async getTimelineAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const { period = 'month', from, to } = req.query;

      const dateRange = resolveDateRange(period, from, to);
      const expenses = await ExpenseModel.getForPeriod(userId, dateRange.from, dateRange.to);

      // Map spending by date
      const dateMap = {};
      expenses.forEach(e => {
        const d = e.expense_date;
        dateMap[d] = (dateMap[d] || 0) + Number(e.amount);
      });

      // Generate all dates in period so line chart has continuous dates
      const timeline = [];
      const current = new Date(dateRange.from);
      const end = new Date(dateRange.to);

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const dayLabel = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        timeline.push({
          date: dateStr,
          label: dayLabel,
          amount: Number((dateMap[dateStr] || 0).toFixed(2))
        });
        current.setDate(current.getDate() + 1);
      }

      // Group by weeks for compact view if period is long
      const weeklyBuckets = [];
      let currentWeekAmount = 0;
      let weekNum = 1;
      timeline.forEach((day, index) => {
        currentWeekAmount += day.amount;
        if ((index + 1) % 7 === 0 || index === timeline.length - 1) {
          weeklyBuckets.push({
            name: `Week ${weekNum}`,
            amount: Number(currentWeekAmount.toFixed(2))
          });
          currentWeekAmount = 0;
          weekNum++;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          dailyTimeline: timeline,
          weeklyTimeline: weeklyBuckets
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Month-to-Month comparison: Current Month vs Previous Month
   * GET /api/analytics/comparison
   */
  async getComparison(req, res, next) {
    try {
      const userId = req.user.id;
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Current month dates
      const curFirst = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const curLastDay = new Date(currentYear, currentMonth, 0).getDate();
      const curLast = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(curLastDay).padStart(2, '0')}`;

      // Previous month dates
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
      const prevFirst = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
      const prevLast = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;

      const [curExpenses, prevExpenses] = await Promise.all([
        ExpenseModel.getForPeriod(userId, curFirst, curLast),
        ExpenseModel.getForPeriod(userId, prevFirst, prevLast)
      ]);

      const curTotal = curExpenses.reduce((s, e) => s + Number(e.amount), 0);
      const prevTotal = prevExpenses.reduce((s, e) => s + Number(e.amount), 0);

      const diff = curTotal - prevTotal;
      const percentageChange = prevTotal > 0 ? Math.round(((curTotal - prevTotal) / prevTotal) * 100) : 0;

      const curAvg = curExpenses.length > 0 ? (curTotal / curExpenses.length) : 0;
      const prevAvg = prevExpenses.length > 0 ? (prevTotal / prevExpenses.length) : 0;

      // Group categories comparison
      const categorySet = new Set([
        ...curExpenses.map(e => e.category),
        ...prevExpenses.map(e => e.category)
      ]);

      const categoriesComparison = Array.from(categorySet).map(cat => {
        const curCat = curExpenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0);
        const prevCat = prevExpenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0);
        return {
          category: cat,
          currentMonth: Number(curCat.toFixed(2)),
          previousMonth: Number(prevCat.toFixed(2)),
          diff: Number((curCat - prevCat).toFixed(2))
        };
      }).sort((a, b) => b.currentMonth - a.currentMonth);

      return res.status(200).json({
        success: true,
        data: {
          currentMonth: {
            month: currentMonth,
            year: currentYear,
            total: Number(curTotal.toFixed(2)),
            transactionCount: curExpenses.length,
            averageTransaction: Number(curAvg.toFixed(2))
          },
          previousMonth: {
            month: prevMonth,
            year: prevYear,
            total: Number(prevTotal.toFixed(2)),
            transactionCount: prevExpenses.length,
            averageTransaction: Number(prevAvg.toFixed(2))
          },
          difference: Number(diff.toFixed(2)),
          percentageChange,
          trend: diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'unchanged',
          categories: categoriesComparison
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Smart Spending Suggestions based on actual database entries
   * GET /api/analytics/suggestions
   */
  async getSuggestions(req, res, next) {
    try {
      const userId = req.user.id;
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Current month range
      const curFirst = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const curLastDay = new Date(currentYear, currentMonth, 0).getDate();
      const curLast = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(curLastDay).padStart(2, '0')}`;

      // Prev month range
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
      const prevFirst = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
      const prevLast = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`;

      const [curExpenses, prevExpenses, userBudgets] = await Promise.all([
        ExpenseModel.getForPeriod(userId, curFirst, curLast),
        ExpenseModel.getForPeriod(userId, prevFirst, prevLast),
        BudgetModel.findUserBudgets(userId, currentMonth, currentYear)
      ]);

      // Enrich budgets with spent amounts
      const categorySpent = {};
      curExpenses.forEach(e => {
        categorySpent[e.category] = (categorySpent[e.category] || 0) + Number(e.amount);
      });

      const enrichedBudgets = userBudgets.map(b => ({
        ...b,
        spent: categorySpent[b.category] || 0
      }));

      const totalSpent = curExpenses.reduce((s, e) => s + Number(e.amount), 0);

      // Find top category
      let topCategory = null;
      let maxCatSpent = 0;
      Object.keys(categorySpent).forEach(cat => {
        if (categorySpent[cat] > maxCatSpent) {
          maxCatSpent = categorySpent[cat];
          topCategory = { category: cat, amount: maxCatSpent };
        }
      });

      const suggestions = generateSuggestions({
        periodExpenses: curExpenses,
        currentMonthExpenses: curExpenses,
        previousMonthExpenses: prevExpenses,
        budgets: enrichedBudgets,
        topCategory,
        totalSpent
      });

      return res.status(200).json({
        success: true,
        data: suggestions
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AnalyticsController;
