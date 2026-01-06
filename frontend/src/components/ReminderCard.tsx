import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Clock, Phone, Edit2, AlertCircle, CheckCircle, Timer, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Reminder } from "../types/reminder";
import { useCountdown } from "../hooks/useCountdown";
import { convertUTCToBrowserTimezone } from "../lib/api";

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminder: Reminder) => void;
}

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", variant: "default" as const, icon: Clock },
  completed: { label: "Completed", variant: "success" as const, icon: CheckCircle },
  failed: { label: "Failed", variant: "destructive" as const, icon: AlertCircle },
};

export function ReminderCard({ reminder, onEdit, onDelete }: ReminderCardProps) {
  const isScheduled = reminder.status === "scheduled";
  // Convert UTC time to browser's local timezone for display
  const scheduledDate = convertUTCToBrowserTimezone(reminder.scheduled_time_utc);
  const dateStr = format(scheduledDate, "yyyy-MM-dd");
  const timeStr = format(scheduledDate, "HH:mm");
  const { timeLeft, isOverdue } = useCountdown(dateStr, timeStr, isScheduled);

  const status = STATUS_CONFIG[reminder.status];
  const StatusIcon = status.icon;

  return (
    <div className="group relative bg-white rounded-xl border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 p-5 overflow-hidden flex flex-col justify-between h-full">
      {/* Decorative side bar */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          reminder.status === 'scheduled' ? 'bg-primary' : 
          reminder.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
        }`} 
      />

      <div>
        <div className="flex justify-between items-start mb-3 pl-2">
          <div className="flex-1 pr-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1" title={reminder.title}>
              {reminder.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 min-h-[1.25rem]">
              {reminder.message || "No message provided"}
            </p>
          </div>
          <Badge variant={status.variant} className="gap-1.5 pl-1.5 pr-2.5 shrink-0">
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </Badge>
        </div>

        {/* Countdown Timer for Scheduled */}
        {isScheduled && (
          <div className="pl-2 mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide ${
              isOverdue 
                ? "bg-red-50 text-red-600 border border-red-100" 
                : "bg-primary/5 text-primary border border-primary/10"
            }`}>
              <Timer className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">
                {isOverdue ? "Processing..." : `Starts in: ${timeLeft}`}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between pl-2 mt-auto pt-4 border-t border-border/20 gap-y-2">
        <div className="flex flex-col gap-2 text-sm text-gray-600 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent shrink-0" />
            <span className="font-medium truncate">
              {format(scheduledDate, "MMM d • h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-accent shrink-0" />
            <span className="text-xs truncate">{reminder.phone_number}</span>
          </div>
        </div>

        <div className="ml-auto sm:ml-2 shrink-0 flex gap-1">
          {isScheduled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(reminder)}
              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="w-4 h-4" />
              <span className="sr-only">Edit reminder</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(reminder)}
            className="h-8 w-8 p-0 rounded-full hover:bg-red-50 text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Delete reminder</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
