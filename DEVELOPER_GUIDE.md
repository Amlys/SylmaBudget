# Guide du Développeur - SylmaBudget

## Vue d'ensemble du Projet

**SylmaBudget** est une application mobile de suivi des dépenses développée avec React Native et Expo. Elle permet aux utilisateurs de créer des catégories de dépenses, de suivre leurs achats récurrents, et de gérer leurs budgets.

### Informations Générales
- **Nom**: SylmaBudget (AmlysPay)
- **Version**: 1.0.0
- **Plateforme cible**: iOS, Android (priorité mobile)
- **Support web**: Optionnel
- **Langue**: Interface en français

## Architecture Technique

### Stack Technologique

#### Framework Principal
- **React Native**: 0.79.1
- **React**: 19.0.0 
- **Expo SDK**: 53.0.0 (avec nouvelle architecture activée)
- **TypeScript**: 5.8.3 avec mode strict

#### Navigation et Routage
- **Expo Router**: 5.0.2 - Navigation basée sur les fichiers
- **React Navigation**: 7.0.14 - Navigation native
- **Typed Routes**: Activées pour la sécurité de type

#### Stockage et État
- **AsyncStorage**: 2.2.0 - Stockage local persistant
- **État local**: React hooks (useState, useEffect)

#### Interface Utilisateur
- **Lucide React Native**: 0.475.0 - Icônes cohérentes
- **StyleSheet**: Styles natifs React Native
- **Thème**: Violet principal (#8B5CF6)

### Structure des Dossiers

```
SylmaBudget/
├── app/                    # Screens avec Expo Router
│   ├── (tabs)/            # Navigation par onglets
│   │   ├── _layout.tsx    # Configuration des onglets
│   │   ├── index.tsx      # Écran d'accueil (Dépenses)
│   │   ├── add.tsx        # Ajout de dépense
│   │   ├── budget.tsx     # Gestion des budgets
│   │   └── dashboard.tsx  # Statistiques
│   ├── _layout.tsx        # Layout racine
│   ├── +not-found.tsx     # Page 404
│   └── add-budget.tsx     # Ajout/Édition budget
├── components/            # Composants réutilisables
│   ├── ExpenseCard.tsx    # Carte d'affichage dépense
│   ├── BudgetCard.tsx     # Carte d'affichage budget
│   └── StatCard.tsx       # Carte de statistiques
├── types/                 # Définitions TypeScript
│   ├── expense.ts         # Types pour les dépenses
│   └── budget.ts          # Types pour les budgets
├── utils/                 # Fonctions utilitaires
│   ├── storage.ts         # Gestion dépenses AsyncStorage
│   ├── budgetStorage.ts   # Gestion budgets AsyncStorage
│   └── dateUtils.ts       # Formatage dates et devises
├── hooks/                 # Hooks personnalisés
│   └── useFrameworkReady.ts
├── assets/                # Ressources statiques
│   └── images/
└── tasks/                 # Documentation projet
    ├── todo.md           # Tâches à faire
    └── todo_done.md      # Tâches complétées
```

## Modèles de Données

### Interface Expense (Dépense)
```typescript
interface Expense {
  id: string;              // Identifiant unique
  title: string;           // Nom de la dépense
  amount: number;          // Montant unitaire
  icon: string;           // Emoji d'icône
  count: number;          // Nombre d'achats
  totalAmount: number;    // Montant total cumulé
  createdAt: string;      // Date de création
  lastPurchaseAt: string; // Dernier achat
  purchaseDates: string[]; // Historique des achats
  isArchived?: boolean;    // Statut archivé
  budgetId?: string;      // Association budget
}
```

### Interface Budget
```typescript
interface Budget {
  id: string;              // Identifiant unique
  title: string;           // Nom du budget
  description: string;     // Description
  amount: number;          // Montant alloué
  spent: number;          // Montant dépensé
  recurrence?: 'weekly' | 'monthly' | 'yearly'; // Récurrence
  createdAt: string;      // Date de création
  period: string;         // Période actuelle
  isActive: boolean;      // Statut actif
}
```

## Architecture des Écrans

### Navigation Principale (Onglets)
1. **Accueil** (`index.tsx`) - Liste des dépenses actives
2. **Ajouter** (`add.tsx`) - Création nouvelles dépenses
3. **Budget** (`budget.tsx`) - Gestion des budgets
4. **Dashboard** (`dashboard.tsx`) - Statistiques et analyses

### Fonctionnalités par Écran

#### 1. Écran Accueil
- **Composants**: ExpenseCard, StatCard
- **Fonctionnalités**:
  - Affichage des dépenses actives
  - Total des dépenses
  - Poste le plus important
  - Actions: Incrémenter, Archiver, Supprimer
  - Pull-to-refresh

#### 2. Écran Ajouter
- **Fonctionnalités**:
  - Saisie titre et montant
  - Sélection icône (12 émojis disponibles)
  - Association optionnelle à un budget
  - Validation des données
  - Retour automatique à l'accueil

#### 3. Écran Budget
- **Composants**: BudgetCard
- **Fonctionnalités**:
  - Liste budgets actifs/inactifs
  - Statistiques globales
  - Barres de progression
  - Actions: Créer, Éditer, Activer/Désactiver, Supprimer
  - Rafraîchissement des périodes automatique

#### 4. Écran Dashboard
- **Statut**: À implémenter
- **Objectif**: Graphiques et analyses avancées

## Système de Stockage

### Architecture AsyncStorage
- **Clé dépenses**: `amlys_pay_expenses`
- **Clé budgets**: `amlys_pay_budgets`
- **Sérialisation**: JSON
- **Gestion d'erreurs**: Try/catch avec logs

### Opérations Principales

#### Gestion des Dépenses (`storage.ts`)
- `getExpenses()` - Récupération toutes dépenses
- `saveExpenses()` - Sauvegarde tableau complet
- `addExpense()` - Ajout nouvelle dépense + mise à jour budget
- `incrementExpense()` - Incrément compteur + mise à jour budget
- `deleteExpense()` - Suppression définitive
- `archiveExpense()` - Masquage (soft delete)
- `getActiveExpenses()` - Filtre dépenses non archivées

#### Gestion des Budgets (`budgetStorage.ts`)
- `getBudgets()` - Récupération tous budgets
- `saveBudgets()` - Sauvegarde tableau complet
- `addBudget()` - Création avec période auto
- `updateBudget()` - Modification partielle
- `deleteBudget()` - Suppression définitive
- `addSpentToBudget()` - Ajout dépense au budget
- `getActiveBudgets()` - Filtre budgets actifs
- `refreshBudgetPeriods()` - Réinitialisation périodes expirées

### Logique des Périodes Budget
- **Hebdomadaire**: Format `YYYY-WNN` (ex: 2024-W52)
- **Mensuelle**: Format `YYYY-MM` (ex: 2024-12)
- **Annuelle**: Format `YYYY` (ex: 2024)
- **Unique**: Format `YYYY-MM-DD`

## Composants Réutilisables

### ExpenseCard
- **Props**: expense, onIncrement, onDelete, onArchive
- **Fonctionnalités**:
  - Affichage icône et informations
  - Boutons d'action avec confirmations
  - Formatage automatique des montants

### BudgetCard  
- **Props**: budget, onEdit, onDelete, onToggleActive
- **Fonctionnalités**:
  - Barre de progression colorée
  - Indicateurs de dépassement
  - États actif/inactif visuels

### StatCard
- **Props**: title, value, color, icon
- **Usage**: Affichage statistiques dans headers

## Utilitaires et Helpers

### dateUtils.ts
- `formatCurrency()` - Formatage euros français
- `formatDate()` - Formatage date française  
- `getFilteredDates()` - Filtre par période
- `groupByPeriod()` - Regroupement temporel

## Conventions de Code

### Styling
- **Couleur principale**: #8B5CF6 (violet)
- **Couleur succès**: #10B981 (vert)
- **Couleur attention**: #F59E0B (orange)
- **Couleur erreur**: #EF4444 (rouge)
- **Background**: #F9FAFB (gris très clair)

### Architecture des Styles
- Styles colocalisés dans chaque composant
- StyleSheet.create() pour optimisation
- Naming convention: camelCase
- Responsive: Adaptabilité iOS/Android

### Gestion d'État
- Hooks React standards (useState, useEffect)
- useFocusEffect pour rafraîchissement navigation
- Pas de state manager global (Redux/Zustand)
- État local par écran

## Sécurité et Bonnes Pratiques

### Validation des Données
- Vérification champs obligatoires
- Validation montants positifs
- Sanitisation des entrées utilisateur

### Gestion d'Erreurs
- Try/catch sur opérations AsyncStorage
- Messages d'erreur utilisateur en français
- Logs console pour débogage

### Performance
- Lazy loading non implémenté (à considérer si > 100 items)
- Optimisations mémoire automatiques React Native
- Éviter re-renders inutiles

## Déploiement et Build

### Commandes Développement
```bash
npm run dev          # Expo dev server
npm run build:web    # Build web
npm run lint        # Vérification code
```

### Configuration Expo
- **SDK**: 53.0.0
- **Nouvelle architecture**: Activée
- **Orientation**: Portrait uniquement
- **Platforms**: iOS (avec support tablette), Android, Web

### Assets
- **Icône**: 192x192 PNG
- **Favicon**: 32x32 PNG  
- **Splash screen**: Automatique Expo

## Points d'Extension Future

### Fonctionnalités Possibles
1. **Dashboard avancé**: Graphiques, tendances, analytics
2. **Export données**: CSV, PDF des rapports
3. **Synchronisation cloud**: Firebase, iCloud
4. **Notifications**: Rappels, dépassements budget  
5. **Catégories personnalisées**: Création icônes custom
6. **Multi-devises**: Support euros/dollars
7. **Mode sombre**: Thème adaptatif
8. **Partage**: Export social, rapports
9. **Backup/Restore**: Sauvegarde manuelle
10. **Authentification**: Login utilisateur

### Améliorations Techniques
1. **Tests**: Unit tests, E2E avec Detox
2. **CI/CD**: Automatisation builds
3. **Performance monitoring**: Flipper, Reactotron
4. **Accessibilité**: Support lecteurs d'écran
5. **Internationalisation**: Support multilingue
6. **État global**: Redux Toolkit si complexité
7. **Animations**: React Native Reanimated
8. **Offline-first**: Sync différée

Cette architecture offre une base solide, extensible et maintenir pour l'évolution future de SylmaBudget.