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
      </View>
      
      <TouchableOpacity 
        style={styles.incrementButton}
        onPress={() => onIncrement(expense.id)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
});