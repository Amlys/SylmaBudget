import React from 'react';
import { StatCard } from '@/components/StatCard';

// Test basique pour la couverture de code
describe('StatCard', () => {
  const mockIcon = React.createElement('div', { 'data-testid': 'mock-icon' }, '📊');

  const defaultProps = {
    title: 'Test Title',
    value: '100,00 €',
    color: '#8B5CF6',
    icon: mockIcon,
  };

  test('should create StatCard component without throwing', () => {
    expect(() => {
      const component = StatCard(defaultProps);
      expect(component).toBeTruthy();
      expect(component.type).toBe('View');
    }).not.toThrow();
  });

  test('should handle different props without throwing', () => {
    expect(() => {
      const component = StatCard({
        title: 'Monthly Total',
        value: '1,500.50 €',
        color: '#FF0000',
        icon: mockIcon,
      });
      expect(component).toBeTruthy();
    }).not.toThrow();
  });
});