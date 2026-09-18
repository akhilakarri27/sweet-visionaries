import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ title: string; message: string } | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessInfo(null);

    try {
      const { data, error } = await signUp(email.trim(), password, fullName.trim(), phone.trim());
      if (error) {
        const msg = error.message || '';
        if (msg.toLowerCase().includes('rate limit')) {
          setErrorMessage('Supabase free tier email rate limit reached. Please disable "Confirm email" in Supabase Auth Settings (Providers -> Email) for instant registration without SMTP limits.');
        } else if (msg.toLowerCase().includes('user already registered')) {
          setErrorMessage('An account with this email already exists. Please proceed to Sign In.');
        } else {
          setErrorMessage(msg || 'Registration failed. Please check your details and try again.');
        }
      } else if (data?.session) {
        // Active session created immediately
        navigate('/account');
      } else if (data?.user) {
        // User created, confirmation email sent or ready for sign in
        setSuccessInfo({
          title: 'Account Created Successfully! 🎉',
          message: 'Welcome to Kotaiah Sweets! Your profile is ready. If email verification is enabled on your Supabase project, check your inbox to confirm, or proceed to sign in.',
        });
      } else {
        navigate('/account');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-brand-warm-gradient">
      <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl border border-brand-border p-8 shadow-card space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-brand-maroon text-brand-gold-light flex items-center justify-center font-serif text-xl font-bold mx-auto border border-brand-gold shadow-soft">
            K
          </div>
          <h1 className="font-serif font-black text-2xl text-brand-charcoal">
            Join Kotaiah Sweets Family
          </h1>
          <p className="text-xs text-stone-500">
            Create an account to save your favorite sweets and enjoy exclusive festive treats
          </p>
        </div>

        {errorMessage && (
          <div className="space-y-3 p-4 bg-amber-50/90 border border-amber-300/80 rounded-2xl text-xs text-amber-950">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900">Supabase SMTP Rate Limit Notice</p>
                <p className="text-stone-700 leading-relaxed">{errorMessage}</p>
              </div>
            </div>

            {errorMessage.toLowerCase().includes('rate limit') && (
              <div className="pt-2 border-t border-amber-200/80 space-y-2 text-[11px] text-stone-700">
                <p className="font-semibold text-amber-900">⚡ How to fix this in 10 seconds:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Open your Supabase Project: <a href="https://supabase.com/dashboard/project/bunigrqjuvrenwgsodab/auth/providers" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline font-bold">Auth Providers Settings ↗</a></li>
                  <li>Click on <strong>Email</strong> to expand the settings.</li>
                  <li>Turn <strong>Confirm email</strong> to <strong>OFF</strong> and click <strong>Save</strong>.</li>
                </ol>
                <p className="text-[10px] text-stone-500 italic">
                  Turning off "Confirm email" enables instant registration with 0 email limits.
                </p>
              </div>
            )}
          </div>
        )}

        {successInfo ? (
          <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center space-y-4 text-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-emerald-900">{successInfo.title}</h3>
            <p className="text-emerald-800 leading-relaxed font-sans">{successInfo.message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-brand-primary hover:bg-brand-primary-hover text-white py-3 rounded-xl font-bold text-xs shadow-primary transition-all"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sridhar Sharma"
                className="w-full bg-brand-surface pl-9 pr-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-brand-surface pl-9 pr-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-gold"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Email Address *</label>
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
            <label className="font-semibold text-stone-700">Create Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
            <span>{isLoading ? 'Creating Account...' : 'Register & Join'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        )}

        <div className="text-center pt-2 text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-maroon hover:text-brand-gold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
