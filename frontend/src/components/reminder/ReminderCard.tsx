import { Card } from "../ui/card";
import { Reminder } from "../../types/reminder";
import { ReminderStatusBadge } from "./StatusBadge";
import { CountdownTimer } from "./CountdownTimer";
import { format } from "date-fns";
import { Edit, Trash } from "iconoir-react";
import { Button } from "../ui/button";

interface ReminderCardProps {
  reminder: Reminder;
  onEdit?: (reminder: Reminder) => void;
  onDelete?: (reminder: Reminder) => void;
}

export function ReminderCard({ reminder, onEdit, onDelete }: ReminderCardProps) {
  const scheduledDate = new Date(reminder.scheduled_time_utc);
  const isScheduled = reminder.status === "scheduled";

  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{reminder.title}</h3>
        <div className="flex items-center gap-2">
          {isScheduled && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(reminder)}
              className="h-8 w-8 p-0"
              title="Edit reminder"
            >
              <Edit width={16} height={16} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(reminder)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              title="Delete reminder"
            >
              <Trash width={16} height={16} />
            </Button>
          )}
          <ReminderStatusBadge status={reminder.status} />
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="text-muted-foreground text-sm">{format(scheduledDate, "PPpp")}</div>
          <div className="text-muted-foreground text-sm">{reminder.phone_number}</div>
        </div>
        {isScheduled && (
          <CountdownTimer
            scheduledTime={reminder.scheduled_time_utc}
            initialSecondsRemaining={reminder.time_remaining_seconds}
          />
        )}
      </div>
    </Card>
  );
}
