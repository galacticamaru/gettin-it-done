import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Bell, Repeat } from 'lucide-react';
import { FilterTabs } from './FilterTabs';
import { useNavigate } from 'react-router-dom';
import { DesktopTaskInput } from './DesktopTaskInput';
import { MobileTaskCreator } from './MobileTaskCreator';
import { TaskList } from './TaskList';
import { useIsMobile } from '@/hooks/use-mobile';
import { DragDropContext } from './DragDropContext';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface OnboardingTask {
  id: string;
  text: string;
  completed: boolean;
  emoji: string;
  createdAt: string;
  dueDate?: string;
  repeatOption?: string;
  reminder?: string;
}

type Filter = 'all' | 'completed' | 'active';

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [filter, setFilter] = useState<Filter>('active');
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([
    { id: '1', text: 'Take my medication', completed: false, emoji: '💊', createdAt: new Date().toISOString() }
  ]);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  // States for Task Creation
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeatOption, setRepeatOption] = useState('none');
  const [reminder, setReminder] = useState('none');
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const navigate = useNavigate();

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/auth');
    }
  };

  const addTaskToOnboarding = () => {
    if (newTask.trim()) {
      const task: OnboardingTask = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        emoji: selectedEmoji || getTaskEmoji(newTask.trim()),
        createdAt: new Date().toISOString(),
        dueDate: dueDate || undefined,
        repeatOption: repeatOption !== 'none' ? repeatOption : undefined,
        reminder: reminder !== 'none' ? reminder : undefined,
      };
      setOnboardingTasks([...onboardingTasks, task]);
      setNewTask('');
      setSelectedEmoji('');
      setDueDate('');
      setRepeatOption('none');
      setReminder('none');
    }
  };

  const toggleOnboardingTask = async (id: string) => {
    setOnboardingTasks(tasks => 
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteOnboardingTask = async (id: string) => {
    setOnboardingTasks(tasks => tasks.filter(task => task.id !== id));
  };

  const reorderTasks = (dragId: string, hoverId: string) => {
    setOnboardingTasks((prevTasks) => {
      const dragIndex = prevTasks.findIndex((t) => t.id === dragId);
      const hoverIndex = prevTasks.findIndex((t) => t.id === hoverId);

      if (dragIndex === -1 || hoverIndex === -1) return prevTasks;

      const newTasks = [...prevTasks];
      const [draggedTask] = newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, draggedTask);

      return newTasks;
    });
  };

  const noopFetchTasks = async () => {};

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

  const renderSharedContent = () => (
    <div className="space-y-6">
      {!isMobile && (
        <DesktopTaskInput
          newTask={newTask}
          setNewTask={setNewTask}
          dueDate={dueDate}
          setDueDate={setDueDate}
          repeatOption={repeatOption}
          setRepeatOption={setRepeatOption}
          reminder={reminder}
          setReminder={setReminder}
          selectedEmoji={selectedEmoji}
          setSelectedEmoji={setSelectedEmoji}
          handleAddTask={addTaskToOnboarding}
        />
      )}

      {isMobile && (
        <MobileTaskCreator
          newTask={newTask}
          setNewTask={setNewTask}
          dueDate={dueDate}
          setDueDate={setDueDate}
          repeatOption={repeatOption}
          setRepeatOption={setRepeatOption}
          reminder={reminder}
          setReminder={setReminder}
          selectedEmoji={selectedEmoji}
          setSelectedEmoji={setSelectedEmoji}
          onAddTask={addTaskToOnboarding}
        />
      )}

      <div className="flex flex-col items-center gap-2 pt-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
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
      </div>

      {!isMobile && <FilterTabs filter={filter} onFilterChange={setFilter} />}

      <TaskList
        tasks={filteredTasks}
        isMobile={isMobile}
        filter={filter}
        celebratingTaskId={null}
        handleToggleTask={toggleOnboardingTask}
        handleDeleteTask={deleteOnboardingTask}
        reorderTasks={reorderTasks}
        fetchTasks={noopFetchTasks}
      />
    </div>
  );

  const screens = [
    {
      title: "Welcome to Gettin it Done!",
      subtitle: "Let us know something you wanna get done?",
      content: renderSharedContent()
    },
    {
      title: "Nice!",
      subtitle: "Why don't you try completing your first task.",
      content: renderSharedContent()
    },
    {
      title: "They've bloody done it!",
      subtitle: "Sign up with a free account to start gettin it done. 🚀",
      content: renderSharedContent()
    }
  ];

  const currentScreen = screens[currentStep];

  return (
    <DragDropContext>
      <div className={`min-h-screen bg-background ${isMobile ? 'mobile-scroll pb-24' : ''}`}>
        <div className={`flex-1 flex flex-col mx-auto w-full ${isMobile ? 'px-4 py-4' : 'max-w-md px-6 py-8'}`}>
          <div className="text-center mb-8">
            <h1 className={`font-bold text-foreground mb-2 text-center ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {currentScreen.title}
            </h1>
            <p className={`text-muted-foreground text-center ${isMobile ? 'text-sm' : ''}`}>
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
    </DragDropContext>
  );
};
