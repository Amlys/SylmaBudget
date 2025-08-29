# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## instructions
- Respond me in french and start response by saying "Hi Amlys"
- Ce projet est une application destinée pour une utilisation sur mobile (Android et iOS) et l'utilisation sur le web est optionnelle. La priorité est l'utilisation sur mobile.
- Avant de répondre à une demande, lis la doc du projet, réfléchis étape par étape et utilises la chaine de pensées et analyser le code de l'application en profondeur et bien comprendre le contexte et la demande, puis tu réalises ce qu'il a été demandé.
- Toutes les tâches à faire sont dans tasks/todo.md et les tâches déjà faites sont dans tasks/todo_done.md.
- First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
- The plan should have a list of todo items that you can check off as you complete them
- Before you begin working, check in with me and I will verify the plan.
- Then, begin working on the todo items, marking them as complete as you go.
- Please every step of the way just give me a high level explanation of what changes you made
- Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
- Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
- Si tu utilises un nouveau package alors ajoutes le dans package.json et installe-le
- Mets toujours à jour le fichier tasks/todo.md et tasks/todo_done.md
- Toujours regarder dans le fichier DEVELOPER_GUIDE.md qui se trouve à la racine du projet pour rester cohérant concernant le projet, l'architecture et la structure et le mettre à jour si necessaire après les modifications et un fichier RAPPORT_PROJECT.md qui est un rapport complet concernant la qualité de code du projet, l'architecture, la sécurité etc à qui tu vas donner des notes sur 20 et que tu vas mettre à jour à chaque fois que tu fais des modifications et si RAPPORT_PROJECT.md n'existe pas crées-le aussi.

## Development Commands

- `npm run dev` - Start Expo development server with telemetry disabled
- `npm run build:web` - Build for web platform using Expo
- `npm run lint` - Run Expo linter to check code quality

## Project Architecture

This is a React Native Expo app called "PayAmLys" - an expense tracking application with French UI text. The app uses Expo Router for navigation with a 4-tab architecture including budget management.

### Core Structure

- **App Router**: Uses Expo Router with file-based routing
- **Navigation**: Tab-based layout with four main screens (Accueil/Home, Ajouter/Add, Budget, Dashboard)
- **Data Storage**: Local storage using AsyncStorage for persistence with dual storage system (expenses + budgets)
- **UI Framework**: React Native with Lucide React Native icons
- **Type Safety**: TypeScript with strict mode enabled

### Key Directories

- `app/`: Main application screens using Expo Router file-based routing
  - `(tabs)/`: Tab navigation screens (index, add, budget, dashboard)
  - `_layout.tsx`: Root layout with Stack navigation
  - `add-budget.tsx`: Budget creation/editing screen
- `components/`: Reusable React Native components (ExpenseCard, BudgetCard, StatCard)
- `types/`: TypeScript type definitions for expense and budget data models
- `utils/`: Utility functions for date formatting, expense storage, and budget storage
- `hooks/`: Custom React hooks for framework initialization
- `tasks/`: Project documentation and task tracking (todo.md, todo_done.md)

### Data Models

The app uses two main data models:

#### Expense Interface
- Basic info (id, title, amount, icon)
- Purchase tracking (count, totalAmount, purchaseDates)
- Timestamps (createdAt, lastPurchaseAt)
- Archive status (isArchived)
- Budget association (budgetId)

#### Budget Interface
- Basic info (id, title, description, amount)
- Spending tracking (spent)
- Recurrence system (weekly, monthly, yearly)
- Period management with auto-refresh
- Active/inactive status

### Storage Architecture

- **Dual AsyncStorage system**:
  - `amlys_pay_expenses` - Expense data with budget linking
  - `amlys_pay_budgets` - Budget data with period tracking
- **Centralized storage utils**: `storageUtils` and `budgetUtils`
- **CRUD operations**: Full create, read, update, delete support
- **Smart filtering**: Active expenses, active budgets, period refresh
- **Cross-reference**: Expenses can be linked to budgets with automatic spent tracking

### Navigation Structure

1. **Accueil** (index) - Expense overview with stats
2. **Ajouter** (add) - Create new expenses with budget association
3. **Budget** - Budget management with progress tracking
4. **Dashboard** - Analytics (to be implemented)

### Platform Configuration

- **Expo SDK**: Version 53.0.0 with new architecture enabled
- **React**: Version 19.0.0
- **Target Platforms**: iOS (tablet supported), Web (single bundle output), Android
- **Path Aliases**: `@/*` maps to project root for clean imports
- **Typed Routes**: Enabled for better navigation type safety

### Development Notes

- Uses French language for UI text and user-facing messages
- Icons use emoji characters stored as strings (12 predefined options)
- Purple theme color (#8B5CF6) used throughout the interface
- Alert dialogs for destructive actions (delete/archive confirmation)
- Budget progress bars with color-coded status (green/orange/red)
- Automatic budget period refresh with spent amount reset