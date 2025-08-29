import { dateUtils } from '@/utils/dateUtils';
import { DateFilter } from '@/types/expense';

describe('dateUtils', () => {
  describe('formatCurrency', () => {
    test('should format currency in euros correctly', () => {
      expect(dateUtils.formatCurrency(15.50)).toContain('15,50');
      expect(dateUtils.formatCurrency(15.50)).toContain('€');
      expect(dateUtils.formatCurrency(1000)).toContain('1');
      expect(dateUtils.formatCurrency(1000)).toContain('000,00');
      expect(dateUtils.formatCurrency(0)).toContain('0,00');
    });

    test('should handle negative amounts', () => {
      const result = dateUtils.formatCurrency(-10.50);
      expect(result).toContain('-10,50');
      expect(result).toContain('€');
    });

    test('should handle decimal numbers', () => {
      const result = dateUtils.formatCurrency(15.678);
      expect(result).toContain('15,68');
      expect(result).toContain('€');
    });
  });

  describe('formatDate', () => {
    test('should format dates in French format', () => {
      const testDate = '2024-12-25T10:30:00.000Z';
      const formatted = dateUtils.formatDate(testDate);
      expect(formatted).toBe('25/12/2024');
    });

    test('should handle different date formats', () => {
      const testDate = '2024-01-05';
      const formatted = dateUtils.formatDate(testDate);
      expect(formatted).toBe('05/01/2024');
    });
  });

  describe('getFilteredDates', () => {
    const mockDates = [
      '2024-08-25T10:00:00.000Z', // 4 days ago
      '2024-08-26T10:00:00.000Z', // 3 days ago  
      '2024-08-27T10:00:00.000Z', // 2 days ago
      '2024-08-28T10:00:00.000Z', // 1 day ago
      '2024-08-29T10:00:00.000Z', // today
    ];

    beforeAll(() => {
      // Mock current date to 2024-08-29
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-08-29T12:00:00.000Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    test('should filter dates by day', () => {
      const filtered = dateUtils.getFilteredDates(mockDates, 'day');
      expect(filtered.length).toBeGreaterThan(0); // Should have at least today
      expect(filtered).toContain('2024-08-29T10:00:00.000Z'); // Should include today
    });

    test('should filter dates by week', () => {
      const filtered = dateUtils.getFilteredDates(mockDates, 'week');
      expect(filtered).toHaveLength(5); // All dates are within last 7 days
    });

    test('should filter dates by month', () => {
      const filtered = dateUtils.getFilteredDates(mockDates, 'month');
      expect(filtered).toHaveLength(5); // All dates are within last month
    });

    test('should filter dates by year', () => {
      const filtered = dateUtils.getFilteredDates(mockDates, 'year');
      expect(filtered).toHaveLength(5); // All dates are within last year
    });

    test('should return empty array for no matching dates', () => {
      const oldDates = ['2020-01-01T10:00:00.000Z'];
      const filtered = dateUtils.getFilteredDates(oldDates, 'day');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('groupByPeriod', () => {
    const mockDates = [
      '2024-08-25T10:00:00.000Z',
      '2024-08-25T15:00:00.000Z', // Same day
      '2024-08-26T10:00:00.000Z',
      '2024-09-01T10:00:00.000Z', // Different month
    ];

    test('should group dates by day', () => {
      const grouped = dateUtils.groupByPeriod(mockDates, 'day');
      expect(grouped['2024-08-25']).toBe(2);
      expect(grouped['2024-08-26']).toBe(1);
      expect(grouped['2024-09-01']).toBe(1);
    });

    test('should group dates by month', () => {
      const grouped = dateUtils.groupByPeriod(mockDates, 'month');
      expect(grouped['2024-08']).toBe(3);
      expect(grouped['2024-09']).toBe(1);
    });

    test('should group dates by year', () => {
      const grouped = dateUtils.groupByPeriod(mockDates, 'year');
      expect(grouped['2024']).toBe(4);
    });

    test('should group dates by week', () => {
      const grouped = dateUtils.groupByPeriod(mockDates, 'week');
      // Should group by week start date
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
    });

    test('should handle empty dates array', () => {
      const grouped = dateUtils.groupByPeriod([], 'day');
      expect(grouped).toEqual({});
    });
  });
});