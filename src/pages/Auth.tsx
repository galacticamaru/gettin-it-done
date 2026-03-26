
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // We are trying to sign up.
        // First try to sign in to see if the user already exists.
        let loginSuccess = false;
        try {
          await signIn(email, password);
          loginSuccess = true;
        } catch (signInErr: unknown) {
          if (signInErr instanceof Error && signInErr.message === 'Email not confirmed') {
            // User exists, password is correct, but not confirmed yet
            setShowEmailConfirmation(true);
            setLoading(false);
            return;
          } else if (signInErr instanceof Error && signInErr.message === 'Invalid login credentials') {
            // Password is wrong OR user doesn't exist
            // We can't distinguish, so we try signing up now
          } else {
            // Some other error, throw it so the catch block handles it
            throw signInErr;
          }
        }

        if (loginSuccess) {
          // They already had an account and password was correct
          navigate('/');
          return;
        }

        // If login failed with Invalid login credentials, try to sign up
        try {
          const res = await signUp(email, password);
          // A known Supabase quirk is that signing up an existing user
          // might return no error but an empty identities array.
          if (res?.user && (!res.user.identities || res.user.identities.length === 0)) {
            // The user already exists. Since sign in failed with "Invalid login credentials",
            // it means the password provided during sign up is incorrect for the existing account.
            setIsSignUp(false);
            setError('Account already exists. Please sign in with the correct password.');
            setLoading(false);
            return;
          }
          setShowEmailConfirmation(true);
        } catch (signUpErr: unknown) {
          // For instance, "User already registered" (if supabase changed behavior)
          if (signUpErr instanceof Error && signUpErr.message?.toLowerCase().includes('already registered')) {
            setIsSignUp(false);
            setError('Account already exists. Please sign in.');
          } else if (signUpErr instanceof Error && signUpErr.message?.toLowerCase().includes('rate limit')) {
            // If they hit rate limit while signing up an existing account (or new one too many times)
            // It could be they have an account already or just spammed the button.
            // Since sign in failed previously with "Invalid login credentials",
            // it means the password provided during sign up is likely incorrect for the existing account.
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
            <div className="text-6xl mb-4">📧</div>
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
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-destructive text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-gray-900 font-medium py-3 rounded-full"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
