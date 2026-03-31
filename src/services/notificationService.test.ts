import { expect, test, describe, beforeAll, afterAll, setSystemTime } from 'bun:test';
import { NotificationService } from './notificationService';

describe('NotificationService.calculateReminderTime', () => {
  const service = NotificationService.getInstance();
  const fixedTime = new Date('2024-01-01T12:00:00.000Z');

  beforeAll(() => {
    setSystemTime(fixedTime);
  });

  afterAll(() => {
    setSystemTime();
  });

  describe('when no dueDate is provided (relative to now)', () => {
    test('calculates 15min correctly', () => {
      const result = service.calculateReminderTime(undefined, '15min');
      expect(result?.toISOString()).toBe('2024-01-01T12:15:00.000Z');
    });

    test('calculates 1hour correctly', () => {
      const result = service.calculateReminderTime(undefined, '1hour');
      expect(result?.toISOString()).toBe('2024-01-01T13:00:00.000Z');
    });

    test('calculates 1day correctly', () => {
      const result = service.calculateReminderTime(undefined, '1day');
      expect(result?.toISOString()).toBe('2024-01-02T12:00:00.000Z');
    });

    test('returns null for invalid option', () => {
      const result = service.calculateReminderTime(undefined, 'invalid');
      expect(result).toBeNull();
    });
  });

  describe('when dueDate is provided (relative to dueDate)', () => {
    const dueDate = new Date('2024-01-05T12:00:00.000Z');

    test('calculates 15min correctly', () => {
      const result = service.calculateReminderTime(dueDate, '15min');
      expect(result?.toISOString()).toBe('2024-01-05T11:45:00.000Z');
    });

    test('calculates 1hour correctly', () => {
      const result = service.calculateReminderTime(dueDate, '1hour');
      expect(result?.toISOString()).toBe('2024-01-05T11:00:00.000Z');
    });

    test('calculates 1day correctly', () => {
      const result = service.calculateReminderTime(dueDate, '1day');
      expect(result?.toISOString()).toBe('2024-01-04T12:00:00.000Z');
    });

    test('returns null for invalid option', () => {
      const result = service.calculateReminderTime(dueDate, 'invalid');
      expect(result).toBeNull();
    });
  });
});
