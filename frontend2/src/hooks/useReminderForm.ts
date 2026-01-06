import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ReminderData } from "../components/ReminderModal";
import { countries, Country } from "../lib/countries";

// List of IANA timezones
const TIMEZONES = [
  { tz: "Pacific/Midway", label: "Pacific/Midway (GMT-11:00)" },
  { tz: "Pacific/Honolulu", label: "Pacific/Honolulu (GMT-10:00)" },
  { tz: "America/Anchorage", label: "America/Anchorage (GMT-09:00)" },
  { tz: "America/Los_Angeles", label: "America/Los_Angeles (GMT-08:00)" },
  { tz: "America/Denver", label: "America/Denver (GMT-07:00)" },
  { tz: "America/Chicago", label: "America/Chicago (GMT-06:00)" },
  { tz: "America/New_York", label: "America/New_York (GMT-05:00)" },
  { tz: "America/Caracas", label: "America/Caracas (GMT-04:00)" },
  { tz: "America/Sao_Paulo", label: "America/Sao_Paulo (GMT-03:00)" },
  { tz: "Atlantic/South_Georgia", label: "Atlantic/South_Georgia (GMT-02:00)" },
  { tz: "Atlantic/Azores", label: "Atlantic/Azores (GMT-01:00)" },
  { tz: "Europe/London", label: "Europe/London (GMT+00:00)" },
  { tz: "Europe/Berlin", label: "Europe/Berlin (GMT+01:00)" },
  { tz: "Africa/Cairo", label: "Africa/Cairo (GMT+02:00)" },
  { tz: "Europe/Moscow", label: "Europe/Moscow (GMT+03:00)" },
  { tz: "Asia/Dubai", label: "Asia/Dubai (GMT+04:00)" },
  { tz: "Asia/Karachi", label: "Asia/Karachi (GMT+05:00)" },
  { tz: "Asia/Kathmandu", label: "Asia/Kathmandu (GMT+05:45)" },
  { tz: "Asia/Kolkata", label: "Asia/Kolkata (GMT+05:30)" },
  { tz: "Asia/Almaty", label: "Asia/Almaty (GMT+06:00)" },
  { tz: "Asia/Yangon", label: "Asia/Yangon (GMT+06:30)" },
  { tz: "Asia/Bangkok", label: "Asia/Bangkok (GMT+07:00)" },
  { tz: "Asia/Shanghai", label: "Asia/Shanghai (GMT+08:00)" },
  { tz: "Asia/Tokyo", label: "Asia/Tokyo (GMT+09:00)" },
  { tz: "Australia/Adelaide", label: "Australia/Adelaide (GMT+09:30)" },
  { tz: "Australia/Sydney", label: "Australia/Sydney (GMT+10:00)" },
  { tz: "Pacific/Guadalcanal", label: "Pacific/Guadalcanal (GMT+11:00)" },
  { tz: "Pacific/Auckland", label: "Pacific/Auckland (GMT+12:00)" },
  { tz: "Pacific/Chatham", label: "Pacific/Chatham (GMT+12:45)" },
];

// Helper function to get the closest matching timezone
function getClosestTimezone(detectedTz: string): string {
  // First, check if the detected timezone is in our list
  if (TIMEZONES.some(t => t.tz === detectedTz)) {
    return detectedTz;
  }

  // If not found, try to find a timezone with the same offset
  try {
    const now = new Date();
    const detectedOffset = new Date(now.toLocaleString('en-US', { timeZone: detectedTz })).getTime() - now.getTime();

    let closestTz = "Europe/London";
    let closestDiff = Infinity;

    for (const tz of TIMEZONES) {
      const tzOffset = new Date(now.toLocaleString('en-US', { timeZone: tz.tz })).getTime() - now.getTime();
      const diff = Math.abs(tzOffset - detectedOffset);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestTz = tz.tz;
      }
    }

    return closestTz;
  } catch (e) {
    return "Europe/London";
  }
}

interface FormState {
  formData: ReminderData;
  errors: Record<string, string>;
  selectedCountry: Country;
  phoneNumberInput: string;
}

export function useReminderForm(
  initialData: ReminderData | null | undefined,
  isOpen: boolean,
  mode: "create" | "edit"
) {
  const [state, setState] = useState<FormState>({
    formData: {
      title: "",
      message: "",
      phone: "",
      date: "",
      time: "",
      timezone: "UTC",
    },
    errors: {},
    selectedCountry: countries.find(c => c.code === "US") || countries[0],
    phoneNumberInput: "",
  });

  // Initialize form when modal opens or data changes
  useEffect(() => {
    setState(prev => ({ ...prev, errors: {} }));

    if (initialData) {
      let foundCountry = countries.find(c => c.code === "US") || countries[0];

      // Handle both ReminderData and Reminder types
      const phone = (initialData as any).phone || (initialData as any).phone_number || "";
      let number = phone;

      const sortedCountries = [...countries].sort(
        (a, b) => b.dial_code.length - a.dial_code.length
      );

      for (const country of sortedCountries) {
        if (phone.startsWith(country.dial_code)) {
          foundCountry = country;
          number = phone.substring(country.dial_code.length);
          if (number.startsWith(" ")) number = number.substring(1);
          break;
        }
      }

      // Handle both ReminderData and Reminder types for date/time
      let date = (initialData as any).date || "";
      let time = (initialData as any).time || "";
      const timezone = (initialData as any).timezone || "Europe/London";

      if (!date && (initialData as any).scheduled_time_utc) {
        // Convert UTC time to the reminder's timezone for editing
        let utcString = (initialData as any).scheduled_time_utc;
        // Ensure the string is treated as UTC by adding Z if not present
        if (!utcString.endsWith('Z') && !utcString.includes('+') && !utcString.includes('-', 10)) {
          utcString = utcString + 'Z';
        }
        const utcTime = new Date(utcString);
        try {
          const zonedTime = toZonedTime(utcTime, timezone);
          date = format(zonedTime, "yyyy-MM-dd");
          time = format(zonedTime, "HH:mm");
        } catch (error) {
          // Fallback to UTC if timezone conversion fails
          date = format(utcTime, "yyyy-MM-dd");
          time = format(utcTime, "HH:mm");
        }
      }

      setState(prev => ({
        ...prev,
        formData: {
          title: initialData.title,
          message: initialData.message,
          phone,
          date,
          time,
          timezone,
        },
        selectedCountry: foundCountry,
        phoneNumberInput: number,
      }));
    } else {
      const defaultCountry = countries.find(c => c.code === "US") || countries[0];
      const now = new Date();
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London";
      const selectedTz = getClosestTimezone(detectedTz);

      setState(prev => ({
        ...prev,
        formData: {
          title: "",
          message: "",
          phone: defaultCountry.dial_code,
          date: format(now, "yyyy-MM-dd"),
          time: format(now, "HH:mm"),
          timezone: selectedTz,
        },
        selectedCountry: defaultCountry,
        phoneNumberInput: "",
      }));
    }
  }, [initialData, isOpen, mode]);

  // Update phone when country or number changes
  useEffect(() => {
    if (isOpen) {
      const fullPhone = `${state.selectedCountry.dial_code} ${state.phoneNumberInput}`;
      setState(prev => ({
        ...prev,
        formData: { ...prev.formData, phone: fullPhone.trim() },
      }));

      if (state.errors.phone && state.phoneNumberInput.length > 3) {
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, phone: "" },
        }));
      }
    }
  }, [state.selectedCountry, state.phoneNumberInput, isOpen]);

  return {
    ...state,
    setFormData: (data: ReminderData) =>
      setState(prev => ({ ...prev, formData: data })),
    setErrors: (errors: Record<string, string>) =>
      setState(prev => ({ ...prev, errors })),
    setSelectedCountry: (country: Country) =>
      setState(prev => ({ ...prev, selectedCountry: country })),
    setPhoneNumberInput: (phone: string) =>
      setState(prev => ({ ...prev, phoneNumberInput: phone })),
  };
}

