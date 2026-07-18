'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { language, t } = useLanguage();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setIsSubmitting(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.replace('/');
      router.refresh();
    } catch (err: any) {
      setIsSubmitting(false);
      const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_project_url') || 
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

      if (isPlaceholder) {
        setErrorMessage(
          language === 'en'
            ? 'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
            : 'Supabase သတ်မှတ်ချက် မပြည့်စုံပါ။ env file တွင် NEXT_PUBLIC_SUPABASE_URL နှင့် NEXT_PUBLIC_SUPABASE_ANON_KEY ကို ဖြည့်စွက်ပေးပါ။'
        );
      } else if (err instanceof TypeError || (err?.message && err.message.includes('Failed to fetch'))) {
        setErrorMessage(
          language === 'en'
            ? 'Network error: Failed to connect to Supabase. Please check your internet connection or ad blocker settings.'
            : 'ကွန်ရက်ချိတ်ဆက်မှု ပြဿနာ- Supabase သို့ မချိတ်ဆက်နိုင်ပါ။ သင်၏ အင်တာနက်ချိတ်ဆက်မှု သို့မဟုတ် ad blocker setting ကို စစ်ဆေးပါ။'
        );
      } else {
        setErrorMessage(err?.message || (language === 'en' ? 'An unexpected error occurred.' : 'မမျှော်လင့်ထားသော အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်။'));
      }
    }
  };

  return (
    <section className="landing-dark-theme-wrapper">
      <div className="glass-panel">
        <span className="badge-neon">
          <ShieldCheck size={14} />
          {language === 'en' ? 'Secure workspace' : 'လုံခြုံစိတ်ချရသော လုပ်ငန်းခွင်'}
        </span>
        <h2>Welcome back</h2>
        <p className="auth-copy-dark">
          Sign in to continue shaping your startup blueprint with the agent workflow.
        </p>
        <form onSubmit={handleLogin} className="auth-form-dark">
          <div className="form-field">
            <label htmlFor="email" className="dark-label">Email</label>
            <input
              id="email"
              type="email"
              className="dark-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password" className="dark-label">Password</label>
            <input
              id="password"
              type="password"
              className="dark-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={language === 'en' ? "Enter your password" : "စကားဝှက်ထည့်ပါ"}
              required
            />
          </div>
          {errorMessage && <p className="dark-error">{errorMessage}</p>}
          <button type="submit" className="button-primary-dark" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Continue to home'}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="dark-switch-copy">
          New here? <Link href="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
