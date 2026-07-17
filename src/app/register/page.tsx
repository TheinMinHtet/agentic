'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const supabase = useMemo(() => createClient(), []);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage(language === 'en' ? 'Password and confirm password must match.' : 'စကားဝှက်နှစ်ခု ကိုက်ညီမှုမရှိပါ။');
      return;
    }

    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (signUpError) {
      setIsSubmitting(false);
      setErrorMessage(signUpError.message);
      return;
    }

    if (!data.user) {
      setIsSubmitting(false);
      setErrorMessage(language === 'en' ? 'Registration succeeded, but no authenticated user was returned.' : 'အကောင့်ဖွင့်ခြင်း အောင်မြင်သော်လည်း user အချက်အလက် မတွေ့ရှိပါ။');
      return;
    }

    const { error: profileError } = await supabase.from('users').insert({
      user_id: data.user.id,
      username,
      email,
    });

    setIsSubmitting(false);

    if (profileError) {
      setErrorMessage(profileError.message);
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setErrorMessage(signOutError.message);
      return;
    }

    router.replace('/login');
    router.refresh();
  };

  return (
    <section className="auth-section section-padding container">
      <div className="auth-card card">
        <span className="badge-accent auth-badge">
          <UserPlus size={14} />
          {language === 'en' ? 'Create account' : 'အကောင့်သစ်ဖွင့်ရန်'}
        </span>
        <h2>{t('auth.createAccount')}</h2>
        <p className="text-muted auth-copy">
          {t('auth.signUpDesc')}
        </p>
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-field">
            <label htmlFor="username">{language === 'en' ? 'Username' : 'အသုံးပြုသူအမည်'}</label>
            <input
              id="username"
              type="text"
              className="input-text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={language === 'en' ? "Your username" : "သင့်အသုံးပြုသူအမည်"}
              required
            />
          </div>
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
              placeholder={language === 'en' ? "Create a password" : "စကားဝှက်အသစ်သတ်မှတ်ပါ"}
              required
              minLength={6}
            />
          </div>
          <div className="form-field">
            <label htmlFor="confirm-password">{language === 'en' ? 'Confirm Password' : 'စကားဝှက်ကို အတည်ပြုပါ'}</label>
            <input
              id="confirm-password"
              type="password"
              className="input-text"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={language === 'en' ? "Repeat your password" : "စကားဝှက်ကို ထပ်မံရိုက်ထည့်ပါ"}
              required
              minLength={6}
            />
          </div>
          {errorMessage && <p className="auth-error">{errorMessage}</p>}
          <button type="submit" className="button-primary button-full" disabled={isSubmitting}>
            {isSubmitting ? (language === 'en' ? 'Creating account...' : 'အကောင့်ဖွင့်နေသည်...') : t('auth.signUp')}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="auth-switch text-muted">
          {t('auth.haveAccount')} <Link href="/login">{t('auth.signIn')}</Link>
        </p>
      </div>
    </section>
  );
}
