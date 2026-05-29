import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Loader } from 'lucide-react';

const AuthPage = ({ mode = 'login', onAuthSuccess }) => {
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) {
          localStorage.setItem('login', 'true');
          onAuthSuccess(data.user);
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        if (data.session) {
          localStorage.setItem('login', 'true');
          onAuthSuccess(data.user);
        } else {
          setError('Signup successful! Please check your email to verify your account or sign in if verification is disabled.');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center light-mesh-bg relative overflow-hidden text-[#2A1F2D]">
      <div className="relative z-10 w-full max-w-md p-8 glass-card border border-white/60 bg-white/70 shadow-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(107,45,123,0.08)] animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EDE4ED] mb-4 shadow-md">
            {isLogin ? (
              <Lock className="w-8 h-8 text-[#6B2D7B]" />
            ) : (
              <UserPlus className="w-8 h-8 text-[#6B2D7B]" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6B2D7B] to-[#A33D5C]">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[#7A6B7D] mt-2 text-sm">
            {isLogin ? 'Enter your credentials to access the strategic planner' : 'Sign up to start planning your strategy'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#A33D5C]/10 border border-[#A33D5C]/20 rounded-xl flex items-start gap-3 text-[#A33D5C] text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#7A6B7D] ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-[#B5A8B8]" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/90 border border-[#E8E0DA] rounded-xl focus:ring-2 focus:ring-[#6B2D7B]/30 focus:border-[#6B2D7B] text-[#2A1F2D] placeholder-[#B5A8B8] transition-all outline-none shadow-sm"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#7A6B7D] ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-[#B5A8B8]" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/90 border border-[#E8E0DA] rounded-xl focus:ring-2 focus:ring-[#6B2D7B]/30 focus:border-[#6B2D7B] text-[#2A1F2D] placeholder-[#B5A8B8] transition-all outline-none shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#6B2D7B] hover:bg-[#4F1F5C] text-white font-medium rounded-xl shadow-lg shadow-[#6B2D7B]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#E8E0DA] pt-6">
          <p className="text-sm text-[#7A6B7D]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setError(null);
                navigate(isLogin ? '/register' : '/login');
              }}
              className="ml-2 text-[#6B2D7B] hover:text-[#4F1F5C] font-semibold transition-colors focus:outline-none"
            >
              {isLogin ? 'Sign up now' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
