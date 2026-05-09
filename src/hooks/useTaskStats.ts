import { useMemo } from 'react';
import { Task } from './useTasks';
import { startOfDay, subDays, differenceInDays, format, parseISO } from 'date-fns';

export interface TaskStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  completionRate: number;
  weeklyTrend: { date: string; completed: number }[];
  monthlyAverage: number;
}

export const useTaskStats = (tasks: Task[]): TaskStats => {
  return useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const thirtyDaysAgo = subDays(today, 30);
    
    let totalTasks = 0;
    let completedTasksCount = 0;
    const uniqueTimes = new Set<number>();
    const completedTasksByDate = new Map<string, number>();
    let recentCompletions = 0;

    for (const task of tasks) {
      totalTasks++;
      if (task.completed) {
        completedTasksCount++;
        if (task.updatedAt) {
          const taskDate = parseISO(task.updatedAt);
          const dayStart = startOfDay(taskDate);
          const time = dayStart.getTime();

          uniqueTimes.add(time);

          const dateStr = format(dayStart, 'yyyy-MM-dd');
          completedTasksByDate.set(dateStr, (completedTasksByDate.get(dateStr) || 0) + 1);

          if (taskDate >= thirtyDaysAgo) {
            recentCompletions++;
          }
        }
      }
    }
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
    
    const uniqueDates = Array.from(uniqueTimes)
      .sort((a, b) => b - a)
      .map(t => new Date(t));
    
    // Calculate current streak
    let currentStreak = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      const date = uniqueDates[i];
      const expectedDate = subDays(today, currentStreak);
      
      if (differenceInDays(expectedDate, date) === 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const date of uniqueDates) {
      if (!lastDate || differenceInDays(lastDate, date) === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (differenceInDays(lastDate, date) > 1) {
        tempStreak = 1;
      }
      lastDate = date;
    }
    
    // Calculate weekly trend (last 7 days)
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const completed = completedTasksByDate.get(dateStr) || 0;
      
      return {
        date: format(date, 'EEE'),
        completed
      };
    });
    
    // Calculate monthly average (last 30 days)
    const monthlyAverage = recentCompletions / 30;
    
    return {
      currentStreak,
      longestStreak,
      totalCompleted: completedTasksCount,
      completionRate,
      weeklyTrend,
      monthlyAverage
    };
  }, [tasks]);
};
