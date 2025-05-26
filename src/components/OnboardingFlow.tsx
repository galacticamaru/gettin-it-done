
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Bell, Repeat, Plus } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [firstTask, setFirstTask] = useState('');

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save first task to localStorage for the main app
      if (firstTask.trim()) {
        const tasks = JSON.parse(localStorage.getItem('gettinItDone_tasks') || '[]');
        tasks.push({
          id: Date.now(),
          text: firstTask,
          completed: currentStep === 3,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('gettinItDone_tasks', JSON.stringify(tasks));
      }
      onComplete();
    }
  };

  const screens = [
    {
      title: "Welcome to Gettin it Done!",
      subtitle: "Let us know something you wanna get done?",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm">
            <span className="text-2xl">💊</span>
            <span className="text-gray-700">Take my medication</span>
            <Button size="sm" className="ml-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900">
              Add
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <Repeat className="w-4 h-4" />
            <Bell className="w-4 h-4" />
          </div>
          <p className="text-sm text-gray-500 text-center px-4">
            Add a due date, configure whether the task repeats and set reminders so you can keep gettin it done!
          </p>
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
              className="border-0 bg-transparent"
            />
            <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
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
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                <span className="text-xl">💊</span>
                <span className="text-gray-700">Take my medication</span>
                <div className="flex gap-2 ml-auto">
                  <Repeat className="w-4 h-4 text-gray-400" />
                  <Bell className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {firstTask && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                  <span className="text-xl">📝</span>
                  <span className="text-gray-700">{firstTask}</span>
                </div>
              )}
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
              className="border-0 bg-transparent"
            />
            <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
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
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                <span className="text-xl">💊</span>
                <span className="text-gray-700">Take my medication</span>
                <div className="flex gap-2 ml-auto">
                  <Repeat className="w-4 h-4 text-gray-400" />
                  <Bell className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {firstTask && (
                <div className="flex items-center gap-3 p-3 bg-green-100 rounded-2xl">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 line-through">{firstTask}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Getting it Done!",
      subtitle: "Today is Mon 26 May. Anything new you wanna get done?",
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl">
            <Input
              placeholder="Add a new task"
              className="border-0 bg-transparent"
            />
            <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
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
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                <span className="text-xl">💊</span>
                <span className="text-gray-700">Take my medication</span>
                <div className="flex gap-2 ml-auto">
                  <Repeat className="w-4 h-4 text-gray-400" />
                  <Bell className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {firstTask && (
                <div className="flex items-center gap-3 p-3 bg-green-100 rounded-2xl">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 line-through">Launch Getting it Done</span>
                </div>
              )}
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
          {currentStep === 3 ? 'Get Started!' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
