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
    
    // Get completed tasks with dates
    const completedTasks = tasks.filter(task => task.completed);
    const totalTasks = tasks.length;
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    // Calculate streaks
    const completionDates = completedTasks
      .filter(task => task.updatedAt)
      .map(task => startOfDay(parseISO(task.updatedAt)))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;
    
    const uniqueDates = Array.from(new Set(completionDates.map(d => d.getTime())))
      .map(t => new Date(t))
      .sort((a, b) => b.getTime() - a.getTime());
    
    // Calculate current streak
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
    // Pre-calculate completed task counts per day
    const completedTasksByDate = new Map<string, number>();
    for (const task of completedTasks) {
      if (task.updatedAt) {
        const taskDate = format(startOfDay(parseISO(task.updatedAt)), 'yyyy-MM-dd');
        completedTasksByDate.set(taskDate, (completedTasksByDate.get(taskDate) || 0) + 1);
      }
    }

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
    const thirtyDaysAgo = subDays(today, 30);
    const recentCompletions = completedTasks.filter(task => {
      if (!task.updatedAt) return false;
      const taskDate = parseISO(task.updatedAt);
      return taskDate >= thirtyDaysAgo;
    }).length;
    const monthlyAverage = recentCompletions / 30;
    
    return {
      currentStreak,
      longestStreak,
      totalCompleted: completedTasks.length,
      completionRate,
      weeklyTrend,
      monthlyAverage
    };
  }, [tasks]);
};
