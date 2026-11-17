import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        (isLogin ? 'Invalid email or password.' : 'Registration failed.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F7F8FA] dark:bg-[#0E131F] flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-sm w-full bg-white dark:bg-[#172235] border border-[#E5E7EB] dark:border-[#223147] rounded-lg p-6 shadow-sm space-y-5 my-auto">
        {/* Simple Brand - Centered */}
        <div className="border-b border-[#E5E7EB] dark:border-[#223147] pb-4 text-center">
          <span className="text-xl font-semibold tracking-wider text-[#172235] dark:text-[#F1F5F9] block">
            THERMOCORE
          </span>
          <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1">
            EV Battery Thermal Management System
          </p>
        </div>

        {/* Tab Switcher - Centered 50/50 */}
        <div className="flex border-b border-[#E5E7EB] dark:border-[#223147] text-xs">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`w-1/2 pb-2.5 text-center font-medium transition-colors border-b-2 ${
              isLogin
                ? 'border-[#2563A6] text-[#2563A6] dark:text-[#60A5FA] dark:border-[#60A5FA]'
                : 'border-transparent text-[#6B7280] dark:text-[#94A3B8] hover:text-[#202938] dark:hover:text-[#F1F5F9]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`w-1/2 pb-2.5 text-center font-medium transition-colors border-b-2 ${
              !isLogin
                ? 'border-[#2563A6] text-[#2563A6] dark:text-[#60A5FA] dark:border-[#60A5FA]'
                : 'border-transparent text-[#6B7280] dark:text-[#94A3B8] hover:text-[#202938] dark:hover:text-[#F1F5F9]'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 bg-[#FBEBEB] dark:bg-[#321B1B] border border-[#F4C5C5] dark:border-[#5C2B2B] text-[#C34848] dark:text-[#F87171] rounded text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block mb-1 font-medium text-[#202938] dark:text-[#F1F5F9]">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. operator@somaiya.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-[#1B293E] border border-[#E5E7EB] dark:border-[#223147] rounded px-3 py-2 text-xs text-[#202938] dark:text-[#F1F5F9] focus:border-[#2563A6] focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#202938] dark:text-[#F1F5F9]">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-[#1B293E] border border-[#E5E7EB] dark:border-[#223147] rounded px-3 py-2 text-xs text-[#202938] dark:text-[#F1F5F9] focus:border-[#2563A6] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#2563A6] hover:bg-[#1D4F85] text-white rounded font-medium text-xs transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
