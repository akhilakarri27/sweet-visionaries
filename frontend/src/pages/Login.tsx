import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await signIn(email.trim(), password);
      if (error) {
        const msg = error.message || '';
        if (msg.toLowerCase().includes('email not confirmed')) {
          setErrorMessage('Your email is not confirmed yet. Please verify your email or disable "Confirm email" in Supabase Auth settings.');
        } else if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid_grant')) {
          setErrorMessage('Invalid email or password. If you are a new customer, please click "Create Account" below to register.');
        } else if (msg.toLowerCase().includes('rate limit')) {
          setErrorMessage('Supabase email rate limit reached. Turn off "Confirm email" in Supabase Dashboard (Auth -> Providers -> Email) for instant access.');
        } else {
          setErrorMessage(msg || 'Invalid email or password. Please try again.');
        }
      } else {
        navigate('/account');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-brand-warm-gradient">
      <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl border border-brand-border p-8 shadow-card space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-brand-maroon text-brand-gold-light flex items-center justify-center font-serif text-xl font-bold mx-auto border border-brand-gold shadow-soft">
            K
          </div>
          <h1 className="font-serif font-black text-2xl text-brand-charcoal">
            Welcome to Kotaiah Sweets
          </h1>
          <p className="text-xs text-stone-500">
            Sign in to track your orders, manage wishlist, and leave reviews
          </p>
        </div>

        {errorMessage && (
          <div className="space-y-3 p-4 bg-amber-50/90 border border-amber-300/80 rounded-2xl text-xs text-amber-950">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900">Notice</p>
                <p className="text-stone-700 leading-relaxed">{errorMessage}</p>
              </div>
            </div>

            {(errorMessage.toLowerCase().includes('email is not confirmed') || errorMessage.toLowerCase().includes('rate limit')) && (
              <div className="pt-2 border-t border-amber-200/80 space-y-1.5 text-[11px] text-stone-700">
                <p className="font-semibold text-amber-900">⚡ To allow instant sign-in without email confirmation:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Open <a href="https://supabase.com/dashboard/project/bunigrqjuvrenwgsodab/auth/providers" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline font-bold">Supabase Auth Providers ↗</a></li>
                  <li>Click on <strong>Email</strong> provider.</li>
                  <li>Turn <strong>Confirm email</strong> to <strong>OFF</strong> and click <strong>Save</strong>.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-brand-surface pl-9 pr-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-stone-700">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-surface pl-9 pr-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold-light py-3.5 rounded-2xl font-bold text-xs shadow-gold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-stone-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-maroon hover:text-brand-gold">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
};
