import { DateFilter } from '@/types/expense';

export const dateUtils = {
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  },

  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  },

  getFilteredDates(dates: string[], filter: DateFilter): string[] {
    const now = new Date();
    const startDate = new Date();

    switch (filter) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return dates.filter(date => new Date(date) >= startDate);
  },

  groupByPeriod(dates: string[], filter: DateFilter): Record<string, number> {
    const grouped: Record<string, number> = {};

    dates.forEach(date => {
      const d = new Date(date);
      let key: string;

      switch (filter) {
        case 'day':
          key = d.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = d.getFullYear().toString();
          break;
        default:
          key = d.toISOString().split('T')[0];
      }

      grouped[key] = (grouped[key] || 0) + 1;
    });

    return grouped;
  }
};