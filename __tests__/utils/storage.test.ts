import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageUtils } from '@/utils/storage';
import { budgetUtils } from '@/utils/budgetStorage';
import { Expense } from '@/types/expense';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock budgetUtils
jest.mock('@/utils/budgetStorage', () => ({
  budgetUtils: {
    addSpentToBudget: jest.fn(),
  },
}));

describe('storageUtils', () => {
  const mockExpense: Expense = {
    id: '1',
    title: 'Test Expense',
    amount: 10.50,
    icon: '🍕',
    count: 1,
    totalAmount: 10.50,
    createdAt: '2024-08-29T10:00:00.000Z',
    lastPurchaseAt: '2024-08-29T10:00:00.000Z',
    purchaseDates: ['2024-08-29T10:00:00.000Z'],
    isArchived: false,
    budgetId: 'budget-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getExpenses', () => {
    test('should return expenses from AsyncStorage', async () => {
      const mockData = JSON.stringify([mockExpense]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockData);

      const result = await storageUtils.getExpenses();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('amlys_pay_expenses');
      expect(result).toEqual([mockExpense]);
    });

    test('should return empty array when no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageUtils.getExpenses();

      expect(result).toEqual([]);
    });

    test('should handle errors and return empty array', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await storageUtils.getExpenses();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error loading expenses:', expect.any(Error));
    });
  });

  describe('saveExpenses', () => {
    test('should save expenses to AsyncStorage', async () => {
      const expenses = [mockExpense];

      await storageUtils.saveExpenses(expenses);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'amlys_pay_expenses',
        JSON.stringify(expenses)
      );
    });

    test('should handle save errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));
      const expenses = [mockExpense];

      await storageUtils.saveExpenses(expenses);

      expect(console.error).toHaveBeenCalledWith('Error saving expenses:', expect.any(Error));
    });
  });

  describe('addExpense', () => {
    const newExpenseData = {
      title: 'New Expense',
      amount: 15.75,
      icon: '🍔',
      createdAt: '2024-08-29T12:00:00.000Z',
      lastPurchaseAt: '2024-08-29T12:00:00.000Z',
      budgetId: 'budget-2',
    };

    test('should add new expense with generated id and default values', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);

      await storageUtils.addExpense(newExpenseData);

      const expectedExpense = {
        ...newExpenseData,
        id: '1234567890',
        count: 1,
        totalAmount: 15.75,
        purchaseDates: [newExpenseData.createdAt],
      };

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'amlys_pay_expenses',
        JSON.stringify([expectedExpense])
      );
      expect(budgetUtils.addSpentToBudget).toHaveBeenCalledWith('budget-2', 15.75);
    });

    test('should not update budget if no budgetId provided', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      const expenseWithoutBudget = { ...newExpenseData };
      delete expenseWithoutBudget.budgetId;

      await storageUtils.addExpense(expenseWithoutBudget);

      expect(budgetUtils.addSpentToBudget).not.toHaveBeenCalled();
    });
  });

  describe('incrementExpense', () => {
    test('should increment expense count and amount', async () => {
      const existingExpenses = [mockExpense];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingExpenses));
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-08-29T14:00:00.000Z');

      await storageUtils.incrementExpense('1');

      const expectedExpense = {
        ...mockExpense,
        count: 2,
        totalAmount: 21.00,
        lastPurchaseAt: '2024-08-29T14:00:00.000Z',
        purchaseDates: ['2024-08-29T10:00:00.000Z', '2024-08-29T14:00:00.000Z'],
      };

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'amlys_pay_expenses',
        JSON.stringify([expectedExpense])
      );
      expect(budgetUtils.addSpentToBudget).toHaveBeenCalledWith('budget-1', 10.50);
    });

    test('should do nothing if expense not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      await storageUtils.incrementExpense('nonexistent');

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(budgetUtils.addSpentToBudget).not.toHaveBeenCalled();
    });
  });

  describe('deleteExpense', () => {
    test('should remove expense from list', async () => {
      const expenses = [mockExpense, { ...mockExpense, id: '2' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expenses));

      await storageUtils.deleteExpense('1');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'amlys_pay_expenses',
        JSON.stringify([{ ...mockExpense, id: '2' }])
      );
    });
  });

  describe('archiveExpense', () => {
    test('should set expense as archived', async () => {
      const expenses = [mockExpense];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expenses));

      await storageUtils.archiveExpense('1');

      const expectedExpense = { ...mockExpense, isArchived: true };
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'amlys_pay_expenses',
        JSON.stringify([expectedExpense])
      );
    });

    test('should do nothing if expense not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      await storageUtils.archiveExpense('nonexistent');

      // Should not call setItem since no expense was found
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getActiveExpenses', () => {
    test('should return only non-archived expenses', async () => {
      const expenses = [
        mockExpense,
        { ...mockExpense, id: '2', isArchived: true },
        { ...mockExpense, id: '3', isArchived: false },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expenses));

      const result = await storageUtils.getActiveExpenses();

      expect(result).toEqual([
        mockExpense,
        { ...mockExpense, id: '3', isArchived: false },
      ]);
    });

    test('should return empty array when all expenses are archived', async () => {
      const expenses = [
        { ...mockExpense, isArchived: true },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expenses));

      const result = await storageUtils.getActiveExpenses();

      expect(result).toEqual([]);
    });
  });
});