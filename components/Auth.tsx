
import React, { useState } from 'react';
import { LayoutDashboard, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { User as UserType } from '../types.ts';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (signupError) throw signupError;
        if (data.user) {
          onLogin({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.full_name || 'New User',
          });
        }
      } else {
        const { data, error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signinError) throw signinError;
        if (data.user) {
          onLogin({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.full_name || data.user.email!.split('@')[0],
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white shadow-xl mb-4">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Routine Builder</h1>
          <p className="text-gray-500 mt-2">Personal Exercise & Routine Management</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {mode === 'signin' ? 'Sign In' : 'Get Started'} <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
