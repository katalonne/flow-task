import React, { useEffect, useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Hero } from "./Hero";
import { ReminderModal, ReminderData } from "./ReminderModal";
import { ReminderCard } from "./ReminderCard";
import { DeleteReminderDialog } from "./DeleteReminderDialog";
import { Button } from "./ui/Button";
import { Plus, Zap, ArrowUpDown } from "lucide-react";
import { useDashboardState, TabType, SortType } from "../hooks/useDashboardState";
import { Reminder, RemindersResponse } from "../types/reminder";
import { fetchReminders, createReminder, updateReminder, deleteReminder } from "../lib/api";
import {
  Card,
  EmptyState,
  LoadingState,
  ErrorState,
  Tabs,
  Pagination,
} from "./design-system";
import { Filter, AlertOctagon } from "lucide-react";

const PER_PAGE = 25;

const TABS: { id: TabType; label: string }[] = [
  { id: "all", label: "All Reminders" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
];

export function RemindyApp() {
  const [state, actions] = useDashboardState();
  const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(null);
  const queryClient = useQueryClient();

  // TanStack React Query for fetching reminders with 15-second polling
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["reminders", state.activeTab, state.sortOption, state.page],
    queryFn: async () => {
      const sortValue = state.sortOption === "-" ? undefined : state.sortOption;
      return fetchReminders(
        state.activeTab,
        state.page,
        PER_PAGE,
        sortValue as "ascending" | "descending" | undefined
      );
    },
    refetchInterval: 15000, // Poll every 15 seconds
    staleTime: 0, // Always consider data stale
  });

  // Update state when data changes
  useEffect(() => {
    if (data) {
      actions.setReminders(data.items);
      actions.setTotalItems(data.total_items);
      actions.setTotalPages(Math.ceil(data.total_items / PER_PAGE) || 1);
    }
  }, [data, actions]);

  // Update loading and error state
  useEffect(() => {
    actions.setIsLoading(isLoading);
  }, [isLoading, actions]);

  useEffect(() => {
    if (error) {
      actions.setError("Failed to load reminders. Please try again.");
      console.error("Error fetching reminders:", error);
    } else {
      actions.setError(null);
    }
  }, [error, actions]);

  const handleTabChange = (tab: TabType) => {
    actions.setActiveTab(tab);
  };

  const handleCreateNew = () => {
    actions.openCreateModal();
  };

  const handleQuickCreate = () => {
    actions.openQuickCreateModal();
  };

  const handleEdit = (reminder: Reminder) => {
    actions.openEditModal(reminder);
  };

  const handleCloseModal = () => {
    setModalError(null);
    actions.closeModal();
  };

  // State for modal errors
  const [modalError, setModalError] = React.useState<string | null>(null);

  // Mutation for creating/updating reminders
  const saveMutation = useMutation({
    mutationFn: async (data: ReminderData) => {
      if (state.modalMode === "create") {
        return createReminder({
          title: data.title,
          message: data.message,
          phone: data.phone,
          datetime: `${data.date}T${data.time}`,
          timezone: data.timezone,
        });
      } else if (state.editingReminder) {
        return updateReminder(state.editingReminder.id, {
          title: data.title,
          message: data.message,
          phone: data.phone,
          datetime: `${data.date}T${data.time}`,
          timezone: data.timezone,
        });
      }
      throw new Error("Invalid save mode");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setModalError(null);
      actions.closeModal();
    },
    onError: (error: any) => {
      // Extract error message from API response or use default
      let errorMessage = "Failed to save reminder. Please try again.";

      if (error?.response?.data?.detail) {
        // Handle string detail message
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        }
        // Handle array of validation errors (Pydantic format)
        else if (Array.isArray(error.response.data.detail)) {
          const messages = error.response.data.detail
            .map((err: any) => err.msg || JSON.stringify(err))
            .filter(Boolean);
          errorMessage = messages.length > 0 ? messages[0] : errorMessage;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setModalError(errorMessage);
    },
  });

  // Mutation for deleting reminders
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setDeletingReminder(null);
    },
    onError: () => {
      actions.setError("Failed to delete reminder. Please try again.");
    },
  });

  const handleSave = (data: ReminderData) => {
    saveMutation.mutate(data);
  };

  const handleDeleteClick = (reminder: Reminder) => {
    setDeletingReminder(reminder);
  };

  const handleDeleteConfirm = () => {
    if (deletingReminder) {
      deleteMutation.mutate(deletingReminder.id);
    }
  };

  const scrollToDashboard = () => {
    const element = document.getElementById("dashboard-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-10">
      <Hero onGetStarted={scrollToDashboard} />

      <main
        id="dashboard-section"
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 -mt-8 sm:-mt-10 relative z-10"
      >
        <Card padding="lg" className="min-h-[600px] flex flex-col">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8">
            <div className="w-full md:w-auto flex flex-col sm:flex-row lg:flex-col sm:items-baseline lg:items-start sm:gap-3 lg:gap-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary shrink-0">
                Dashboard
              </h2>
              <p className="text-muted-foreground mt-1 sm:mt-0 lg:mt-1 text-sm sm:text-base truncate">
                Manage your upcoming voice reminders
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                className="gap-2 border-dashed border-2 justify-center"
                onClick={handleQuickCreate}
              >
                <Zap className="w-4 h-4 text-accent" />
                Quick Create (+1m)
              </Button>
              <Button
                onClick={handleCreateNew}
                className="gap-2 shadow-lg shadow-primary/20 justify-center"
              >
                <Plus className="w-4 h-4" />
                Create Reminder
              </Button>
            </div>
          </div>

          {/* Controls Bar: Tabs & Sort */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-8 border-b border-border/40 pb-6">
            <Tabs
              tabs={TABS}
              activeTab={state.activeTab}
              onTabChange={handleTabChange}
              disabled={state.isLoading}
            />

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-input rounded-lg shadow-sm hover:border-accent transition-colors w-full md:w-auto">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
                <select
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-foreground outline-none w-full"
                  value={state.sortOption}
                  onChange={(e) =>
                    actions.setSortOption(e.target.value as SortType)
                  }
                  disabled={state.isLoading}
                >
                  <option value="-">Default Sort</option>
                  <option value="ascending">Ascending (Oldest First)</option>
                  <option value="descending">Descending (Soonest/Newest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {state.isLoading ? (
              <LoadingState message="Fetching reminders..." />
            ) : state.error ? (
              <ErrorState
                message={state.error}
                onRetry={() =>
                  fetchReminders(state.activeTab, state.page)
                }
              />
            ) : state.reminders.length > 0 ? (
              <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${!isFetching ? "animate-in slide-in-from-bottom-4 duration-500" : ""}`}>
                {state.reminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={state.activeTab === "failed" ? AlertOctagon : Filter}
                title={
                  state.activeTab === "failed"
                    ? "No Failed Reminders"
                    : "No reminders found"
                }
                description={
                  state.activeTab === "failed"
                    ? "Great news! All your reminders have been delivered successfully."
                    : state.activeTab === "all"
                    ? "You haven't created any reminders yet."
                    : `You don't have any ${state.activeTab} reminders.`
                }
                action={
                  state.activeTab === "all"
                    ? {
                        label: "Create your first reminder",
                        onClick: handleCreateNew,
                      }
                    : undefined
                }
                variant={state.activeTab === "failed" ? "error" : "default"}
              />
            )}
          </div>

          {/* Pagination */}
          {!state.isLoading &&
            !state.error &&
            state.totalItems > 0 && (
              <Pagination
                page={state.page}
                totalPages={state.totalPages}
                totalItems={state.totalItems}
                perPage={PER_PAGE}
                onPageChange={actions.setPage}
              />
            )}
        </Card>
      </main>

      <ReminderModal
        isOpen={state.isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={
          state.editingReminder
            ? {
                id: state.editingReminder.id,
                title: state.editingReminder.title,
                message: state.editingReminder.message,
                phone: state.editingReminder.phone_number,
                date: state.editingReminder.scheduled_time_utc.split("T")[0],
                time: state.editingReminder.scheduled_time_utc.split("T")[1]?.substring(0, 5) || "00:00",
                timezone: state.editingReminder.timezone,
              }
            : null
        }
        mode={state.modalMode}
        isQuickCreate={state.isQuickCreate}
        isLoading={saveMutation.isPending}
        error={modalError}
      />

      <DeleteReminderDialog
        isOpen={!!deletingReminder}
        reminder={deletingReminder}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingReminder(null)}
      />
    </div>
  );
}