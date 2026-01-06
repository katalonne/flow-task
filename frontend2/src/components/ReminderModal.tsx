import React from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { X, Clock, Phone, FileText, Calendar, Globe, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseISO, isBefore, isValid } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { cn } from "../lib/utils";
import { CountrySelect } from "./CountrySelect";
import { useReminderForm } from "../hooks/useReminderForm";

export type ReminderData = {
  id?: string;
  title: string;
  message: string;
  phone: string;
  date: string;
  time: string;
  timezone: string;
  scheduled_time_utc?: string; // Optional, used for editing to pass UTC time for conversion
};

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReminderData) => void;
  initialData?: ReminderData | null;
  mode: "create" | "edit";
  isQuickCreate?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

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

export function ReminderModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
  isQuickCreate = false,
  isLoading = false,
  error = null,
}: ReminderModalProps) {
  const {
    formData,
    errors,
    selectedCountry,
    phoneNumberInput,
    setFormData,
    setErrors,
    setSelectedCountry,
    setPhoneNumberInput,
  } = useReminderForm(initialData, isOpen, mode);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Reminder title is required";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    // Phone validation - E.164 format (+ followed by 10-15 digits)
    const fullPhone = formData.phone.replace(/\s/g, "");
    if (!fullPhone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+\d{10,15}$/.test(fullPhone)) {
      newErrors.phone = "Invalid phone number (E.164 format required)";
    }

    // Date/Time validation (skip for quick create as it's auto-set)
    if (!isQuickCreate) {
      const dateTimeStr = `${formData.date}T${formData.time}`;
      const selectedDate = parseISO(dateTimeStr);

      if (!isValid(selectedDate)) {
        newErrors.date = "Invalid date or time";
      } else {
        // Convert the selected time (in the chosen timezone) to UTC for comparison
        try {
          const utcDate = fromZonedTime(selectedDate, formData.timezone);
          const now = new Date();

          if (isBefore(utcDate, now)) {
            newErrors.date = "Reminder time must be in the future";
            newErrors.time = "Reminder time must be in the future";
          }
        } catch (error) {
          newErrors.date = "Invalid timezone";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave(formData);
      // Don't close the modal here - let the parent component handle it on success
    }
  };

  const modalTitle = isQuickCreate ? "Quick Create" : (mode === "create" ? "New Reminder" : "Edit Reminder");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-[95%] sm:w-full max-w-md bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header - Reduced padding on mobile */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-primary">
                  {modalTitle}
                </h2>
                <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-200/50 -mr-2">
                  <X className="w-5 h-5 text-gray-400" />
                </Button>
              </div>

              {/* Body - Reduced padding on mobile */}
              <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Error Toast */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </motion.div>
                )}

                <form id="reminder-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      Reminder Title
                    </label>
                    <Input
                      placeholder="e.g. Doctor's Appointment"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (errors.title) setErrors({...errors, title: ""});
                      }}
                      className={cn(errors.title && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      Message
                    </label>
                    <textarea
                      className={cn(
                        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
                        errors.message && "border-red-500 focus-visible:ring-red-500"
                      )}
                      placeholder="What should the voice say?"
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (errors.message) setErrors({...errors, message: ""});
                      }}
                    />
                    {errors.message && (
                      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-accent" />
                      Phone Number
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative shrink-0 w-full sm:w-[120px]">
                        <CountrySelect 
                          value={selectedCountry}
                          onChange={setSelectedCountry}
                        />
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="tel"
                          placeholder="555-0000"
                          value={phoneNumberInput}
                          onChange={(e) => {
                            // Allow digits, spaces, dashes
                            const val = e.target.value.replace(/[^\d\s-]/g, '');
                            setPhoneNumberInput(val);
                          }}
                          className={cn(errors.phone && "border-red-500 focus-visible:ring-red-500")}
                        />
                      </div>
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground ml-1">
                       Format: {selectedCountry.dial_code} {phoneNumberInput || "..."}
                    </p>
                  </div>

                  {!isQuickCreate && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent" />
                          Date
                        </label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => {
                            setFormData({ ...formData, date: e.target.value });
                            if (errors.date) setErrors({...errors, date: "", time: ""});
                          }}
                          className={cn(errors.date && "border-red-500 focus-visible:ring-red-500")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-accent" />
                          Time
                        </label>
                        <Input
                          type="time"
                          value={formData.time}
                          onChange={(e) => {
                            setFormData({ ...formData, time: e.target.value });
                            if (errors.time) setErrors({...errors, time: "", date: ""});
                          }}
                          className={cn(errors.time && "border-red-500 focus-visible:ring-red-500")}
                        />
                      </div>
                      {(errors.date || errors.time) && (
                        <div className="col-span-2">
                          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.date || errors.time}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isQuickCreate && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-accent" />
                        Timezone
                      </label>
                      <div className="relative">
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                          value={formData.timezone}
                          onChange={(e) =>
                            setFormData({ ...formData, timezone: e.target.value })
                          }
                        >
                          {TIMEZONES.map((tz) => (
                            <option key={tz.tz} value={tz.tz}>
                              {tz.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          {/* ChevronDown icon usage here */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Footer - Reduced padding on mobile */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="reminder-form"
                  disabled={isLoading}
                  className="shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : (mode === "create" ? "Schedule Reminder" : "Save Changes")}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
