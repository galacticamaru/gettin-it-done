
import { useState, useEffect } from 'react';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { TodoApp } from '@/components/TodoApp';

const Index = () => {
  const [isOnboarding, setIsOnboarding] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('gettinItDone_onboardingComplete');
    if (hasCompletedOnboarding) {
      setIsOnboarding(false);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('gettinItDone_onboardingComplete', 'true');
    setIsOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isOnboarding ? (
        <OnboardingFlow onComplete={completeOnboarding} />
      ) : (
        <TodoApp />
      )}
    </div>
  );
};

export default Index;
