import axios from "axios";
import { fromZonedTime } from "date-fns-tz";
import { Reminder } from "../types/reminder";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RemindersResponse {
  page: number;
  per_page: number;
  total_items: number;
  items: Reminder[];
}

export async function fetchReminders(
  status: "all" | "scheduled" | "completed" | "failed" = "all",
  page: number = 1,
  perPage: number = 25
): Promise<RemindersResponse> {
  const { data } = await api.get<RemindersResponse>("/reminders/", {
    params: {
      status,
      page,
      per_page: perPage,
    },
  });
  return data;
}

export async function createReminder(data: {
  title: string;
  message: string;
  phone: string;
  datetime: string;
  timezone: string;
}): Promise<Reminder> {
  // Convert local datetime + timezone to UTC ISO string
  const utcDate = fromZonedTime(data.datetime, data.timezone);
  const scheduledTimeUtc = utcDate.toISOString();

  const { data: response } = await api.post<Reminder>("/reminders/", {
    title: data.title,
    message: data.message,
    phone_number: data.phone,
    scheduled_time_utc: scheduledTimeUtc,
    timezone: data.timezone,
  });
  return response;
}

export async function deleteReminder(id: string): Promise<void> {
  await api.delete(`/reminders/${id}`);
}
