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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await signUp(email.trim(), password, fullName.trim(), phone.trim());
      if (error) {
        setErrorMessage(error.message || 'Registration failed');
      } else {
        navigate('/account');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account');
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
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

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
