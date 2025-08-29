import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Save, ChevronDown } from 'lucide-react-native';
import { ExpenseFormData } from '@/types/expense';
import { Budget } from '@/types/budget';
import { storageUtils } from '@/utils/storage';
import { budgetUtils } from '@/utils/budgetStorage';

const EXPENSE_ICONS = ['☕', '🍔', '🚗', '🏠', '📱', '👕', '🎬', '🏥', '📚', '✈️', '🎮', '💊'];

export default function AddExpenseScreen() {
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    amount: 0,
    icon: '☕',
    budgetId: undefined,
    isRecurring: true,
  });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showBudgetPicker, setShowBudgetPicker] = useState(false);

  const loadBudgets = async () => {
    const activeBudgets = await budgetUtils.getActiveBudgets();
    setBudgets(activeBudgets);
  };

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [])
  );

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour la dépense');
      return;
    }

    if (formData.amount <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide');
      return;
    }

    try {
      await storageUtils.addExpense({
        ...formData,
        createdAt: new Date().toISOString(),
        lastPurchaseAt: new Date().toISOString(),
      });

      Alert.alert('Succès', 'Dépense ajoutée avec succès', [
        {
          text: 'OK',
          onPress: () => {
            setFormData({ title: '', amount: 0, icon: '☕', budgetId: undefined, isRecurring: true });
            router.navigate('/');
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la dépense');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nouvelle Dépense</Text>
        <Text style={styles.subtitle}>Ajoutez une nouvelle catégorie de dépense</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Titre</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Ex: Café du matin"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Montant (€)</Text>
          <TextInput
            style={styles.input}
            value={formData.amount.toString()}
            onChangeText={(text) => {
              const amount = parseFloat(text) || 0;
              setFormData(prev => ({ ...prev, amount }));
            }}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Budget (optionnel)</Text>
          <TouchableOpacity 
            style={styles.budgetSelector}
            onPress={() => setShowBudgetPicker(!showBudgetPicker)}
          >
            <Text style={[styles.budgetSelectorText, !formData.budgetId && styles.placeholder]}>
              {formData.budgetId 
                ? budgets.find(b => b.id === formData.budgetId)?.title || 'Budget supprimé'
                : 'Aucun budget sélectionné'
              }
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
          
          {showBudgetPicker && (
            <View style={styles.budgetPicker}>
              <TouchableOpacity
                style={styles.budgetOption}
                onPress={() => {
                  setFormData(prev => ({ ...prev, budgetId: undefined }));
                  setShowBudgetPicker(false);
                }}
              >
                <Text style={[styles.budgetOptionText, !formData.budgetId && styles.budgetOptionSelected]}>
                  Aucun budget
                </Text>
              </TouchableOpacity>
              {budgets.length > 0 ? (
                budgets.map((budget) => (
                  <TouchableOpacity
                    key={budget.id}
                    style={styles.budgetOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, budgetId: budget.id }));
                      setShowBudgetPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.budgetOptionText,
                      formData.budgetId === budget.id && styles.budgetOptionSelected
                    ]}>
                      {budget.title}
                    </Text>
                    <Text style={styles.budgetOptionSubtext}>
                      {budget.amount > 0 ? ((budget.spent / budget.amount) * 100).toFixed(0) : 0}% utilisé
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.budgetOption}>
                  <Text style={styles.budgetOptionText}>
                    Aucun budget actif
                  </Text>
                  <Text style={styles.budgetOptionSubtext}>
                    Créez un budget dans l'onglet Budget
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Type de dépense</Text>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
          >
            <View style={[styles.checkbox, formData.isRecurring && styles.checkboxChecked]}>
              {formData.isRecurring && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Dépense récurrente</Text>
          </TouchableOpacity>
          <Text style={styles.checkboxDescription}>
            {formData.isRecurring 
              ? "Cette dépense pourra être incrémentée (bouton +)"
              : "Cette dépense sera unique (pas d'incrémentation possible)"
            }
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Icône</Text>
          <View style={styles.iconGrid}>
            {EXPENSE_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconButton,
                  formData.icon === icon && styles.iconButtonSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, icon }))}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#FFFFFF" style={styles.saveIcon} />
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
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
    backgroundColor: '#3B82F6',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#DBEAFE',
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#1F2937',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  iconText: {
    fontSize: 24,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  budgetSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetSelectorText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  budgetPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    maxHeight: 200,
  },
  budgetOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  budgetOptionText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  budgetOptionSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  budgetOptionSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  checkboxDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});