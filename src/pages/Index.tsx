
import { useState, useEffect } from 'react';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { TodoApp } from '@/components/TodoApp';
import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';

const Index = () => {
  const [isOnboarding, setIsOnboarding] = useState(true);
  const { user, loading } = useAuth();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show onboarding if user hasn't completed it and no user is logged in
  if (isOnboarding && !user) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  // Show auth page if user is not logged in
  if (!user) {
    return <Auth />;
  }

  // Show main app if user is logged in
  return <TodoApp />;
};

export default Index;
