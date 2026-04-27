
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const isLight = theme === 'light';
  const label = isLight ? "Switch to dark theme" : "Switch to light theme";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          aria-label={label}
        >
          {isLight ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
