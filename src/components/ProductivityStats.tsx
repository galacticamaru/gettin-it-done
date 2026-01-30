import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, CheckCircle2, Target } from 'lucide-react';
import { useTaskStats } from '@/hooks/useTaskStats';
import { Task } from '@/hooks/useTasks';

interface ProductivityStatsProps {
  tasks: Task[];
}

export const ProductivityStats = ({ tasks }: ProductivityStatsProps) => {
  const stats = useTaskStats(tasks);

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <span className="text-sm font-medium text-muted-foreground truncate">Current Streak</span>
          <div className="flex items-center gap-2 mt-2">
            <Flame className="w-5 h-5 text-primary" />
            <div className="text-3xl font-bold text-primary">{stats.currentStreak}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">days in a row</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <span className="text-sm font-medium text-muted-foreground truncate">Longest Streak</span>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="w-5 h-5 text-accent-foreground" />
            <div className="text-3xl font-bold">{stats.longestStreak}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">days record</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <span className="text-sm font-medium text-muted-foreground truncate">Completed</span>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="w-5 h-5 text-secondary-foreground" />
            <div className="text-3xl font-bold">{stats.totalCompleted}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">total tasks</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <span className="text-sm font-medium text-muted-foreground truncate">Completion Rate</span>
          <div className="flex items-center gap-2 mt-2">
            <Target className="w-5 h-5 text-success" />
            <div className="text-3xl font-bold">{stats.completionRate.toFixed(0)}%</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">success rate</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Weekly Activity</h3>
          <Badge variant="outline">
            Avg: {stats.monthlyAverage.toFixed(1)}/day
          </Badge>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {stats.weeklyTrend.map((day, index) => {
            const maxCompleted = Math.max(...stats.weeklyTrend.map(d => d.completed), 1);
            const height = (day.completed / maxCompleted) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-muted rounded-t relative" style={{ height: '100%' }}>
                  {day.completed > 0 && (
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-t transition-all duration-300"
                      style={{ height: `${height}%` }}
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-foreground">{day.completed}</div>
                  <div className="text-xs text-muted-foreground">{day.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
