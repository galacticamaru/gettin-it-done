import { expect, test, describe, setSystemTime } from "bun:test";
import { NotificationService } from "./notificationService";

describe("NotificationService.calculateReminderTime", () => {
  const service = NotificationService.getInstance();

  describe("when dueDate is undefined", () => {
    const now = new Date("2024-01-01T12:00:00Z");

    test("returns now + 15 minutes for '15min'", () => {
      setSystemTime(now);
      const result = service.calculateReminderTime(undefined, "15min");
      expect(result?.toISOString()).toBe(new Date(now.getTime() + 15 * 60 * 1000).toISOString());
      setSystemTime();
    });

    test("returns now + 1 hour for '1hour'", () => {
      setSystemTime(now);
      const result = service.calculateReminderTime(undefined, "1hour");
      expect(result?.toISOString()).toBe(new Date(now.getTime() + 60 * 60 * 1000).toISOString());
      setSystemTime();
    });

    test("returns now + 24 hours for '1day'", () => {
      setSystemTime(now);
      const result = service.calculateReminderTime(undefined, "1day");
      expect(result?.toISOString()).toBe(new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString());
      setSystemTime();
    });

    test("returns null for invalid option", () => {
      const result = service.calculateReminderTime(undefined, "invalid");
      expect(result).toBeNull();
    });
  });

  describe("when dueDate is defined", () => {
    const dueDate = new Date("2024-01-02T12:00:00Z");

    test("returns dueDate - 15 minutes for '15min'", () => {
      const result = service.calculateReminderTime(dueDate, "15min");
      expect(result?.toISOString()).toBe(new Date(dueDate.getTime() - 15 * 60 * 1000).toISOString());
    });

    test("returns dueDate - 1 hour for '1hour'", () => {
      const result = service.calculateReminderTime(dueDate, "1hour");
      expect(result?.toISOString()).toBe(new Date(dueDate.getTime() - 60 * 60 * 1000).toISOString());
    });

    test("returns dueDate - 24 hours for '1day'", () => {
      const result = service.calculateReminderTime(dueDate, "1day");
      expect(result?.toISOString()).toBe(new Date(dueDate.getTime() - 24 * 60 * 60 * 1000).toISOString());
    });

    test("returns null for invalid option", () => {
      const result = service.calculateReminderTime(dueDate, "invalid");
      expect(result).toBeNull();
    });
  });
});
