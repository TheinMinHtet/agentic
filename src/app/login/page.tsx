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
  };

  return (
    <section className="auth-section section-padding container">
      <div className="auth-card card">
        <span className="badge-accent auth-badge">
          <ShieldCheck size={14} />
          {language === 'en' ? 'Secure workspace' : 'လုံခြုံစိတ်ချရသော လုပ်ငန်းခွင်'}
        </span>
        <h2>{t('auth.welcome')}</h2>
        <p className="text-muted auth-copy">
          {t('auth.welcomeDesc')}
        </p>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-field">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              className="input-text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              className="input-text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={language === 'en' ? "Enter your password" : "စကားဝှက်ထည့်ပါ"}
              required
            />
          </div>
          {errorMessage && <p className="auth-error">{errorMessage}</p>}
          <button type="submit" className="button-primary button-full" disabled={isSubmitting}>
            {isSubmitting ? (language === 'en' ? 'Signing in...' : 'လော့ဂ်အင်ဝင်နေသည်...') : t('auth.buttonLogin')}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="auth-switch text-muted">
          {t('auth.noAccount')} <Link href="/register">{t('auth.signUp')}</Link>
        </p>
      </div>
    </section>
  );
}
