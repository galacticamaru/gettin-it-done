import { Home, ListTodo, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'home' | 'tasks' | 'completed' | 'profile';

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav = ({ currentTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border pb-safe pt-2 px-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-10px_rgba(255,255,255,0.05)] rounded-t-2xl">
      <nav role="tablist" className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={currentTab === id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-1 transition-colors duration-200 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg",
              currentTab === id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={label}
            aria-current={currentTab === id ? 'page' : undefined}
          >
            <Icon
              className={cn(
                "h-6 w-6 transition-transform duration-200",
                currentTab === id ? "scale-110" : "scale-100"
              )}
            />
            <span className="text-base font-medium tracking-wide">
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};
