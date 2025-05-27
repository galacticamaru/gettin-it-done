import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Bell, Repeat, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface OnboardingTask {
  id: number;
  text: string;
  completed: boolean;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [firstTask, setFirstTask] = useState('');
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>([
    { id: 1, text: 'Take my medication', completed: false }
  ]);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to auth page instead of completing onboarding
      navigate('/auth');
    }
  };

  const addTaskToOnboarding = () => {
    if (firstTask.trim()) {
      const newTask: OnboardingTask = {
        id: Date.now(),
        text: firstTask.trim(),
        completed: false
      };
      setOnboardingTasks([...onboardingTasks, newTask]);
      setFirstTask('');
    }
  };

  const toggleOnboardingTask = (id: number) => {
    setOnboardingTasks(tasks => 
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

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
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm">
            <Input
              placeholder="Add a new task"
              value={firstTask}
              onChange={(e) => setFirstTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTaskToOnboarding()}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
            <Button 
              onClick={addTaskToOnboarding}
              size="sm" 
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
            >
              Add
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
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
          <p className="text-sm text-gray-500 text-center px-4">
            <span dangerouslySetInnerHTML={{
              __html: getHighlightedText(
                "Add a due date, configure whether the task repeats and set reminders so you can keep gettin it done!",
                hoveredIcon === 'calendar' ? ['due date'] :
                hoveredIcon === 'repeat' ? ['task repeats'] :
                hoveredIcon === 'bell' ? ['reminders'] : []
              )
            }} />
          </p>
          <div className="space-y-3">
            {onboardingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                <span className="text-xl">{getTaskEmoji(task.text)}</span>
                <span className="text-gray-700">{task.text}</span>
                <div className="flex gap-2 ml-auto">
                  <Repeat className="w-4 h-4 text-gray-400" />
                  <Bell className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400 text-center px-4">
            Your tasks will appear here. Try adding a task above so you can track gettin it done.
          </p>
        </div>
      )
    },
    {
      title: "Nice!",
      subtitle: "Why don't you try completing your first task.",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl">
            <Input
              placeholder="Add a new task"
              value={firstTask}
              onChange={(e) => setFirstTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTaskToOnboarding()}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
            <Button 
              onClick={addTaskToOnboarding}
              size="sm" 
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
            >
              Add
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <Repeat className="w-4 h-4" />
            <Bell className="w-4 h-4" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-center gap-8 text-sm">
              <span className="text-yellow-600 border-b-2 border-yellow-400 pb-1">All</span>
              <span className="text-gray-400">Completed</span>
              <span className="text-gray-400">Active</span>
            </div>
            <div className="space-y-3">
              {onboardingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-3 p-3 bg-white rounded-2xl ${
                    task.completed ? 'bg-green-50' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleOnboardingTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {task.completed && (
                      <span className="text-white text-sm font-bold">✓</span>
                    )}
                  </button>
                  <span className="text-xl">{getTaskEmoji(task.text)}</span>
                  <span className={`text-gray-700 ${task.completed ? 'line-through' : ''}`}>
                    {task.text}
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <Repeat className="w-4 h-4 text-gray-400" />
                    <Bell className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "They've bloody done it!",
      subtitle: "Gettin it done ain't rocket science, but you will fly as you keep on goin innit. 🚀",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl">
            <Input
              placeholder="Add a new task"
              className="border-0 bg-transparent focus-visible:ring-0"
              disabled
            />
            <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900" disabled>
              Add
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <Repeat className="w-4 h-4" />
            <Bell className="w-4 h-4" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-center gap-8 text-sm">
              <span className="text-yellow-600 border-b-2 border-yellow-400 pb-1">All</span>
              <span className="text-gray-400">Completed</span>
              <span className="text-gray-400">Active</span>
            </div>
            <div className="space-y-3">
              {onboardingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-3 p-3 rounded-2xl ${
                    task.completed ? 'bg-green-100' : 'bg-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    task.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300'
                  }`}>
                    {task.completed && (
                      <span className="text-white text-sm font-bold">✓</span>
                    )}
                  </div>
                  <span className="text-xl">{getTaskEmoji(task.text)}</span>
                  <span className={`text-gray-700 ${task.completed ? 'line-through' : ''}`}>
                    {task.text}
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <Repeat className="w-4 h-4 text-gray-400" />
                    <Bell className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentScreen = screens[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentScreen.title}
          </h1>
          <p className="text-gray-600">
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
                  index === currentStep ? 'bg-gray-900' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={handleNextStep}
          className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-3 rounded-full"
        >
          {currentStep === 2 ? 'Create Account' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
