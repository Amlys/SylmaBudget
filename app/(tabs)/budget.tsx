import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Plus, PiggyBank } from 'lucide-react-native';
import { Budget } from '@/types/budget';
import { BudgetCard } from '@/components/BudgetCard';
import { budgetUtils } from '@/utils/budgetStorage';
import { dateUtils } from '@/utils/dateUtils';

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadBudgets = async () => {
    // Refresh budget periods first
    await budgetUtils.refreshBudgetPeriods();
    const loadedBudgets = await budgetUtils.getBudgets();
    setBudgets(loadedBudgets);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
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

  const handleAddBudget = () => {
    router.push('/add-budget');
  };

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [])
  );

  const activeBudgets = budgets.filter(b => b.isActive);
  const inactiveBudgets = budgets.filter(b => !b.isActive);
  const totalBudget = activeBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = activeBudgets.reduce((sum, budget) => sum + budget.spent, 0);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mes Budgets</Text>
        <Text style={styles.subtitle}>Gérez vos budgets facilement</Text>
      </View>

      {activeBudgets.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <PiggyBank size={24} color="#8B5CF6" />
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>Total budgets actifs</Text>
              <Text style={styles.statValue}>{dateUtils.formatCurrency(totalBudget)}</Text>
              <Text style={styles.statSubtext}>
                Dépensé: {dateUtils.formatCurrency(totalSpent)} ({totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%)
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budgets Actifs</Text>
          <TouchableOpacity onPress={handleAddBudget} style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {activeBudgets.length === 0 ? (
          <View style={styles.emptyState}>
            <PiggyBank size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Aucun budget actif</Text>
            <Text style={styles.emptySubtext}>Créez votre premier budget pour commencer à suivre vos dépenses</Text>
            <TouchableOpacity onPress={handleAddBudget} style={styles.createButton}>
              <Text style={styles.createButtonText}>Créer un budget</Text>
            </TouchableOpacity>
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

        {inactiveBudgets.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, styles.inactiveSectionTitle]}>Budgets Inactifs</Text>
            {inactiveBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
                onToggleActive={handleToggleActive}
              />
            ))}
          </>
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
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statContent: {
    marginLeft: 16,
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  inactiveSectionTitle: {
    marginTop: 32,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});