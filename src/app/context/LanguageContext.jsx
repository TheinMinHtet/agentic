'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    navbar: {
      home: "Home",
      dashboard: "Dashboard",
      logout: "Logout",
      login: "Login"
    },
    footer: {
      builtWith: "Built with Advanced AI Multi-Agent Workflows.",
      rights: "© 2026 Agentic Workflow. All rights reserved."
    },
    landing: {
      heroBadge: "AI Startup Co-Founders",
      heroTitlePrefix: "Launch Your Startup with",
      heroSubtitle: "Collaborate with a specialized team of AI co-founders: Refiner, Researcher, Financial Modeler, and Marketer. Walk away with a customized business blueprint in minutes.",
      buttonStart: "Start Building",
      buttonDemo: "Watch Demo",
      simulateTitle: "Simulate Startup Setup",
      simulateDesc: "Watch the workflow agents collaborate to refine concepts, analyze markets, and model finances."
    },
    auth: {
      welcome: "Welcome Back",
      welcomeDesc: "Log in to access your startup blueprints",
      email: "Email Address",
      password: "Password",
      buttonLogin: "Log In",
      noAccount: "Don't have an account?",
      signUp: "Sign Up",
      createAccount: "Create Your Account",
      signUpDesc: "Set up your credentials to begin generating blueprints",
      haveAccount: "Already have an account?",
      signIn: "Sign In"
    },
    ideaPrompt: {
      badge: "Step 1: Ideation",
      title: "Validate Your Startup Idea",
      desc: "Type in your raw business concept. Our gatekeeper agent will analyze its clarity, actionability, and uniqueness.",
      placeholder: "e.g. A localized car rental reservation app in Yangon with subscriptions...",
      buttonValidate: "Validate Idea",
      buttonAutoRefine: "Auto-Refine with AI",
      scoreTitle: "Evaluation Matrix Score",
      feedbackTitle: "Constructive Feedback",
      questionsTitle: "Clarification Questions",
      buttonProceed: "Proceed to Business Info"
    },
    businessInfo: {
      badge: "Step 2: Business Info",
      title: "Business Context Questionnaire",
      desc: "Provide details about your target market, budget, location, and constraints to tailor the generated plan.",
      labelTitle: "Idea Title / Name",
      labelLocation: "Target Location",
      labelBudget: "Startup Budget (MMK)",
      labelCustomers: "Primary Target Audience",
      labelCategory: "Business Category",
      labelExperience: "Your Experience Level",
      labelGoal: "Primary Business Goal",
      labelPainpoint: "Core Customer Painpoint",
      labelTimeline: "Launch Timeline",
      labelRevenue: "Revenue Stream",
      buttonSave: "Save & Generate Blueprint",
      generating: "Generating Blueprint..."
    },
    dashboard: {
      title: "Startup Blueprint Studio",
      subtitle: "Explore your complete structured business launch blueprint.",
      tabOverview: "Overview",
      tabMarket: "Market Analysis",
      tabFinance: "Financial Model",
      tabBrand: "Branding Package",
      tabDigital: "Digital Presence",
      tabGrowth: "Growth Plan",
      tabInvestor: "Go to Investor",
      buttonNew: "New Idea",
      buttonRefine: "Refine Blueprint",
      costSummary: "Financial Summary",
      initialCost: "Initial Startup Cost",
      breakeven: "Break-even Timeline",
      monthlyRevenue: "Projected Monthly Revenue",
      months: "months",
      differentiators: "Key Differentiators",
      audience: "Target Audience",
      concept: "Refined Concept"
    }
  },
  my: {
    navbar: {
      home: "ပင်မစာမျက်နှာ",
      dashboard: "ဒက်ရှ်ဘုတ်",
      logout: "ထွက်ရန်",
      login: "လော့ဂ်အင်ဝင်ရန်"
    },
    footer: {
      builtWith: "အဆင့်မြင့် AI အေဂျင့်စနစ်များဖြင့် တည်ဆောက်ထားသည်။",
      rights: "© ၂၀၂၆ Agentic Workflow။ မူပိုင်ခွင့်များအားလုံး လက်ဝယ်ရှိသည်။"
    },
    landing: {
      heroBadge: "AI လုပ်ငန်းတွဲဖက်တည်ထောင်သူများ",
      heroTitlePrefix: "လုပ်ငန်းသစ်ကို AI အေဂျင့်များဖြင့်",
      heroSubtitle: "Refiner၊ Researcher၊ Financial Modeler နှင့် Marketer စသည့် AI တွဲဖက်တည်ထောင်သူ အေဂျင့်များနှင့် ပူးပေါင်းလုပ်ဆောင်ပါ။ မိနစ်ပိုင်းအတွင်း စိတ်ကြိုက်ပြင်ဆင်ထားသော လုပ်ငန်းအစီအစဉ်ကို ရယူလိုက်ပါ။",
      buttonStart: "စတင်တည်ဆောက်မည်",
      buttonDemo: "သရုပ်ပြဗီဒီယိုကြည့်မည်",
      simulateTitle: "လုပ်ငန်းအစပျိုးမှုကို သရုပ်ပြစမ်းသပ်မည်",
      simulateDesc: "လုပ်ငန်းစိတ်ကူးများကို မွမ်းမံရန်၊ ဈေးကွက်ဆန်းစစ်ရန်နှင့် ဘဏ္ဍာရေးတွက်ချက်ရန် AI အေဂျင့်များ၏ အတူတကွ ပူးပေါင်းဆောင်ရွက်မှုကို လေ့လာပါ။"
    },
    auth: {
      welcome: "ပြန်လည်ကြိုဆိုပါသည်",
      welcomeDesc: "လုပ်ငန်းသစ်အစီအစဉ်များကို ကြည့်ရှုရန် လော့ဂ်အင်ဝင်ပါ",
      email: "အီးမေးလ်လိပ်စာ",
      password: "စကားဝှက်",
      buttonLogin: "လော့ဂ်အင်ဝင်မည်",
      noAccount: "အကောင့်မရှိသေးပါက -",
      signUp: "အကောင့်သစ်ဖွင့်ရန်",
      createAccount: "အကောင့်အသစ်ဖွင့်ပါ",
      signUpDesc: "လုပ်ငန်းအစီအစဉ်များ စတင်ဖန်တီးရန် သင်၏အကောင့်အချက်အလက်ကို သတ်မှတ်ပါ",
      haveAccount: "အကောင့်ရှိပြီးသားဖြစ်ပါက -",
      signIn: "လော့ဂ်အင်ဝင်ပါ"
    },
    ideaPrompt: {
      badge: "အဆင့် ၁ - စိတ်ကူးစိတ်သန်း",
      title: "လုပ်ငန်းစိတ်ကူးကို ဆန်းစစ်ပါ",
      desc: "သင်၏ လုပ်ငန်းစိတ်ကူးကို ရေးသားပါ။ ကျွန်ုပ်တို့၏ အေဂျင့်မှ စိတ်ကူး၏ ရှင်းလင်းမှု၊ အကောင်အထည်ဖော်နိုင်မှုနှင့် ထူးခြားမှုတို့ကို ဆန်းစစ်ပေးပါမည်။",
      placeholder: "ဥပမာ - ရန်ကုန်မြို့တွင်း လစဉ်ကြေးစနစ်သုံး ကားအငှားဝန်ဆောင်မှုလုပ်ငန်း...",
      buttonValidate: "စိတ်ကူးကို ဆန်းစစ်မည်",
      buttonAutoRefine: "AI ဖြင့် အလိုအလျောက်မွမ်းမံမည်",
      scoreTitle: "ဆန်းစစ်မှုရမှတ်များ",
      feedbackTitle: "အပြုသဘောဆောင်သော အကြံပြုချက်",
      questionsTitle: "ထပ်မံလိုအပ်သော အချက်အလက်များ",
      buttonProceed: "နောက်တစ်ဆင့် (လုပ်ငန်းနောက်ခံ မေးခွန်းများ)"
    },
    businessInfo: {
      badge: "အဆင့် ၂ - လုပ်ငန်းနောက်ခံ",
      title: "လုပ်ငန်းနောက်ခံ မေးခွန်းများ",
      desc: "အစီအစဉ်ကို စိတ်ကြိုက်ပြင်ဆင်နိုင်ရန် ပစ်မှတ်ဈေးကွက်၊ ဘတ်ဂျက်၊ တည်နေရာနှင့် အခြားအချက်အလက်များကို ဖြည့်စွက်ပေးပါ။",
      labelTitle: "စိတ်ကူးခေါင်းစဉ် / အမည်",
      labelLocation: "လုပ်ငန်းတည်နေရာ",
      labelBudget: "စတင်ရန် ဘတ်ဂျက် (ကျပ်ငွေ MMK)",
      labelCustomers: "အဓိက ပစ်မှတ်သုံးစွဲသူများ",
      labelCategory: "လုပ်ငန်းအမျိုးအစား",
      labelExperience: "သင်၏ အတွေ့အကြုံအဆင့်",
      labelGoal: "အဓိက ရည်မှန်းချက်",
      labelPainpoint: "သုံးစွဲသူများ ကြုံတွေ့နေရသော အဓိကအခက်အခဲ",
      labelTimeline: "စတင်မည့် အချိန်ဇယား",
      labelRevenue: "ဝင်ငွေရရှိမည့် ပုံစံ",
      buttonSave: "သိမ်းဆည်းပြီး လုပ်ငန်းစီမံချက်ဖန်တီးမည်",
      generating: "လုပ်ငန်းစီမံချက် ဖန်တီးနေသည်..."
    },
    dashboard: {
      title: "လုပ်ငန်းစီမံချက် စတူဒီယို",
      subtitle: "သင်၏ စတင်ရန် အသင့်ဖြစ်နေသော လုပ်ငန်းစီမံချက်အသေးစိတ်ကို ကြည့်ရှုလေ့လာပါ။",
      tabOverview: "ခြုံငုံသုံးသပ်ချက်",
      tabMarket: "ဈေးကွက်ဆန်းစစ်ချက်",
      tabFinance: "ဘဏ္ဍာရေးပုံစံ",
      tabBrand: "အမှတ်တံဆိပ်ပုံဖော်မှု",
      tabDigital: "ဒီဂျစ်တယ်တည်ရှိမှု",
      tabGrowth: "တိုးတက်မှုစီမံချက်",
      tabInvestor: "ရင်းနှီးမြှုပ်နှံသူထံ တင်ပြရန်",
      buttonNew: "စိတ်ကူးအသစ်ဖန်တီးမည်",
      buttonRefine: "စီမံချက်ကို ပြန်လည်မွမ်းမံမည်",
      costSummary: "ဘဏ္ဍာရေးခြုံငုံသုံးသပ်ချက်",
      initialCost: "စတင်မည့် ကနဦးကုန်ကျစရိတ်",
      breakeven: "ကာလအပိုင်းအခြား",
      monthlyRevenue: "ခန့်မှန်းလစဉ်ဝင်ငွေ",
      months: "လ",
      differentiators: "အဓိက ထူးခြားချက်များ",
      audience: "ပစ်မှတ်သုံးစွဲသူများ",
      concept: "မွမ်းမံထားသော စိတ်ကူး"
    }
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'my') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'my') {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'my' : 'en';
    setLanguage(nextLang);
  };

  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let current = translations[language];
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return keyPath;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
