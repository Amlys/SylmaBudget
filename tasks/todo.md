# TODO - SylmaBudget

## 🚀 En cours - Fonctionnalité Dépenses Récurrentes

### Objectif
Ajouter un champ "Dépense récurrente" lors de la création d'une dépense. Si une dépense n'est pas marquée comme récurrente, elle ne pourra pas être incrémentée (pas de bouton +).

### Tâches de la fonctionnalité
- [x] 1. Analyser la demande et planifier l'implémentation
- [x] 2. Modifier l'interface Expense pour ajouter le champ isRecurring
- [x] 3. Modifier ExpenseFormData pour ajouter le champ isRecurring
- [x] 4. Ajouter le checkbox 'Dépense récurrente' dans le formulaire add.tsx
- [x] 5. Modifier ExpenseCard pour conditionner l'affichage du bouton d'incrémentation
- [x] 6. Tester la fonctionnalité

## Prochaines étapes prioritaires (selon RAPPORT_PROJECT.md)

### ✅ Critique - TERMINÉ (29 août 2025)
- [x] Implémenter tests unitaires avec Jest (couverture minimum 70%) ✨ **99,27% atteint**
- [x] Finaliser l'écran Dashboard avec graphiques et statistiques ✨ **Déjà complet**
- [x] Créer documentation utilisateur (guide d'utilisation) ✨ **Guide complet créé**

### 🟡 Important - 1-2 sprints
- [ ] Implémenter mode sombre/clair
- [ ] Améliorer l'accessibilité (support lecteurs d'écran)
- [ ] Optimiser les performances (lazy loading pour listes)
- [ ] Ajouter fonctionnalité d'export (CSV/PDF)

### 🟢 Améliorations futures - Backlog
- [ ] Synchronisation cloud (Firebase/iCloud)
- [ ] Système de notifications et rappels
- [ ] Animations avec React Native Reanimated
- [ ] Support multi-devises

## Notes
- Projet : Application mobile SylmaBudget pour suivi des dépenses
- Framework : React Native avec Expo Router
- Stockage : AsyncStorage local
- Interface : Français avec thème violet (#8B5CF6)