# Remindy Dashboard

The dashboard interface for the Remindy voice reminder service.

## Features
- **Hero Section**: High-impact landing area
- **Dashboard**: Management interface for reminders
- **Status Tracking**: Scheduled, Completed, and Failed states
- **Quick Create**: One-click setup for immediate reminders (+1 min)

## Usage

```tsx
import RemindyApp from "@/sd-components/46b33d24-e390-427a-8301-b464bc3b8c4b";

function App() {
  return <RemindyApp />;
}
```

## Components
- `RemindyApp`: Main entry point
- `Hero`: Top banner
- `ReminderCard`: Individual item display
- `ReminderModal`: Form for creating/editing reminders
