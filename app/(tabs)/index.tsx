import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Wallet, TrendingUp } from 'lucide-react-native';
import { Expense } from '@/types/expense';
import { ExpenseCard } from '@/components/ExpenseCard';
import { StatCard } from '@/components/StatCard';
import { storageUtils } from '@/utils/storage';
import { dateUtils } from '@/utils/dateUtils';

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = async () => {
    const loadedExpenses = await storageUtils.getActiveExpenses();
    setExpenses(loadedExpenses);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const handleIncrement = async (expenseId: string) => {
    await storageUtils.incrementExpense(expenseId);
    await loadExpenses();
  };

  const handleDelete = async (expenseId: string) => {
    await storageUtils.deleteExpense(expenseId);
    await loadExpenses();
  };

  const handleArchive = async (expenseId: string) => {
    await storageUtils.archiveExpense(expenseId);
    await loadExpenses();
  };
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const mostExpensive = expenses.length > 0 
    ? expenses.reduce((max, expense) => expense.totalAmount > max.totalAmount ? expense : max)
    : null;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>AmlysPay</Text>
        <Text style={styles.subtitle}>Suivez vos dépenses facilement</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Total des dépenses"
          value={dateUtils.formatCurrency(totalAmount)}
          color="#8B5CF6"
          icon={<Wallet size={24} color="#8B5CF6" />}
        />
        {mostExpensive && (
          <StatCard
            title="Plus gros poste"
            value={`${mostExpensive.title} (${dateUtils.formatCurrency(mostExpensive.totalAmount)})`}
            color="#F97316"
            icon={<TrendingUp size={24} color="#F97316" />}
          />
        )}
      </View>

      <View style={styles.expensesContainer}>
        <Text style={styles.sectionTitle}>Mes Dépenses</Text>
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune dépense enregistrée</Text>
            <Text style={styles.emptySubtext}>Ajoutez votre première dépense pour commencer</Text>
          </View>
        ) : (
          expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onIncrement={handleIncrement}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: '#8B5CF6',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -16,
  },
  expensesContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});