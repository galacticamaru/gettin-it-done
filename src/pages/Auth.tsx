
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        let loginSuccess = false;
        try {
          await signIn(email, password);
          loginSuccess = true;
        } catch (signInErr: unknown) {
          if (signInErr instanceof Error && signInErr.message === 'Email not confirmed') {
            setShowEmailConfirmation(true);
            setLoading(false);
            return;
          } else if (signInErr instanceof Error && signInErr.message === 'Invalid login credentials') {
            // Fall through to sign up
          } else {
            throw signInErr;
          }
        }

        if (loginSuccess) {
          navigate('/');
          return;
        }

        try {
          const res = await signUp(email, password);
          // Handle Supabase quirk: signing up an existing user returns no error but empty identities
          if (res?.user && (!res.user.identities || res.user.identities.length === 0)) {
            setIsSignUp(false);
            setError('Account already exists. Please sign in with the correct password.');
            setLoading(false);
            return;
          }
          setShowEmailConfirmation(true);
        } catch (signUpErr: unknown) {
          if (signUpErr instanceof Error && signUpErr.message?.toLowerCase().includes('already registered')) {
            setIsSignUp(false);
            setError('Account already exists. Please sign in.');
          } else if (signUpErr instanceof Error && signUpErr.message?.toLowerCase().includes('rate limit')) {
            setIsSignUp(false);
            setError('Account already exists or rate limited. Please sign in.');
            setLoading(false);
            return;
          } else {
            throw signUpErr;
          }
        }
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred');
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full px-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4" aria-hidden="true" role="img">📧</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Check your email!
            </h1>
            <p className="text-muted-foreground mb-4">
              We've sent you an email to confirm your account. Click the link in the email to complete your registration.
            </p>
            <p className="text-sm text-muted-foreground">
              Email sent to: <strong className="text-foreground">{email}</strong>
            </p>
          </div>

          <Button
            onClick={() => {
              setShowEmailConfirmation(false);
              setIsSignUp(false);
            }}
            variant="outline"
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Start gettin it done today' : 'Continue gettin it done'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full pr-10"
                minLength={6}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-1 disabled:opacity-50"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{showPassword ? 'Hide password' : 'Show password'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {error && (
            <div role="alert" className="text-destructive text-sm text-center font-medium">{error}</div>
          )}

          <Button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-gray-900 font-medium py-3 rounded-full"
          >
            {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />}
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
