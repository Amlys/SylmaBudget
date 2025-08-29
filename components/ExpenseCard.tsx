import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Plus, Trash2, Archive } from 'lucide-react-native';
import { Expense } from '@/types/expense';
import { dateUtils } from '@/utils/dateUtils';

interface ExpenseCardProps {
  expense: Expense;
  onIncrement: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export function ExpenseCard({ expense, onIncrement, onDelete, onArchive }: ExpenseCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'Supprimer la dépense',
      `Êtes-vous sûr de vouloir supprimer définitivement "${expense.title}" ?\n\nCette action supprimera toutes les données et ne peut pas être annulée.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(expense.id) }
      ]
    );
  };

  const handleArchive = () => {
    Alert.alert(
      'Archiver la dépense',
      `Voulez-vous archiver "${expense.title}" ?\n\nLa dépense sera masquée mais les montants seront conservés dans les totaux.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Archiver', onPress: () => onArchive(expense.id) }
      ]
    );
  };

  // Calcul du budget individuel
  const hasBudget = expense.budgetAmount && expense.budgetRecurrence;
  const budgetSpent = expense.budgetSpent || 0;
  const budgetProgress = hasBudget ? (budgetSpent / expense.budgetAmount!) * 100 : 0;
  const budgetProgressClamped = Math.min(budgetProgress, 100); // Pour la barre visuelle

  const getBudgetPeriodLabel = (recurrence: string) => {
    switch (recurrence) {
      case 'weekly': return 'semaine';
      case 'monthly': return 'mois';
      case 'yearly': return 'année';
      default: return 'période';
    }
  };

  const getBudgetProgressColor = (progress: number) => {
    if (progress <= 50) return '#10B981'; // Vert
    if (progress <= 80) return '#F59E0B'; // Orange
    return '#EF4444'; // Rouge
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{expense.icon}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleArchive} style={styles.actionButton}>
            <Archive size={18} color="#F59E0B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{expense.title}</Text>
        <Text style={styles.amount}>{dateUtils.formatCurrency(expense.totalAmount)}</Text>
        <Text style={styles.info}>
          {expense.count} achat{expense.count > 1 ? 's' : ''} • {dateUtils.formatCurrency(expense.amount)} par achat
        </Text>
        <Text style={styles.date}>
          Dernier achat: {dateUtils.formatDate(expense.lastPurchaseAt)}
        </Text>
        
        {hasBudget && (
          <View style={styles.budgetContainer}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetLabel}>
                Budget {getBudgetPeriodLabel(expense.budgetRecurrence!)}
              </Text>
              <Text style={[styles.budgetPercentage, { color: getBudgetProgressColor(budgetProgress) }]}>
                {Math.round(budgetProgress)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${budgetProgressClamped}%`,
                      backgroundColor: getBudgetProgressColor(budgetProgress)
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.budgetInfo}>
              {dateUtils.formatCurrency(budgetSpent)} / {dateUtils.formatCurrency(expense.budgetAmount!)}
            </Text>
          </View>
        )}
      </View>
      
      {(expense.isRecurring ?? true) && (
        <TouchableOpacity 
          style={styles.incrementButton}
          onPress={() => onIncrement(expense.id)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  deleteButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  incrementButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetInfo: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});