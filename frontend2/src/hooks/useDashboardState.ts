import { useState } from "react";
import { Reminder } from "../types/reminder";

export type TabType = "all" | "scheduled" | "completed" | "failed";
export type SortType = "ascending" | "descending" | "-";
export type ModalMode = "create" | "edit";

interface DashboardState {
  // Data
  reminders: Reminder[];
  
  // Loading & Error
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  totalPages: number;
  totalItems: number;
  
  // Modal
  isModalOpen: boolean;
  modalMode: ModalMode;
  editingReminder: Reminder | null;
  isQuickCreate: boolean;
  
  // Filters
  activeTab: TabType;
  sortOption: SortType;
}

interface DashboardActions {
  // Data mutations
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (reminder: Reminder) => void;
  
  // Loading & Error
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Pagination
  setPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setTotalItems: (items: number) => void;
  
  // Modal
  openCreateModal: () => void;
  openEditModal: (reminder: Reminder) => void;
  openQuickCreateModal: () => void;
  closeModal: () => void;
  
  // Filters
  setActiveTab: (tab: TabType) => void;
  setSortOption: (sort: SortType) => void;
}

const initialState: DashboardState = {
  reminders: [],
  isLoading: true,
  error: null,
  page: 1,
  totalPages: 1,
  totalItems: 0,
  isModalOpen: false,
  modalMode: "create",
  editingReminder: null,
  isQuickCreate: false,
  activeTab: "all",
  sortOption: "-",
};

export function useDashboardState(): [DashboardState, DashboardActions] {
  const [state, setState] = useState<DashboardState>(initialState);

  const actions: DashboardActions = {
    setReminders: (reminders) => setState(s => ({ ...s, reminders })),
    addReminder: (reminder) => setState(s => ({ ...s, reminders: [reminder, ...s.reminders], totalItems: s.totalItems + 1 })),
    updateReminder: (reminder) => setState(s => ({ ...s, reminders: s.reminders.map(r => r.id === reminder.id ? reminder : r) })),
    
    setIsLoading: (isLoading) => setState(s => ({ ...s, isLoading })),
    setError: (error) => setState(s => ({ ...s, error })),
    
    setPage: (page) => setState(s => ({ ...s, page })),
    setTotalPages: (totalPages) => setState(s => ({ ...s, totalPages })),
    setTotalItems: (totalItems) => setState(s => ({ ...s, totalItems })),
    
    openCreateModal: () => setState(s => ({ ...s, isModalOpen: true, modalMode: "create", editingReminder: null, isQuickCreate: false })),
    openEditModal: (reminder) => setState(s => ({ ...s, isModalOpen: true, modalMode: "edit", editingReminder: reminder, isQuickCreate: false })),
    openQuickCreateModal: () => setState(s => ({ ...s, isModalOpen: true, modalMode: "create", isQuickCreate: true })),
    closeModal: () => setState(s => ({ ...s, isModalOpen: false })),
    
    setActiveTab: (activeTab) => setState(s => ({ ...s, activeTab, page: 1 })),
    setSortOption: (sortOption) => setState(s => ({ ...s, sortOption })),
  };

  return [state, actions];
}

