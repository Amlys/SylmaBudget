import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Save, ArrowLeft } from 'lucide-react-native';
import { BudgetFormData, BudgetRecurrence } from '@/types/budget';
import { budgetUtils } from '@/utils/budgetStorage';

const RECURRENCE_OPTIONS: { value: BudgetRecurrence | undefined; label: string }[] = [
  { value: undefined, label: 'Unique' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
  { value: 'yearly', label: 'Annuel' },
];

export default function AddBudgetScreen() {
  const { budgetId } = useLocalSearchParams<{ budgetId?: string }>();
  const isEditing = !!budgetId;

  const [formData, setFormData] = useState<BudgetFormData>({
    title: '',
    description: '',
    amount: 0,
    recurrence: undefined,
  });

  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);

  // TODO: Load budget data if editing
  React.useEffect(() => {
    if (isEditing && budgetId) {
      loadBudgetData(budgetId);
    }
  }, [isEditing, budgetId]);

  const loadBudgetData = async (id: string) => {
    const budgets = await budgetUtils.getBudgets();
    const budget = budgets.find(b => b.id === id);
    if (budget) {
      setFormData({
        title: budget.title,
        description: budget.description,
        amount: budget.amount,
        recurrence: budget.recurrence,
      });
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour le budget');
      return;
    }

    if (formData.amount <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide');
      return;
    }

    try {
      if (isEditing && budgetId) {
        await budgetUtils.updateBudget(budgetId, formData);
        Alert.alert('Succès', 'Budget modifié avec succès');
      } else {
        await budgetUtils.addBudget({
          ...formData,
          isActive: true,
        });
        Alert.alert('Succès', 'Budget créé avec succès');
      }

      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le budget');
    }
  };

  const getRecurrenceLabel = () => {
    const option = RECURRENCE_OPTIONS.find(opt => opt.value === formData.recurrence);
    return option ? option.label : 'Unique';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>
            {isEditing ? 'Modifier le Budget' : 'Nouveau Budget'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing ? 'Modifiez votre budget' : 'Créez un nouveau budget pour suivre vos dépenses'}
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Ex: Budget courses mensuelles"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Description du budget (optionnel)"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Montant (€) *</Text>
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
          <Text style={styles.label}>Récurrence</Text>
          <TouchableOpacity 
            style={styles.recurrenceSelector}
            onPress={() => setShowRecurrencePicker(!showRecurrencePicker)}
          >
            <Text style={styles.recurrenceSelectorText}>
              {getRecurrenceLabel()}
            </Text>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>
          
          {showRecurrencePicker && (
            <View style={styles.recurrencePicker}>
              {RECURRENCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value || 'unique'}
                  style={styles.recurrenceOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, recurrence: option.value }));
                    setShowRecurrencePicker(false);
                  }}
                >
                  <Text style={[
                    styles.recurrenceOptionText,
                    formData.recurrence === option.value && styles.recurrenceOptionSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Comment ça marche ?</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Unique</Text> : Budget sans renouvellement{'\n'}
            • <Text style={styles.infoBold}>Hebdomadaire</Text> : Se renouvelle chaque semaine{'\n'}
            • <Text style={styles.infoBold}>Mensuel</Text> : Se renouvelle chaque mois{'\n'}
            • <Text style={styles.infoBold}>Annuel</Text> : Se renouvelle chaque année
          </Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#FFFFFF" style={styles.saveIcon} />
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Modifier' : 'Créer le budget'}
          </Text>
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
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E7FF',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  recurrenceSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recurrenceSelectorText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    color: '#6B7280',
  },
  recurrencePicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  recurrenceOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recurrenceOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  recurrenceOptionSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});