import axios from "axios";
import { fromZonedTime } from "date-fns-tz";
import { Reminder, RemindersResponse, ReminderFormData } from "../types/reminder";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchReminders(
  status: "all" | "scheduled" | "completed" | "failed" = "all",
  page: number = 1,
  perPage: number = 25,
  sort?: "ascending" | "descending" | undefined
): Promise<RemindersResponse> {
  const params: any = {
    status,
    page,
    per_page: perPage,
  };

  if (sort) {
    params.sort = sort;
  }

  const { data } = await api.get<RemindersResponse>("/reminders/", {
    params,
  });
  return data;
}

export async function createReminder(data: ReminderFormData): Promise<Reminder> {
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

export async function updateReminder(
  id: string,
  data: Partial<ReminderFormData>
): Promise<Reminder> {
  const payload: any = {};

  if (data.title !== undefined) payload.title = data.title;
  if (data.message !== undefined) payload.message = data.message;
  if (data.phone !== undefined) payload.phone_number = data.phone;
  if (data.timezone !== undefined) payload.timezone = data.timezone;

  if (data.datetime !== undefined && data.timezone !== undefined) {
    const utcDate = fromZonedTime(data.datetime, data.timezone);
    payload.scheduled_time_utc = utcDate.toISOString();
  }

  const { data: response } = await api.patch<Reminder>(`/reminders/${id}`, payload);
  return response;
}

export async function deleteReminder(id: string): Promise<void> {
  await api.delete(`/reminders/${id}`);
}

