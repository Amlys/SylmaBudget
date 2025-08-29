import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '@/types/expense';
import { budgetUtils } from './budgetStorage';

const EXPENSES_KEY = 'amlys_pay_expenses';

export const storageUtils = {
  async getExpenses(): Promise<Expense[]> {
    try {
      const data = await AsyncStorage.getItem(EXPENSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  },

  async saveExpenses(expenses: Expense[]): Promise<void> {
    try {
      await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'count' | 'totalAmount' | 'purchaseDates'>): Promise<void> {
    const expenses = await this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      count: 1,
      totalAmount: expense.amount,
      purchaseDates: [expense.createdAt],
    };
    expenses.push(newExpense);
    await this.saveExpenses(expenses);
    
    // Update budget if associated
    if (expense.budgetId) {
      await budgetUtils.addSpentToBudget(expense.budgetId, expense.amount);
    }
  },

  async incrementExpense(expenseId: string): Promise<void> {
    const expenses = await this.getExpenses();
    const expenseIndex = expenses.findIndex(e => e.id === expenseId);
    
    if (expenseIndex !== -1) {
      const expense = expenses[expenseIndex];
      const today = new Date().toISOString();
      
      expense.count += 1;
      expense.totalAmount += expense.amount;
      expense.lastPurchaseAt = today;
      expense.purchaseDates.push(today);
      
      await this.saveExpenses(expenses);
      
      // Update budget if associated
      if (expense.budgetId) {
        await budgetUtils.addSpentToBudget(expense.budgetId, expense.amount);
      }
    }
  },

  async deleteExpense(expenseId: string): Promise<void> {
    const expenses = await this.getExpenses();
    const filteredExpenses = expenses.filter(e => e.id !== expenseId);
    await this.saveExpenses(filteredExpenses);
  },

  async archiveExpense(expenseId: string): Promise<void> {
    const expenses = await this.getExpenses();
    const expenseIndex = expenses.findIndex(e => e.id === expenseId);
    
    if (expenseIndex !== -1) {
      expenses[expenseIndex].isArchived = true;
      await this.saveExpenses(expenses);
    }
  },

  async getActiveExpenses(): Promise<Expense[]> {
    const expenses = await this.getExpenses();
    return expenses.filter(e => !e.isArchived);
  }
};