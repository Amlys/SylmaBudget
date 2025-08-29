import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Edit, Trash2, RotateCcw } from 'lucide-react-native';
import { Budget } from '@/types/budget';
import { dateUtils } from '@/utils/dateUtils';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete, onToggleActive }: BudgetCardProps) {
  const percentage = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
  const remaining = Math.max(budget.amount - budget.spent, 0);
  const isOverBudget = budget.spent > budget.amount;

  const getRecurrenceText = () => {
    switch (budget.recurrence) {
      case 'weekly': return 'Hebdomadaire';
      case 'monthly': return 'Mensuel';
      case 'yearly': return 'Annuel';
      default: return 'Unique';
    }
  };

  const getProgressColor = () => {
    if (percentage >= 100) return '#EF4444'; // Rouge si dépassé
    if (percentage >= 80) return '#F59E0B'; // Orange si proche
    return '#10B981'; // Vert sinon
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le budget',
      `Êtes-vous sûr de vouloir supprimer le budget "${budget.title}" ?\n\nCette action ne peut pas être annulée.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(budget.id) }
      ]
    );
  };

  return (
    <View style={[styles.card, !budget.isActive && styles.inactiveCard]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, !budget.isActive && styles.inactiveText]}>{budget.title}</Text>
          <Text style={styles.recurrence}>{getRecurrenceText()}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => onToggleActive(budget.id)} style={styles.actionButton}>
            <RotateCcw size={18} color={budget.isActive ? "#F59E0B" : "#10B981"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onEdit(budget)} style={styles.actionButton}>
            <Edit size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {budget.description ? (
        <Text style={[styles.description, !budget.isActive && styles.inactiveText]}>
          {budget.description}
        </Text>
      ) : null}

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.spentAmount}>
            {dateUtils.formatCurrency(budget.spent)} / {dateUtils.formatCurrency(budget.amount)}
          </Text>
          <Text style={[styles.percentage, { color: getProgressColor() }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getProgressColor()
              }
            ]} 
          />
        </View>

        <View style={styles.remainingContainer}>
          {isOverBudget ? (
            <Text style={styles.overBudget}>
              Dépassement: {dateUtils.formatCurrency(budget.spent - budget.amount)}
            </Text>
          ) : (
            <Text style={styles.remaining}>
              Restant: {dateUtils.formatCurrency(remaining)}
            </Text>
          )}
        </View>
      </View>
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
  inactiveCard: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  inactiveText: {
    color: '#9CA3AF',
  },
  recurrence: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingContainer: {
    alignItems: 'flex-end',
  },
  remaining: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  overBudget: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
});