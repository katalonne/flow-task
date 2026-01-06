import axios from "axios";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { Reminder, RemindersResponse, ReminderFormData } from "../types/reminder";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Convert UTC datetime to the specified timezone
 * @param utcDateString ISO string in UTC (may or may not have Z suffix)
 * @param timezone IANA timezone string
 * @returns Date object in the specified timezone
 */
export function convertUTCToTimezone(utcDateString: string, timezone: string): Date {
  try {
    // Ensure the string is treated as UTC by adding Z if not present
    let utcString = utcDateString;
    if (!utcString.endsWith('Z') && !utcString.includes('+') && !utcString.includes('-', 10)) {
      utcString = utcString + 'Z';
    }
    const utcDate = new Date(utcString);
    const zonedDate = toZonedTime(utcDate, timezone);
    return zonedDate;
  } catch (error) {
    console.error(`Error converting UTC to timezone ${timezone}:`, error);
    return new Date(utcDateString);
  }
}

/**
 * Convert UTC datetime to browser's local timezone
 * @param utcDateString ISO string in UTC (may or may not have Z suffix)
 * @returns Date object in browser's local timezone
 */
export function convertUTCToBrowserTimezone(utcDateString: string): Date {
  try {
    // Ensure the string is treated as UTC by adding Z if not present
    let utcString = utcDateString;
    if (!utcString.endsWith('Z') && !utcString.includes('+') && !utcString.includes('-', 10)) {
      utcString = utcString + 'Z';
    }
    const utcDate = new Date(utcString);
    // JavaScript's Date object automatically converts to browser's local timezone
    // when using format/display methods
    return utcDate;
  } catch (error) {
    console.error(`Error converting UTC to browser timezone:`, error);
    return new Date(utcDateString);
  }
}

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

