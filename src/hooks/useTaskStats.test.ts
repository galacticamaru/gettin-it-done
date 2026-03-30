import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import { useTaskStats } from "./useTaskStats";
import { Task } from "./useTasks";
import { startOfDay, subDays } from "date-fns";

mock.module("react", () => ({
  useMemo: (cb: () => any) => cb(),
}));

describe("useTaskStats", () => {
  const FIXED_DATE = new Date("2024-01-10T12:00:00Z");

  beforeEach(() => {
    // Set system time to a fixed date for reliable testing
    // We'll use 2024-01-10T12:00:00Z (a Wednesday)
    setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    // Restore system time after each test
    setSystemTime();
  });

  const createTask = (overrides: Partial<Task>): Task => ({
    id: "test-id",
    text: "Test Task",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sortOrder: 0,
    ...overrides
  });

  test("handles empty tasks array", () => {
    const stats = useTaskStats([]);

    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
    expect(stats.totalCompleted).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.monthlyAverage).toBe(0);
    expect(stats.weeklyTrend).toHaveLength(7);
    expect(stats.weeklyTrend.every(day => day.completed === 0)).toBe(true);
  });

  test("handles only incomplete tasks", () => {
    const tasks = [
      createTask({ id: "1", completed: false }),
      createTask({ id: "2", completed: false })
    ];
    const stats = useTaskStats(tasks);

    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
    expect(stats.totalCompleted).toBe(0);
    expect(stats.completionRate).toBe(0);
  });

  test("calculates stats for tasks completed today", () => {
    const today = new Date();
    const tasks = [
      createTask({ id: "1", completed: true, updatedAt: today.toISOString() }),
      createTask({ id: "2", completed: false })
    ];

    const stats = useTaskStats(tasks);

    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(1);
    expect(stats.totalCompleted).toBe(1);
    expect(stats.completionRate).toBe(50);
  });

  test("calculates consecutive days streaks correctly", () => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const twoDaysAgo = subDays(today, 2);

    const tasks = [
      createTask({ id: "1", completed: true, updatedAt: today.toISOString() }),
      createTask({ id: "2", completed: true, updatedAt: yesterday.toISOString() }),
      createTask({ id: "3", completed: true, updatedAt: twoDaysAgo.toISOString() })
    ];

    const stats = useTaskStats(tasks);

    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
    expect(stats.totalCompleted).toBe(3);
    expect(stats.completionRate).toBe(100);
  });

  test("handles gaps in completion correctly (longest streak > current streak)", () => {
    const today = new Date();
    const threeDaysAgo = subDays(today, 3);
    const fourDaysAgo = subDays(today, 4);
    const fiveDaysAgo = subDays(today, 5);

    const tasks = [
      createTask({ id: "1", completed: true, updatedAt: today.toISOString() }), // Current streak = 1
      createTask({ id: "2", completed: true, updatedAt: threeDaysAgo.toISOString() }), // Gap!
      createTask({ id: "3", completed: true, updatedAt: fourDaysAgo.toISOString() }), // Past streak of 3
      createTask({ id: "4", completed: true, updatedAt: fiveDaysAgo.toISOString() })
    ];

    const stats = useTaskStats(tasks);

    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(3);
    expect(stats.totalCompleted).toBe(4);
  });

  test("handles multiple task completions on the same day without inflating streak", () => {
    const today = new Date();
    const yesterday = subDays(today, 1);

    const tasks = [
      createTask({ id: "1", completed: true, updatedAt: today.toISOString() }),
      createTask({ id: "2", completed: true, updatedAt: today.toISOString() }),
      createTask({ id: "3", completed: true, updatedAt: yesterday.toISOString() })
    ];

    const stats = useTaskStats(tasks);

    expect(stats.currentStreak).toBe(2);
    expect(stats.longestStreak).toBe(2);
    expect(stats.totalCompleted).toBe(3);
  });

  test("calculates weekly trend correctly", () => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const twoDaysAgo = subDays(today, 2);

    const tasks = [
      createTask({ id: "1", completed: true, updatedAt: today.toISOString() }),
      createTask({ id: "2", completed: true, updatedAt: today.toISOString() }),
      createTask({ id: "3", completed: true, updatedAt: yesterday.toISOString() }),
      createTask({ id: "4", completed: true, updatedAt: twoDaysAgo.toISOString() }),
      // Old task, shouldn't be in the weekly trend (older than 7 days)
      createTask({ id: "5", completed: true, updatedAt: subDays(today, 10).toISOString() })
    ];

    const stats = useTaskStats(tasks);

    expect(stats.weeklyTrend).toHaveLength(7);

    // The last element in weeklyTrend is today
    const todayTrend = stats.weeklyTrend[6];
    expect(todayTrend.completed).toBe(2);

    // The second to last is yesterday
    const yesterdayTrend = stats.weeklyTrend[5];
    expect(yesterdayTrend.completed).toBe(1);

    // The third to last is two days ago
    const twoDaysAgoTrend = stats.weeklyTrend[4];
    expect(twoDaysAgoTrend.completed).toBe(1);
  });

  test("calculates monthly average correctly", () => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const fifteenDaysAgo = subDays(today, 15);
    const fortyDaysAgo = subDays(today, 40); // Outside the 30-day window

    const tasks = [
      createTask({ id: "1", completed: true, updatedAt: today.toISOString() }),
      createTask({ id: "2", completed: true, updatedAt: yesterday.toISOString() }),
      createTask({ id: "3", completed: true, updatedAt: fifteenDaysAgo.toISOString() }),
      createTask({ id: "4", completed: true, updatedAt: fortyDaysAgo.toISOString() })
    ];

    const stats = useTaskStats(tasks);

    // 3 tasks completed in the last 30 days
    expect(stats.monthlyAverage).toBe(3 / 30);
    expect(stats.totalCompleted).toBe(4); // All time is 4
  });
});
