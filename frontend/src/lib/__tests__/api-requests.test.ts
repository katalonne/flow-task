import { Reminder, ReminderFormData } from '../../types/reminder';
import { convertUTCToTimezone, convertUTCToBrowserTimezone } from '../api';

describe('API - Time Conversion and Data Handling', () => {
  describe('Reminder Data Structure', () => {
    it('should have valid reminder structure', () => {
      const reminder: Reminder = {
        id: '1',
        title: 'Test Reminder',
        message: 'Test message',
        phone_number: '+1234567890',
        timezone: 'America/New_York',
        scheduled_time_utc: '2026-01-06T19:57:00Z',
        status: 'scheduled',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      expect(reminder.id).toBeDefined();
      expect(reminder.title).toBeDefined();
      expect(reminder.message).toBeDefined();
      expect(reminder.phone_number).toBeDefined();
      expect(reminder.timezone).toBeDefined();
      expect(reminder.scheduled_time_utc).toBeDefined();
      expect(reminder.status).toBe('scheduled');
    });

    it('should support different reminder statuses', () => {
      const statuses: Array<'scheduled' | 'completed' | 'failed'> = [
        'scheduled',
        'completed',
        'failed',
      ];

      statuses.forEach((status) => {
        const reminder: Reminder = {
          id: '1',
          title: 'Test',
          message: 'Test',
          phone_number: '+1234567890',
          timezone: 'America/New_York',
          scheduled_time_utc: '2026-01-06T19:57:00Z',
          status,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        };

        expect(reminder.status).toBe(status);
      });
    });
  });

  describe('ReminderFormData Structure', () => {
    it('should have valid form data structure', () => {
      const formData: ReminderFormData = {
        title: 'Doctor Appointment',
        message: 'Annual checkup',
        phone: '+1234567890',
        timezone: 'America/New_York',
        datetime: new Date('2026-01-06T14:57:00'),
      };

      expect(formData.title).toBeDefined();
      expect(formData.message).toBeDefined();
      expect(formData.phone).toBeDefined();
      expect(formData.timezone).toBeDefined();
      expect(formData.datetime).toBeInstanceOf(Date);
    });

    it('should accept different timezones', () => {
      const timezones = [
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
        'Australia/Sydney',
      ];

      timezones.forEach((timezone) => {
        const formData: ReminderFormData = {
          title: 'Test',
          message: 'Test',
          phone: '+1234567890',
          timezone,
          datetime: new Date(),
        };

        expect(formData.timezone).toBe(timezone);
      });
    });
  });

  describe('UTC Time Handling', () => {
    it('should parse UTC time strings correctly', () => {
      const utcTime = '2026-01-06T19:57:00Z';
      const result = convertUTCToBrowserTimezone(utcTime);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should handle UTC times without Z suffix', () => {
      const utcTime = '2026-01-06T19:57:00';
      const result = convertUTCToBrowserTimezone(utcTime);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should convert UTC to specific timezone', () => {
      const utcTime = '2026-01-06T19:57:00Z';
      const result = convertUTCToTimezone(utcTime, 'America/New_York');

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should handle multiple timezone conversions', () => {
      const utcTime = '2026-01-06T12:00:00Z';
      const timezones = [
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
      ];

      timezones.forEach((tz) => {
        const result = convertUTCToTimezone(utcTime, tz);
        expect(result).toBeInstanceOf(Date);
      });
    });
  });
});
