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
    <section className="landing-dark-theme-wrapper">
      <div className="glass-panel">
        <span className="badge-neon">
          <UserPlus size={14} />
          {language === 'en' ? 'Create account' : 'အကောင့်သစ်ဖွင့်ရန်'}
        </span>
        <h2>Start your workspace</h2>
        <p className="auth-copy-dark">
          Register with email and password to save your startup blueprint.
        </p>
        <form onSubmit={handleRegister} className="auth-form-dark">
          <div className="form-field">
            <label htmlFor="username" className="dark-label">Username</label>
            <input
              id="username"
              type="text"
              className="dark-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={language === 'en' ? "Your username" : "သင့်အသုံးပြုသူအမည်"}
              required
            />
          </div>
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
              placeholder={language === 'en' ? "Create a password" : "စကားဝှက်အသစ်သတ်မှတ်ပါ"}
              required
              minLength={6}
            />
          </div>
          <div className="form-field">
            <label htmlFor="confirm-password" className="dark-label">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              className="dark-input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={language === 'en' ? "Repeat your password" : "စကားဝှက်ကို ထပ်မံရိုက်ထည့်ပါ"}
              required
              minLength={6}
            />
          </div>
          {errorMessage && <p className="dark-error">{errorMessage}</p>}
          <button type="submit" className="button-primary-dark" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="dark-switch-copy">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}
