import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Bell, Repeat, Plus } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { FilterTabs } from './FilterTabs';
import { useNavigate } from 'react-router-dom';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface OnboardingTask {
  id: number;
  text: string;
  completed: boolean;
  emoji: string;
}

type Filter = 'all' | 'completed' | 'active';

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [firstTask, setFirstTask] = useState('');
  const [firstTaskEmoji, setFirstTaskEmoji] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([
    { id: 1, text: 'Take my medication', completed: false, emoji: '💊' }
  ]);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/auth');
    }
  };

  const addTaskToOnboarding = () => {
    if (firstTask.trim()) {
      const newTask: OnboardingTask = {
        id: Date.now(),
        text: firstTask.trim(),
        completed: false,
        emoji: firstTaskEmoji || getTaskEmoji(firstTask.trim())
      };
      setOnboardingTasks([...onboardingTasks, newTask]);
      setFirstTask('');
      setFirstTaskEmoji('');
    }
  };

  const toggleOnboardingTask = (id: number) => {
    setOnboardingTasks(tasks => 
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const updateTaskEmoji = (id: number, emoji: string) => {
    setOnboardingTasks(tasks => 
      tasks.map(task => 
        task.id === id ? { ...task, emoji: emoji || getTaskEmoji(task.text) } : task
      )
    );
  };

  // Filter tasks based on current filter
  const filteredTasks = onboardingTasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  const getTaskEmoji = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('medication') || lower.includes('medicine')) return '💊';
    if (lower.includes('exercise') || lower.includes('workout')) return '💪';
    if (lower.includes('book') || lower.includes('read')) return '📚';
    if (lower.includes('shop') || lower.includes('buy')) return '🛒';
    if (lower.includes('call') || lower.includes('phone')) return '📞';
    if (lower.includes('email') || lower.includes('mail')) return '📧';
    if (lower.includes('clean')) return '🧹';
    if (lower.includes('cook') || lower.includes('food')) return '🍳';
    return '📝';
  };

  const getHighlightedText = (text: string, wordsToHighlight: string[]) => {
    let highlightedText = text;
    wordsToHighlight.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    return highlightedText;
  };

  const screens = [
    {
      title: "Welcome to Gettin it Done!",
      subtitle: "Let us know something you wanna get done?",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm border border-border">
            <EmojiPicker 
              selectedEmoji={firstTaskEmoji}
              onEmojiSelect={setFirstTaskEmoji}
            />
            <Input
              placeholder="Add a new task"
              value={firstTask}
              onChange={(e) => setFirstTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTaskToOnboarding()}
              className="border-0 bg-transparent focus-visible:ring-0 text-foreground"
              aria-label="New task description"
            />
            <Button 
              onClick={addTaskToOnboarding}
              size="sm" 
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 dark:bg-yellow-500 dark:hover:bg-yellow-600"
            >
              Add
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar 
              className="w-4 h-4 cursor-pointer hover:text-yellow-600 transition-colors" 
              onMouseEnter={() => setHoveredIcon('calendar')}
              onMouseLeave={() => setHoveredIcon(null)}
            />
            <Repeat 
              className="w-4 h-4 cursor-pointer hover:text-yellow-600 transition-colors"
              onMouseEnter={() => setHoveredIcon('repeat')}
              onMouseLeave={() => setHoveredIcon(null)}
            />
            <Bell 
              className="w-4 h-4 cursor-pointer hover:text-yellow-600 transition-colors"
              onMouseEnter={() => setHoveredIcon('bell')}
              onMouseLeave={() => setHoveredIcon(null)}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center px-4">
            <span dangerouslySetInnerHTML={{
              __html: getHighlightedText(
                "Add a due date, configure whether the task repeats and set reminders so you can keep gettin it done!",
                hoveredIcon === 'calendar' ? ['due date'] :
                hoveredIcon === 'repeat' ? ['task repeats'] :
                hoveredIcon === 'bell' ? ['reminders'] : []
              )
            }} />
          </p>
          
          <FilterTabs filter={filter} onFilterChange={setFilter} />
          
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border">
                <EmojiPicker 
                  selectedEmoji={task.emoji}
                  onEmojiSelect={(emoji) => updateTaskEmoji(task.id, emoji)}
                />
                <span className="text-foreground">{task.text}</span>
                <div className="flex gap-2 ml-auto">
                  <Repeat className="w-4 h-4 text-muted-foreground" />
                  <Bell className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
          {filteredTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center px-4">
              {filter === 'completed' ? 'No completed tasks yet.' : 
               filter === 'active' ? 'No active tasks.' : 
               'Your tasks will appear here. Try adding a task above so you can track gettin it done.'}
            </p>
          )}
        </div>
      )
    },
    {
      title: "Nice!",
      subtitle: "Why don't you try completing your first task.",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
            <EmojiPicker 
              selectedEmoji={firstTaskEmoji}
              onEmojiSelect={setFirstTaskEmoji}
            />
            <Input
              placeholder="Add a new task"
              value={firstTask}
              onChange={(e) => setFirstTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTaskToOnboarding()}
              className="border-0 bg-transparent focus-visible:ring-0 text-foreground"
              aria-label="New task description"
            />
            <Button 
              onClick={addTaskToOnboarding}
              size="sm" 
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 dark:bg-yellow-500 dark:hover:bg-yellow-600"
            >
              Add
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar 
              className="w-4 h-4 cursor-pointer hover:text-yellow-600 transition-colors" 
              onMouseEnter={() => setHoveredIcon('calendar')}
              onMouseLeave={() => setHoveredIcon(null)}
            />
            <Repeat 
              className="w-4 h-4 cursor-pointer hover:text-yellow-600 transition-colors"
              onMouseEnter={() => setHoveredIcon('repeat')}
              onMouseLeave={() => setHoveredIcon(null)}
            />
            <Bell 
              className="w-4 h-4 cursor-pointer hover:text-yellow-600 transition-colors"
              onMouseEnter={() => setHoveredIcon('bell')}
              onMouseLeave={() => setHoveredIcon(null)}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center px-4">
            <span dangerouslySetInnerHTML={{
              __html: getHighlightedText(
                "Add a due date, configure whether the task repeats and set reminders so you can keep gettin it done!",
                hoveredIcon === 'calendar' ? ['due date'] :
                hoveredIcon === 'repeat' ? ['task repeats'] :
                hoveredIcon === 'bell' ? ['reminders'] : []
              )
            }} />
          </p>
          
          <FilterTabs filter={filter} onFilterChange={setFilter} />
          
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center gap-3 p-3 rounded-2xl border border-border ${
                  task.completed ? 'bg-success/10' : 'bg-card'
                }`}
              >
                <button
                  onClick={() => toggleOnboardingTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-success border-success' 
                      : 'border-muted-foreground/30 hover:border-success'
                  }`}
                >
                  {task.completed && (
                    <span className="text-white text-sm font-bold">✓</span>
                  )}
                </button>
                <EmojiPicker 
                  selectedEmoji={task.emoji}
                  onEmojiSelect={(emoji) => updateTaskEmoji(task.id, emoji)}
                />
                <span className={`text-foreground ${task.completed ? 'line-through' : ''}`}>
                  {task.text}
                </span>
                <div className="flex gap-2 ml-auto">
                  <Repeat className="w-4 h-4 text-muted-foreground" />
                  <Bell className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
          {filteredTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center px-4">
              {filter === 'completed' ? 'No completed tasks yet. Complete some tasks to see them here!' : 
               filter === 'active' ? 'No active tasks. Add a new task to get started!' : 
               'Your tasks will appear here.'}
            </p>
          )}
        </div>
      )
    },
    {
      title: "They've bloody done it!",
      subtitle: "Sign up with a free account to start gettin it done. 🚀",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
            <div className="text-xl p-1">😀</div>
            <Input
              placeholder="Create an account to add more tasks"
              className="border-0 bg-transparent focus-visible:ring-0 text-foreground"
              disabled
            />
            <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 dark:bg-yellow-500 dark:hover:bg-yellow-600" disabled>
              Add
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <Repeat className="w-4 h-4" />
            <Bell className="w-4 h-4" />
          </div>
          
          <FilterTabs filter={filter} onFilterChange={setFilter} />
          
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center gap-3 p-3 rounded-2xl border border-border ${
                  task.completed ? 'bg-success/10' : 'bg-card'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  task.completed 
                    ? 'bg-success border-success' 
                    : 'border-muted-foreground/30'
                }`}>
                  {task.completed && (
                    <span className="text-white text-sm font-bold">✓</span>
                  )}
                </div>
                <span className="text-xl">{task.emoji}</span>
                <span className={`text-foreground ${task.completed ? 'line-through' : ''}`}>
                  {task.text}
                </span>
                <div className="flex gap-2 ml-auto">
                  <Repeat className="w-4 h-4 text-muted-foreground" />
                  <Bell className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
          {filteredTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center px-4">
              {filter === 'completed' ? 'No completed tasks yet.' : 
               filter === 'active' ? 'No active tasks.' : 
               'Your tasks will appear here.'}
            </p>
          )}
        </div>
      )
    }
  ];

  const currentScreen = screens[currentStep];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {currentScreen.title}
          </h1>
          <p className="text-muted-foreground">
            {currentScreen.subtitle}
          </p>
        </div>

        <div className="flex-1">
          {currentScreen.content}
        </div>

        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {screens.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-foreground' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={handleNextStep}
          className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-gray-900 font-medium py-3 rounded-full"
        >
          {currentStep === 2 ? 'Create Account' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
