// Reminder type for dashboard and modal
export type ReminderStatus = "scheduled" | "completed" | "failed";

export interface Reminder {
  id: string;
  title: string;
  message: string;
  phone_number: string;
  scheduled_time_utc: string; // ISO string in UTC
  timezone: string;
  status: ReminderStatus;
  time_remaining_seconds: number;
  failure_reason: string | null;
  created_at: string; // ISO string in UTC
  updated_at: string; // ISO string in UTC
}

// API Response types
export interface RemindersResponse {
  page: number;
  per_page: number;
  total_items: number;
  items: Reminder[];
}

// Form submission type
export interface ReminderFormData {
  title: string;
  message: string;
  phone: string;
  datetime: string; // ISO string in local timezone
  timezone: string;
}

