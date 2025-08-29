import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChartBar as BarChart, Calendar, TrendingUp, Award } from 'lucide-react-native';
import { Expense, DateFilter } from '@/types/expense';
import { StatCard } from '@/components/StatCard';
import { storageUtils } from '@/utils/storage';
import { dateUtils } from '@/utils/dateUtils';

export default function DashboardScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<DateFilter>('month');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    const loadedExpenses = await storageUtils.getExpenses(); // On garde toutes les dépenses pour les stats
    setExpenses(loadedExpenses);
  };

  const getFilteredData = () => {
    const filteredExpenses = expenses.map(expense => ({
      ...expense,
      filteredDates: dateUtils.getFilteredDates(expense.purchaseDates, filter),
    })).filter(expense => expense.filteredDates.length > 0);

    const totalFiltered = filteredExpenses.reduce(
      (sum, expense) => sum + (expense.amount * expense.filteredDates.length), 
      0
    );

    const mostActive = filteredExpenses.length > 0 
      ? filteredExpenses.reduce((max, expense) => 
          expense.filteredDates.length > max.filteredDates.length ? expense : max
        )
      : null;

    const avgPerPurchase = filteredExpenses.length > 0
      ? totalFiltered / filteredExpenses.reduce((sum, expense) => sum + expense.filteredDates.length, 0)
      : 0;

    return { filteredExpenses, totalFiltered, mostActive, avgPerPurchase };
  };

  const { filteredExpenses, totalFiltered, mostActive, avgPerPurchase } = getFilteredData();

  const filterLabels: Record<DateFilter, string> = {
    day: 'Jour',
    week: 'Semaine',
    month: 'Mois',
    year: 'Année',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Analyse de vos dépenses</Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Période d'analyse:</Text>
        <View style={styles.filterButtons}>
          {(Object.keys(filterLabels) as DateFilter[]).map((filterKey) => (
            <TouchableOpacity
              key={filterKey}
              style={[
                styles.filterButton,
                filter === filterKey && styles.filterButtonActive
              ]}
              onPress={() => setFilter(filterKey)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === filterKey && styles.filterButtonTextActive
              ]}>
                {filterLabels[filterKey]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title={`Total - ${filterLabels[filter].toLowerCase()}`}
          value={dateUtils.formatCurrency(totalFiltered)}
          color="#8B5CF6"
          icon={<BarChart size={24} color="#8B5CF6" />}
        />
        
        {mostActive && (
          <StatCard
            title="Catégorie la plus active"
            value={`${mostActive.title} (${mostActive.filteredDates.length} achats)`}
            color="#F97316"
            icon={<Award size={24} color="#F97316" />}
          />
        )}
        
        <StatCard
          title="Moyenne par achat"
          value={dateUtils.formatCurrency(avgPerPurchase)}
          color="#10B981"
          icon={<TrendingUp size={24} color="#10B981" />}
        />
      </View>

      <View style={styles.expensesContainer}>
        <Text style={styles.sectionTitle}>Détail par catégorie</Text>
        {filteredExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Aucune dépense sur cette période</Text>
            <Text style={styles.emptySubtext}>
              Changez la période ou ajoutez des dépenses
            </Text>
          </View>
        ) : (
          filteredExpenses
            .sort((a, b) => (b.amount * b.filteredDates.length) - (a.amount * a.filteredDates.length))
            .map((expense) => {
              const periodTotal = expense.amount * expense.filteredDates.length;
              const percentage = totalFiltered > 0 ? (periodTotal / totalFiltered) * 100 : 0;
              
              return (
                <View key={expense.id} style={styles.expenseCard}>
                  <View style={styles.expenseHeader}>
                    <View style={styles.expenseIcon}>
                      <Text style={styles.expenseIconText}>{expense.icon}</Text>
                    </View>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.expenseTitle}>{expense.title}</Text>
                      <Text style={styles.expenseAmount}>
                        {dateUtils.formatCurrency(periodTotal)}
                      </Text>
                    </View>
                    <View style={styles.expenseStats}>
                      <Text style={styles.expenseCount}>
                        {expense.filteredDates.length} achat{expense.filteredDates.length > 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.expensePercentage}>
                        {percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${percentage}%` }
                      ]} 
                    />
                  </View>
                </View>
              );
            })
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
    backgroundColor: '#F97316',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FED7AA',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  expensesContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
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
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseIconText: {
    fontSize: 20,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F97316',
  },
  expenseStats: {
    alignItems: 'flex-end',
  },
  expenseCount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  expensePercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 2,
  },
});