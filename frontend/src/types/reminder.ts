// Reminder type for dashboard and popup
export type ReminderStatus = 'scheduled' | 'completed' | 'failed';

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
}
