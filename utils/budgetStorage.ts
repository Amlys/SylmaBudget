import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget, BudgetRecurrence } from '@/types/budget';

const BUDGETS_KEY = 'amlys_pay_budgets';

export const budgetUtils = {
  getCurrentPeriod(recurrence?: BudgetRecurrence): string {
    const now = new Date();
    
    if (!recurrence) {
      return now.toISOString().split('T')[0]; // YYYY-MM-DD pour one-time
    }
    
    switch (recurrence) {
      case 'weekly':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
      case 'monthly':
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      case 'yearly':
        return now.getFullYear().toString();
      default:
        return now.toISOString().split('T')[0];
    }
  },

  async getBudgets(): Promise<Budget[]> {
    try {
      const data = await AsyncStorage.getItem(BUDGETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading budgets:', error);
      return [];
    }
  },

  async saveBudgets(budgets: Budget[]): Promise<void> {
    try {
      await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  },

  async addBudget(budget: Omit<Budget, 'id' | 'spent' | 'period' | 'createdAt'>): Promise<void> {
    const budgets = await this.getBudgets();
    const currentPeriod = this.getCurrentPeriod(budget.recurrence);
    
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      spent: 0,
      period: currentPeriod,
      createdAt: new Date().toISOString(),
    };
    
    budgets.push(newBudget);
    await this.saveBudgets(budgets);
  },

  async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<void> {
    const budgets = await this.getBudgets();
    const budgetIndex = budgets.findIndex(b => b.id === budgetId);
    
    if (budgetIndex !== -1) {
      budgets[budgetIndex] = { ...budgets[budgetIndex], ...updates };
      await this.saveBudgets(budgets);
    }
  },

  async deleteBudget(budgetId: string): Promise<void> {
    const budgets = await this.getBudgets();
    const filteredBudgets = budgets.filter(b => b.id !== budgetId);
    await this.saveBudgets(filteredBudgets);
  },

  async addSpentToBudget(budgetId: string, amount: number): Promise<void> {
    const budgets = await this.getBudgets();
    const budgetIndex = budgets.findIndex(b => b.id === budgetId);
    
    if (budgetIndex !== -1) {
      const budget = budgets[budgetIndex];
      const currentPeriod = this.getCurrentPeriod(budget.recurrence);
      
      // Si la période a changé, réinitialiser le montant dépensé
      if (budget.period !== currentPeriod) {
        budget.spent = amount;
        budget.period = currentPeriod;
      } else {
        budget.spent += amount;
      }
      
      await this.saveBudgets(budgets);
    }
  },

  async getActiveBudgets(): Promise<Budget[]> {
    const budgets = await this.getBudgets();
    return budgets.filter(b => b.isActive);
  },

  async refreshBudgetPeriods(): Promise<void> {
    const budgets = await this.getBudgets();
    let hasChanges = false;

    for (const budget of budgets) {
      if (budget.recurrence) {
        const currentPeriod = this.getCurrentPeriod(budget.recurrence);
        if (budget.period !== currentPeriod) {
          budget.period = currentPeriod;
          budget.spent = 0; // Reset spent amount for new period
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      await this.saveBudgets(budgets);
    }
  }
};