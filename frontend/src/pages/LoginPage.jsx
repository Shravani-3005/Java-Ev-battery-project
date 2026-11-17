import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/client';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('operator@somaiya.edu');
  const [password, setPassword] = useState('operator123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await authApi.login(email, password);
      } else {
        await authApi.register(email, password);
      }
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        (isLogin ? 'Invalid email or password.' : 'Registration failed. Please check your email format.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex flex-col justify-center items-center p-4 font-sans select-none">
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 bg-[#FF7900]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#141416] border border-[#34343A] rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1B1B1F] border border-[#FF7900] flex items-center justify-center text-[#FF7900] shadow-lg shadow-[#FF7900]/20">
            <Zap className="w-8 h-8 fill-[#FF7900]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#F5F5F5] tracking-wide flex items-center justify-center gap-1.5">
              THERMO<span className="text-[#FF7900]">CORE</span>
            </h1>
            <p className="text-xs text-[#A1A1AA] font-medium tracking-wide mt-1">
              EV Battery Thermal Management
            </p>
          </div>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex bg-[#1B1B1F] p-1.5 rounded-2xl border border-[#34343A] text-xs">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`w-1/2 py-2.5 rounded-xl font-bold transition-all ${
              isLogin ? 'bg-[#FF7900] text-black shadow-md' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`w-1/2 py-2.5 rounded-xl font-bold transition-all ${
              !isLogin ? 'bg-[#FF7900] text-black shadow-md' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[#A1A1AA] block mb-1.5 font-semibold text-xs flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#FF7900]" />
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="operator@somaiya.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1B1B1F] border border-[#34343A] rounded-2xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#666] focus:border-[#FF7900] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[#A1A1AA] block mb-1.5 font-semibold text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#FF7900]" />
                Password
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#A1A1AA] hover:text-[#F5F5F5] text-[11px] flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1B1B1F] border border-[#34343A] rounded-2xl px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#666] focus:border-[#FF7900] focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#FF7900] hover:bg-[#ff8c1a] text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF7900]/25 disabled:opacity-50 cursor-pointer mt-2"
          >
            <span>{loading ? 'Authenticating with Spring Security...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
