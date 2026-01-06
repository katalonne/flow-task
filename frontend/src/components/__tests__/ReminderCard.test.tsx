import { render, screen } from '@testing-library/react';
import { ReminderCard } from '../ReminderCard';
import { Reminder } from '../../types/reminder';

// Mock the useCountdown hook
jest.mock('../../hooks/useCountdown', () => ({
  useCountdown: () => ({
    timeLeft: '2 days, 5 hours',
    isOverdue: false,
  }),
}));

describe('ReminderCard - Time Display', () => {
  const mockReminder: Reminder = {
    id: '1',
    title: 'Doctor Appointment',
    message: 'Annual checkup',
    phone_number: '+1234567890',
    timezone: 'America/New_York',
    scheduled_time_utc: '2026-01-06T19:57:00Z', // 2:57 PM EST (UTC-5)
    status: 'scheduled',
    time_remaining_seconds: 172800,
    failure_reason: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  it('should render reminder card with title and message', () => {
    render(
      <ReminderCard
        reminder={mockReminder}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    expect(screen.getByText('Doctor Appointment')).toBeInTheDocument();
    expect(screen.getByText('Annual checkup')).toBeInTheDocument();
  });

  it('should display phone number', () => {
    render(
      <ReminderCard
        reminder={mockReminder}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });

  it('should display scheduled status badge', () => {
    render(
      <ReminderCard
        reminder={mockReminder}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('should display countdown timer for scheduled reminders', () => {
    render(
      <ReminderCard
        reminder={mockReminder}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    expect(screen.getByText(/Starts in:/)).toBeInTheDocument();
  });

  it('should display completed status for completed reminders', () => {
    const completedReminder = { ...mockReminder, status: 'completed' as const };

    render(
      <ReminderCard
        reminder={completedReminder}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should display failed status for failed reminders', () => {
    const failedReminder = { ...mockReminder, status: 'failed' as const };

    render(
      <ReminderCard
        reminder={failedReminder}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <ReminderCard
        reminder={mockReminder}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit reminder/i });
    editButton.click();

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockReminder);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <ReminderCard
        reminder={mockReminder}
        onEdit={mockHandlers.onEdit}
        onDelete={mockHandlers.onDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /Delete reminder/i });
    deleteButton.click();

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockReminder);
  });
});

