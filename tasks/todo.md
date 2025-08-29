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

## 🚀 En cours - Sous-onglets Page d'Accueil

### Objectif
Créer 3 sous-onglets dans la page d'accueil : Dépenses récurrentes, Dépenses uniques, Budgets

### Tâches réalisées
- [x] 1. Analyser la structure actuelle de la page d'accueil
- [x] 2. Créer un système de sous-onglets avec navigation
- [x] 3. Séparer les dépenses récurrentes et uniques
- [x] 4. Intégrer l'affichage des budgets dans un sous-onglet
- [x] 5. Adapter les styles pour les sous-onglets
- [x] 6. Tester la navigation entre les sous-onglets

## ✅ TERMINÉ - Budget Individuel pour Dépenses

### Objectif
Permettre aux dépenses récurrentes d'avoir leur propre budget avec périodes (hebdomadaire, mensuel, annuel) et afficher une barre de progression dans la carte de dépense.

### Fonctionnalités implémentées
- [x] 1. Nouveaux champs dans l'interface Expense (budgetAmount, budgetRecurrence, budgetPeriod, budgetSpent)
- [x] 2. Champs dans le formulaire de création (seulement pour dépenses récurrentes)
- [x] 3. Logique de gestion des périodes avec refresh automatique
- [x] 4. Barre de progression dans ExpenseCard avec pourcentage
- [x] 5. Couleurs adaptatives (vert ≤50%, orange ≤80%, rouge >80%)
- [x] 6. Gestion du dépassement (pourcentage peut dépasser 100%, barre reste à 100% max)

### Comportement
- **Création** : Champs budget visibles seulement si dépense récurrente
- **Périodes** : Hebdomadaire (2024-W52), Mensuel (2024-12), Annuel (2024)
- **Reset automatique** : Quand la période change, budgetSpent repart à 0
- **Progression visuelle** : Barre + pourcentage + montant dépensé/budget total

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