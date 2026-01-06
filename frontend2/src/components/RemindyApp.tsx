import React, { useEffect, useCallback } from "react";
import { Hero } from "./Hero";
import { ReminderModal, ReminderData } from "./ReminderModal";
import { ReminderCard, Reminder } from "./ReminderCard";
import { Button } from "./ui/Button";
import { Plus, Zap, ArrowUpDown } from "lucide-react";
import { format, add, sub, parseISO } from "date-fns";
import { useDashboardState } from "../hooks/useDashboardState";
import {
  Card,
  EmptyState,
  LoadingState,
  ErrorState,
  Tabs,
  Pagination,
} from "./design-system";
import { Filter, AlertOctagon } from "lucide-react";

// API Types
interface ApiReminder {
  id: string;
  title: string;
  message: string;
  timezone: string;
  scheduled_time_utc: string;
  status: "scheduled" | "completed" | "failed";
  time_remaining_seconds: number;
  phone_number: string;
  failure_reason: string | null;
}

interface ApiResponse {
  page: number;
  per_page: number;
  total_items: number;
  items: ApiReminder[];
}

type TabType = "all" | "scheduled" | "completed" | "failed";
type SortType = "default" | "asc" | "desc";

const PER_PAGE = 25;

const TABS: { id: TabType; label: string }[] = [
  { id: "all", label: "All Reminders" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
];

export function RemindyApp() {
  const [state, actions] = useDashboardState();

  // Mock API Fetch
  const fetchReminders = useCallback(
    async (currentTab: TabType, currentPage: number) => {
      actions.setIsLoading(true);
      actions.setError(null);

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock Data Generation
        const mockItems: ApiReminder[] = [
          {
            id: "6b1682e8-53bd-42ed-b872-b064d2c55daf",
            title: "Cardiology Appointment",
            message: "Remember to bring your ID and insurance card.",
            timezone: "America/New_York",
            scheduled_time_utc: add(new Date(), { days: 1 }).toISOString(),
            status: "scheduled",
            time_remaining_seconds: 86020,
            phone_number: "+1 (555) 123-4567",
            failure_reason: null,
          },
          {
            id: "9bc2b46e-28c7-4233-b736-119bc5f471c8",
            title: "Take Medication",
            message: "Take 2 pills with water after lunch.",
            timezone: "America/Los_Angeles",
            scheduled_time_utc: sub(new Date(), { hours: 2 }).toISOString(),
            status: "completed",
            time_remaining_seconds: 0,
            phone_number: "+1 (555) 987-6543",
            failure_reason: null,
          },
        ];

        // Simulate filtering on backend
        const filteredItems =
          currentTab === "all"
            ? mockItems
            : mockItems.filter((item) => item.status === currentTab);

        const response: ApiResponse = {
          page: currentPage,
          per_page: PER_PAGE,
          total_items: filteredItems.length,
          items: filteredItems,
        };

        // Transform API data to UI model
        const mappedReminders: Reminder[] = response.items.map((item) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          phone: item.phone_number,
          date: format(parseISO(item.scheduled_time_utc), "yyyy-MM-dd"),
          time: format(parseISO(item.scheduled_time_utc), "HH:mm"),
          timezone: item.timezone,
          status: item.status,
        }));

        actions.setReminders(mappedReminders);
        actions.setTotalItems(response.total_items);
        actions.setTotalPages(Math.ceil(response.total_items / PER_PAGE) || 1);
      } catch (err) {
        actions.setError("Failed to load reminders. Please try again.");
      } finally {
        actions.setIsLoading(false);
      }
    },
    [actions]
  );

  // Fetch when tab or page changes
  useEffect(() => {
    fetchReminders(state.activeTab, state.page);
  }, [state.activeTab, state.page, fetchReminders]);

  const handleTabChange = (tab: TabType) => {
    actions.setActiveTab(tab);
  };

  const handleCreateNew = () => {
    actions.openCreateModal();
  };

  const handleQuickCreate = () => {
    const now = add(new Date(), { minutes: 1 });
    const quickCreateReminder: Reminder = {
      id: "temp",
      title: "",
      message: "This is a quick reminder call.",
      phone: "",
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
      timezone:
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London",
      status: "scheduled",
    };
    actions.openQuickCreateModal();
    // Note: We'll need to pass this to the modal via state
  };

  const handleEdit = (reminder: Reminder) => {
    actions.openEditModal(reminder);
  };

  const handleSave = (data: ReminderData) => {
    // Optimistic update
    const newReminder: Reminder = {
      ...data,
      id: state.editingReminder?.id || Math.random().toString(36).substr(2, 9),
      status: "scheduled",
    };

    if (state.modalMode === "create") {
      actions.addReminder(newReminder);
    } else {
      actions.updateReminder(newReminder);
    }
    actions.closeModal();
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
                  <option value="default">Default Sort</option>
                  <option value="asc">Ascending (Oldest First)</option>
                  <option value="desc">Descending (Soonest/Newest)</option>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in slide-in-from-bottom-4 duration-500">
                {state.reminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onEdit={handleEdit}
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
        onClose={actions.closeModal}
        onSave={handleSave}
        initialData={state.editingReminder}
        mode={state.modalMode}
        isQuickCreate={state.isQuickCreate}
      />
    </div>
  );
}