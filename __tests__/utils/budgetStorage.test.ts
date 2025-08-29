import AsyncStorage from '@react-native-async-storage/async-storage';
import { budgetUtils } from '@/utils/budgetStorage';
import { Budget, BudgetRecurrence } from '@/types/budget';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('budgetUtils', () => {
  const mockBudget: Budget = {
    id: '1',
    title: 'Test Budget',
    description: 'Test Description',
    amount: 500,
    spent: 100,
    recurrence: 'monthly',
    createdAt: '2024-08-29T10:00:00.000Z',
    period: '2024-08',
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCurrentPeriod', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-08-29T12:00:00.000Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    test('should return date format for no recurrence', () => {
      const period = budgetUtils.getCurrentPeriod();
      expect(period).toBe('2024-08-29');
    });

    test('should return monthly format for monthly recurrence', () => {
      const period = budgetUtils.getCurrentPeriod('monthly');
      expect(period).toBe('2024-08');
    });

    test('should return yearly format for yearly recurrence', () => {
      const period = budgetUtils.getCurrentPeriod('yearly');
      expect(period).toBe('2024');
    });

    test('should return weekly format for weekly recurrence', () => {
      const period = budgetUtils.getCurrentPeriod('weekly');
      expect(period).toMatch(/2024-W\d{2}/);
    });

    test('should return date format for unknown recurrence', () => {
      const period = budgetUtils.getCurrentPeriod('unknown' as BudgetRecurrence);
      expect(period).toBe('2024-08-29');
    });
  });

  describe('getBudgets', () => {
    test('should return budgets from AsyncStorage', async () => {
      const mockData = JSON.stringify([mockBudget]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockData);

      const result = await budgetUtils.getBudgets();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('amlys_pay_budgets');
      expect(result).toEqual([mockBudget]);
    });

    test('should return empty array when no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await budgetUtils.getBudgets();

      expect(result).toEqual([]);
    });

    test('should handle errors and return empty array', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await budgetUtils.getBudgets();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error loading budgets:', expect.any(Error));
    });
  });

  describe('saveBudgets', () => {
    test('should save budgets to AsyncStorage', async () => {
      const budgets = [mockBudget];

      await budgetUtils.saveBudgets(budgets);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'amlys_pay_budgets',
        JSON.stringify(budgets)
      );
    });

    test('should handle save errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));
      const budgets = [mockBudget];

      await budgetUtils.saveBudgets(budgets);

      expect(console.error).toHaveBeenCalledWith('Error saving budgets:', expect.any(Error));
    });
  });

  describe('addBudget', () => {
    const newBudgetData = {
      title: 'New Budget',
      description: 'New Description',
      amount: 300,
      recurrence: 'weekly' as BudgetRecurrence,
      isActive: true,
    };

    test('should add new budget with generated values', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-08-29T12:00:00.000Z');

      await budgetUtils.addBudget(newBudgetData);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const call = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      expect(call[0]).toBe('amlys_pay_budgets');
      const savedBudget = JSON.parse(call[1])[0];
      expect(savedBudget.id).toBe('1234567890');
      expect(savedBudget.spent).toBe(0);
      expect(savedBudget.createdAt).toBe('2024-08-29T12:00:00.000Z');
    });
  });

  describe('updateBudget', () => {
    test('should update existing budget', async () => {
      const existingBudgets = [mockBudget];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingBudgets));

      await budgetUtils.updateBudget('1', { amount: 600, description: 'Updated' });

      const expectedBudget = {
        ...mockBudget,
        amount: 600,
        description: 'Updated',
      };

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'amlys_pay_budgets',
        JSON.stringify([expectedBudget])
      );
    });

    test('should do nothing if budget not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      await budgetUtils.updateBudget('nonexistent', { amount: 600 });

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('deleteBudget', () => {
    test('should remove budget from list', async () => {
      const budgets = [mockBudget, { ...mockBudget, id: '2' }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(budgets));

      await budgetUtils.deleteBudget('1');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'amlys_pay_budgets',
        JSON.stringify([{ ...mockBudget, id: '2' }])
      );
    });
  });

  describe('addSpentToBudget', () => {
    test('should add amount to existing budget in same period', async () => {
      const currentPeriodBudget = { ...mockBudget, period: '2025-08' }; // Match current test date
      const budgets = [currentPeriodBudget];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(budgets));

      await budgetUtils.addSpentToBudget('1', 50);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const call = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedBudget = JSON.parse(call[1])[0];
      expect(savedBudget.spent).toBe(150); // 100 + 50
    });

    test('should reset spent amount if period changed', async () => {
      const budgetWithOldPeriod = { ...mockBudget, period: '2024-07' };
      const budgets = [budgetWithOldPeriod];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(budgets));

      await budgetUtils.addSpentToBudget('1', 50);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const call = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedBudget = JSON.parse(call[1])[0];
      expect(savedBudget.spent).toBe(50); // Reset to new amount
    });

    test('should do nothing if budget not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      await budgetUtils.addSpentToBudget('nonexistent', 50);

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getActiveBudgets', () => {
    test('should return only active budgets', async () => {
      const budgets = [
        mockBudget,
        { ...mockBudget, id: '2', isActive: false },
        { ...mockBudget, id: '3', isActive: true },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(budgets));

      const result = await budgetUtils.getActiveBudgets();

      expect(result).toEqual([
        mockBudget,
        { ...mockBudget, id: '3', isActive: true },
      ]);
    });

    test('should return empty array when no active budgets', async () => {
      const budgets = [
        { ...mockBudget, isActive: false },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(budgets));

      const result = await budgetUtils.getActiveBudgets();

      expect(result).toEqual([]);
    });
  });

  describe('refreshBudgetPeriods', () => {
    test('should refresh periods and reset spent for expired budgets', async () => {
      const budgetWithOldPeriod = { ...mockBudget, period: '2024-07', spent: 200 };
      const budgets = [budgetWithOldPeriod];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(budgets));

      await budgetUtils.refreshBudgetPeriods();

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const call = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedBudget = JSON.parse(call[1])[0];
      expect(savedBudget.spent).toBe(0); // Reset
    });

    test('should not save if no changes needed', async () => {
      const currentBudget = { ...mockBudget, period: '2025-08' }; // Current period
      const budgets = [currentBudget];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(budgets));

      await budgetUtils.refreshBudgetPeriods();

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    test('should handle budgets without recurrence', async () => {
      const budgetWithoutRecurrence = { ...mockBudget, recurrence: undefined };
      const budgets = [budgetWithoutRecurrence];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(budgets));

      await budgetUtils.refreshBudgetPeriods();

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });
});