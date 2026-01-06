import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState, useEffect } from "react";
import { PhoneInput } from "../ui/PhoneInput";
import { timezones } from "../../constants/timezones";
import { getTimezoneOffset, format } from "date-fns-tz";

interface ReminderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initial?: any;
  quickCreate?: boolean;
  title?: string;
}

interface FormState {
  title: string;
  message: string;
  phone: string;
  datetime: string;
  timezone: string;
  errors: Record<string, string>;
}

function findMatchingTimezone(tz: string): string {
  // Check if timezone exists in our list
  const exactMatch = timezones.find(t => t.tz === tz);
  if (exactMatch) return tz;

  // Find timezone with matching UTC offset using date-fns-tz
  const now = new Date();
  const targetOffset = getTimezoneOffset(tz, now);

  const matchingTz = timezones.find(t => {
    const tzOffset = getTimezoneOffset(t.tz, now);
    return tzOffset === targetOffset;
  });

  return matchingTz?.tz || "Europe/London";
}

function formatDatetimeForTimezone(date: Date, timezone: string, includeSeconds: boolean = false): string {
  // Format date directly in the target timezone (returns "yyyy-MM-ddTHH:mm" or "yyyy-MM-ddTHH:mm:ss" format)
  const formatStr = includeSeconds ? "yyyy-MM-dd'T'HH:mm:ss" : "yyyy-MM-dd'T'HH:mm";
  return format(date, formatStr, { timeZone: timezone });
}

function getInitialFormState(initial: any, quickCreate: boolean): FormState {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Determine timezone
  let timezone = initial?.timezone || "";

  // If timezone is provided, find matching timezone in our list
  if (timezone) {
    timezone = findMatchingTimezone(timezone);
  } else {
    // No timezone provided, use detected timezone
    timezone = findMatchingTimezone(detected);
  }

  // Determine datetime
  let datetime = initial?.datetime || (initial?.scheduled_time_utc ? initial.scheduled_time_utc.slice(0, 16) : "");
  if (quickCreate && !datetime) {
    const now = new Date();
    const oneMinuteLater = new Date(now.getTime() + 60000);
    // Format datetime in the selected timezone
    datetime = formatDatetimeForTimezone(oneMinuteLater, timezone);
  }

  return {
    title: initial?.title || "",
    message: initial?.message || "",
    phone: initial?.phone || initial?.phone_number || "",
    datetime,
    timezone,
    errors: {},
  };
}

export function ReminderFormDialog({ open, onClose, onSubmit, initial, quickCreate = false, title: customTitle }: ReminderFormProps) {
  const [form, setForm] = useState<FormState>(getInitialFormState(initial, quickCreate));

  useEffect(() => {
    if (open) {
      setForm(getInitialFormState(initial, quickCreate));
    }
  }, [open, initial, quickCreate]);

  function getQuickCreateDatetime(timezone: string): string {
    const now = new Date();
    const oneMinuteLater = new Date(now.getTime() + 60000);
    return formatDatetimeForTimezone(oneMinuteLater, timezone, true);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.message) errs.message = "Message required";
    if (!/^\+\d{10,15}$/.test(form.phone)) errs.phone = "Invalid phone (E.164)";
    if (!form.title) errs.title = "Title required";
    // Skip datetime validation for quickCreate (we'll set it fresh at submit time)
    if (!quickCreate && (!form.datetime || new Date(form.datetime) <= new Date())) {
      errs.datetime = "Date/time must be in the future";
    }
    if (!form.timezone) errs.timezone = "Timezone required";
    setForm(prev => ({ ...prev, errors: errs }));
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    // For quickCreate, always use fresh datetime (1 min from now) at submit time
    const datetime = quickCreate ? getQuickCreateDatetime(form.timezone) : form.datetime;
    const data = { title: form.title, message: form.message, phone: form.phone, datetime, timezone: form.timezone };
    console.log("Creating reminder with data:", data);
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customTitle || (initial ? "Edit Reminder" : "Create Reminder")}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Reminder title"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            />
            {form.errors.title && <div className="text-destructive text-xs">{form.errors.title}</div>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              placeholder="Reminder message"
              value={form.message}
              onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
            />
            {form.errors.message && <div className="text-destructive text-xs">{form.errors.message}</div>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <PhoneInput
              id="phone"
              value={form.phone}
              onChange={(data: { phone: string }) => setForm(prev => ({ ...prev, phone: data.phone }))}
            />
            {form.errors.phone && <div className="text-destructive text-xs">{form.errors.phone}</div>}
          </div>

          {!quickCreate && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="datetime">Date & Time</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={form.datetime}
                  onChange={e => setForm(prev => ({ ...prev, datetime: e.target.value }))}
                />
                {form.errors.datetime && <div className="text-destructive text-xs">{form.errors.datetime}</div>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={form.timezone} onValueChange={(value) => setForm(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger id="timezone" className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {timezones.map(tz => (
                      <SelectItem key={tz.tz} value={tz.tz}>{tz.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.timezone && <div className="text-destructive text-xs">{form.errors.timezone}</div>}
              </div>
            </>
          )}

          <Button type="submit" className="mt-2">{initial ? "Save" : "Create"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
