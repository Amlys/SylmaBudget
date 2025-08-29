import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Wallet, TrendingUp, Repeat, Hash, PiggyBank } from 'lucide-react-native';
import { Expense } from '@/types/expense';
import { Budget } from '@/types/budget';
import { ExpenseCard } from '@/components/ExpenseCard';
import { BudgetCard } from '@/components/BudgetCard';
import { StatCard } from '@/components/StatCard';
import { storageUtils } from '@/utils/storage';
import { budgetUtils } from '@/utils/budgetStorage';
import { dateUtils } from '@/utils/dateUtils';
import { router } from 'expo-router';

type TabType = 'recurring' | 'unique' | 'budgets';

export default function HomeScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('recurring');

  const loadExpenses = async () => {
    const loadedExpenses = await storageUtils.getActiveExpenses();
    setExpenses(loadedExpenses);
  };

  const loadBudgets = async () => {
    await budgetUtils.refreshBudgetPeriods();
    const loadedBudgets = await budgetUtils.getBudgets();
    setBudgets(loadedBudgets);
  };

  const loadData = async () => {
    await Promise.all([loadExpenses(), loadBudgets()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
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

  const handleEditBudget = (budget: Budget) => {
    router.push(`/add-budget?budgetId=${budget.id}`);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    await budgetUtils.deleteBudget(budgetId);
    await loadBudgets();
  };

  const handleToggleActive = async (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      await budgetUtils.updateBudget(budgetId, { isActive: !budget.isActive });
      await loadBudgets();
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Séparer les dépenses récurrentes et uniques
  const recurringExpenses = expenses.filter(expense => expense.isRecurring ?? true);
  const uniqueExpenses = expenses.filter(expense => expense.isRecurring === false);
  const activeBudgets = budgets.filter(b => b.isActive);

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const mostExpensive = expenses.length > 0 
    ? expenses.reduce((max, expense) => expense.totalAmount > max.totalAmount ? expense : max)
    : null;

  const renderTabButton = (tab: TabType, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'recurring':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Dépenses Récurrentes</Text>
            {recurringExpenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Repeat size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>Aucune dépense récurrente</Text>
                <Text style={styles.emptySubtext}>Les dépenses récurrentes peuvent être incrémentées</Text>
              </View>
            ) : (
              recurringExpenses.map((expense) => (
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
        );

      case 'unique':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Dépenses Uniques</Text>
            {uniqueExpenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Hash size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>Aucune dépense unique</Text>
                <Text style={styles.emptySubtext}>Les dépenses uniques ne peuvent pas être incrémentées</Text>
              </View>
            ) : (
              uniqueExpenses.map((expense) => (
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
        );

      case 'budgets':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Budgets Actifs</Text>
            {activeBudgets.length === 0 ? (
              <View style={styles.emptyState}>
                <PiggyBank size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>Aucun budget actif</Text>
                <Text style={styles.emptySubtext}>Créez un budget dans l'onglet Budget</Text>
              </View>
            ) : (
              activeBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEditBudget}
                  onDelete={handleDeleteBudget}
                  onToggleActive={handleToggleActive}
                />
              ))
            )}
          </View>
        );

      default:
        return null;
    }
  };

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

      <View style={styles.tabsContainer}>
        {renderTabButton('recurring', 'Récurrentes', <Repeat size={20} color={activeTab === 'recurring' ? '#FFFFFF' : '#6B7280'} />)}
        {renderTabButton('unique', 'Uniques', <Hash size={20} color={activeTab === 'unique' ? '#FFFFFF' : '#6B7280'} />)}
        {renderTabButton('budgets', 'Budgets', <PiggyBank size={20} color={activeTab === 'budgets' ? '#FFFFFF' : '#6B7280'} />)}
      </View>

      {renderContent()}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  contentContainer: {
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});