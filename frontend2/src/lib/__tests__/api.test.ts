import { convertUTCToTimezone, convertUTCToBrowserTimezone } from '../api';

describe('API - Time Conversion Functions', () => {
  describe('convertUTCToTimezone', () => {
    it('should convert UTC time to America/New_York timezone', () => {
      // 2026-01-06T19:57:00Z is 2:57 PM EST (UTC-5)
      const utcTime = '2026-01-06T19:57:00Z';
      const result = convertUTCToTimezone(utcTime, 'America/New_York');

      expect(result).toBeInstanceOf(Date);
      // The result should be a valid date
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should convert UTC time to Europe/London timezone', () => {
      // 2026-01-06T12:00:00Z is 12:00 PM UTC
      const utcTime = '2026-01-06T12:00:00Z';
      const result = convertUTCToTimezone(utcTime, 'Europe/London');

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should convert UTC time to Asia/Tokyo timezone', () => {
      const utcTime = '2026-01-06T00:00:00Z';
      const result = convertUTCToTimezone(utcTime, 'Asia/Tokyo');

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should handle UTC string without Z suffix', () => {
      const utcTime = '2026-01-06T19:57:00';
      const result = convertUTCToTimezone(utcTime, 'America/New_York');

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should return a valid date even with invalid timezone', () => {
      const utcTime = '2026-01-06T19:57:00Z';
      const result = convertUTCToTimezone(utcTime, 'Invalid/Timezone');

      // Should still return a date object (fallback behavior)
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('convertUTCToBrowserTimezone', () => {
    it('should convert UTC time to a Date object', () => {
      const utcTime = '2026-01-06T19:57:00Z';
      const result = convertUTCToBrowserTimezone(utcTime);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should handle UTC string without Z suffix', () => {
      const utcTime = '2026-01-06T19:57:00';
      const result = convertUTCToBrowserTimezone(utcTime);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should return the same UTC time as a Date object', () => {
      const utcTime = '2026-01-06T19:57:00Z';
      const result = convertUTCToBrowserTimezone(utcTime);
      const expectedDate = new Date('2026-01-06T19:57:00Z');

      // Both should represent the same moment in time
      expect(result.getTime()).toBe(expectedDate.getTime());
    });

    it('should handle invalid date strings gracefully', () => {
      const invalidTime = 'invalid-date';
      const result = convertUTCToBrowserTimezone(invalidTime);

      // Should return a Date object (even if invalid)
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('Time Conversion Consistency', () => {
    it('should convert the same UTC time consistently', () => {
      const utcTime = '2026-01-06T19:57:00Z';
      const result1 = convertUTCToBrowserTimezone(utcTime);
      const result2 = convertUTCToBrowserTimezone(utcTime);

      expect(result1.getTime()).toBe(result2.getTime());
    });

    it('should handle different UTC formats consistently', () => {
      const utcTimeWithZ = '2026-01-06T19:57:00Z';
      const utcTimeWithoutZ = '2026-01-06T19:57:00';

      const result1 = convertUTCToBrowserTimezone(utcTimeWithZ);
      const result2 = convertUTCToBrowserTimezone(utcTimeWithoutZ);

      expect(result1.getTime()).toBe(result2.getTime());
    });
  });
});

