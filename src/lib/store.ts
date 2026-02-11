import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InvestmentItem {
    id: string;
    category: string;
    amount: number;
    description?: string;
}

export interface RevenueItem {
    id: string;
    name: string;
    monthlyAmount: number;
    type: 'recurring' | 'one-time';
    description?: string;
}

export interface ExpenseItem {
    id: string;
    name: string;
    monthlyAmount: number;
    type: 'fixed' | 'variable';
    description?: string;
}

export interface FinancialModel {
    id: string;
    name: string;
    template: string;
    createdAt: string;
    updatedAt: string;
    investments: InvestmentItem[];
    revenues: RevenueItem[];
    expenses: ExpenseItem[];
}

interface ProjectStore {
    projects: FinancialModel[];
    currentProject: FinancialModel | null;

    // Actions
    createProject: (name: string, template: string) => FinancialModel;
    setCurrentProject: (projectId: string) => void;
    updateProject: (projectId: string, updates: Partial<FinancialModel>) => void;
    deleteProject: (projectId: string) => void;

    // Investment actions
    addInvestment: (item: Omit<InvestmentItem, 'id'>) => void;
    updateInvestment: (id: string, updates: Partial<InvestmentItem>) => void;
    deleteInvestment: (id: string) => void;

    // Revenue actions
    addRevenue: (item: Omit<RevenueItem, 'id'>) => void;
    updateRevenue: (id: string, updates: Partial<RevenueItem>) => void;
    deleteRevenue: (id: string) => void;

    // Expense actions
    addExpense: (item: Omit<ExpenseItem, 'id'>) => void;
    updateExpense: (id: string, updates: Partial<ExpenseItem>) => void;
    deleteExpense: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
    persist(
        (set, get) => ({
            projects: [],
            currentProject: null,

            createProject: (name, template) => {
                const newProject: FinancialModel = {
                    id: crypto.randomUUID(),
                    name,
                    template,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    investments: [],
                    revenues: [],
                    expenses: [],
                };

                set((state) => ({
                    projects: [...state.projects, newProject],
                    currentProject: newProject,
                }));

                return newProject;
            },

            setCurrentProject: (projectId) => {
                const project = get().projects.find((p) => p.id === projectId);
                if (project) {
                    set({ currentProject: project });
                }
            },

            updateProject: (projectId, updates) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === projectId
                            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
                            : p
                    ),
                    currentProject:
                        state.currentProject?.id === projectId
                            ? { ...state.currentProject, ...updates, updatedAt: new Date().toISOString() }
                            : state.currentProject,
                }));
            },

            deleteProject: (projectId) => {
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== projectId),
                    currentProject:
                        state.currentProject?.id === projectId ? null : state.currentProject,
                }));
            },

            // Investment actions
            addInvestment: (item) => {
                const currentProject = get().currentProject;
                if (!currentProject) return;

                const newItem = { ...item, id: crypto.randomUUID() };
                const updatedInvestments = [...currentProject.investments, newItem];

                get().updateProject(currentProject.id, { investments: updatedInvestments });
            },

            updateInvestment: (id, updates) => {
                const currentProject = get().currentProject;
                if (!currentProject) return;

                const updatedInvestments = currentProject.investments.map((item) =>
                    item.id === id ? { ...item, ...updates } : item
                );

                get().updateProject(currentProject.id, { investments: updatedInvestments });
            },

            deleteInvestment: (id) => {
                const currentProject = get().currentProject;
                if (!currentProject) return;

                const updatedInvestments = currentProject.investments.filter(
                    (item) => item.id !== id
                );

                get().updateProject(currentProject.id, { investments: updatedInvestments });
            },

            // Revenue actions
            addRevenue: (item) => {
                const currentProject = get().currentProject;
                if (!currentProject) return;

                const newItem = { ...item, id: crypto.randomUUID() };
                const updatedRevenues = [...currentProject.revenues, newItem];

                get().updateProject(currentProject.id, { revenues: updatedRevenues });
            },

            updateRevenue: (id, updates) => {
                const currentProject = get().currentProject;
                if (!currentProject) return;

                const updatedRevenues = currentProject.revenues.map((item) =>
                    item.id === id ? { ...item, ...updates } : item
                );

                get().updateProject(currentProject.id, { revenues: updatedRevenues });
            },

            deleteRevenue: (id) => {
                const currentProject = get().currentProject;
                if (!currentProject) return;

                const updatedRevenues = currentProject.revenues.filter((item) => item.id !== id);

                get().updateProject(currentProject.id, { revenues: updatedRevenues });
            },

            // Expense actions
            addExpense: (item) => {
                const currentProject = get().currentProject;
                if (!currentProject) return;

                const newItem = { ...item, id: crypto.randomUUID() };
                const updatedExpenses = [...currentProject.expenses, newItem];

                get().updateProject(currentProject.id, { expenses: updatedExpenses });
            },

            updateExpense: (id, updates) => {
                const currentProject = get().currentProject;
                if (!currentProject) return;

                const updatedExpenses = currentProject.expenses.map((item) =>
                    item.id === id ? { ...item, ...updates } : item
                );

                get().updateProject(currentProject.id, { expenses: updatedExpenses });
            },

            deleteExpense: (id) => {
                const currentProject = get().currentProject;
                if (!currentProject) return;

                const updatedExpenses = currentProject.expenses.filter((item) => item.id !== id);

                get().updateProject(currentProject.id, { expenses: updatedExpenses });
            },
        }),
        {
            name: 'finmodel-projects',
        }
    )
);
