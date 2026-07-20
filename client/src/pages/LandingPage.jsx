import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, Shield, Activity, Users, ArrowRight, ChevronDown,
  Stethoscope, Clock, Globe, Smartphone, Lock, Zap,
  CheckCircle, Star, Play
} from 'lucide-react';
import SloumaLogo from '../shared/SloumaLogo';
import { publicService } from '../services/publicService';
import { translations } from '../shared/translations';

function useOnScreen(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function FadeSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Counter({ end, suffix = '', duration = 2000 }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(id); }
      else setCount(start);
    }, 16);
    return () => clearInterval(id);
  }, [visible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function LandingPage({ onNavigateToLogin, onNavigateToSignup, language, setLanguage }) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const isRtl = language === 'tn' || language === 'ar';

  const t = (translations[language] || translations['fr']).landing;

  const featureIcons = [Activity, Shield, Users, Smartphone, Clock, Lock];
  const featureGradients = [
    'from-teal-400 to-teal-600',
    'from-emerald-400 to-emerald-600',
    'from-cyan-400 to-cyan-600',
    'from-sky-400 to-sky-600',
    'from-violet-400 to-violet-600',
    'from-rose-400 to-rose-500',
  ];
  const featureBgs = [
    'bg-teal-50', 'bg-emerald-50', 'bg-cyan-50',
    'bg-sky-50', 'bg-violet-50', 'bg-rose-50',
  ];

  const roleIcons = [Heart, Stethoscope, Users];
  const roleGradients = [
    'from-teal-500 to-teal-600',
    'from-emerald-500 to-emerald-600',
    'from-cyan-500 to-cyan-600',
  ];

  const stepIcons = [Users, Activity, Heart];

  const [stats, setStats] = useState({
    patients: 150,
    doctors: 50,
    satisfaction: 90.4,
    availability: "24/7"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await publicService.getStats();
        setStats({
          patients: (data.patientsCount || 0),
          doctors: (data.doctorsCount || 0),
          satisfaction: data.satisfactionRate,
          availability: data.availability || "24/7"
        });
      } catch (err) {
        console.error("Failed to fetch landing stats:", err);
      }
    };
    fetchStats();

    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>

      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrollY > 40
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/40 border-b border-slate-100'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-20">
          <div className="flex items-center gap-3">
            <SloumaLogo size={44} className="landing-pulse" />
            <span className="text-2xl font-black text-slate-800 tracking-tight">Slouma </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200"
              >
                <Globe className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-bold text-slate-700 hidden sm:inline">
                  {t.langLabel[language]}
                </span>
              </button>
              {showLangMenu && (
                <div className="absolute top-14 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 min-w-[170px] z-50 landing-fade-in">
                  {t.langOptions.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLanguage(l.code); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${language === l.code
                        ? 'bg-teal-50 text-teal-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={onNavigateToLogin}
                className="px-5 py-2.5 text-slate-600 hover:text-teal-600 font-bold text-sm transition-colors"
              >
                {t.signIn}
              </button>
              <button
                onClick={onNavigateToSignup}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all"
              >
                {t.signUp}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl landing-float" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl landing-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-teal-50 to-emerald-50 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="landing-slide-up">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-bold mb-8 border border-teal-100">
                <Zap className="w-4 h-4" />
                {t.heroBadge}
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight landing-slide-up" style={{ animationDelay: '150ms' }}>
              {t.heroTitle}
              <span className="block bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                {t.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-500 mt-8 max-w-lg mx-auto lg:mx-0 leading-relaxed landing-slide-up" style={{ animationDelay: '300ms' }}>
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 justify-center lg:justify-start landing-slide-up" style={{ animationDelay: '450ms' }}>
              <button
                onClick={onNavigateToSignup}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-1 transition-all"
              >
                {t.getStarted}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onNavigateToLogin}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-lg transition-all shadow-sm"
              >
                {t.signInHero}
              </button>
            </div>

            <div className="flex items-center gap-6 mt-12 justify-center lg:justify-start landing-slide-up" style={{ animationDelay: '600ms' }}>
              <div className="flex -space-x-2">
                {['bg-teal-400', 'bg-emerald-400', 'bg-cyan-400', 'bg-sky-400'].map((c, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                    {['A', 'S', 'M', 'K'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-slate-500 font-medium">{t.trustBadge}</p>
              </div>
            </div>
          </div>

          <div className="relative landing-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-6 lg:p-8 overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-rose-300" />
                <div className="w-3 h-3 rounded-full bg-amber-300" />
                <div className="w-3 h-3 rounded-full bg-emerald-300" />
                <div className="flex-1 h-7 bg-slate-100 rounded-lg ml-3" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Activity, color: 'from-teal-400 to-teal-500', val: '72', unit: 'bpm' },
                    { icon: Heart, color: 'from-rose-400 to-rose-500', val: '120/80', unit: 'mmHg' },
                    { icon: Shield, color: 'from-emerald-400 to-emerald-500', val: '98', unit: 'mg/dL' },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm landing-card-pop"
                      style={{ animationDelay: `${800 + i * 200}ms` }}
                    >
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                        <s.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xl font-black text-slate-800">{s.val}</p>
                      <p className="text-xs text-slate-400 font-medium">{s.unit}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm landing-card-pop" style={{ animationDelay: '1400ms' }}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-bold text-slate-700 text-sm">{t.weeklyOverview}</p>
                    <span className="text-xs text-teal-600 font-bold bg-teal-50 px-3 py-1 rounded-full">{t.healthy}</span>
                  </div>
                  <div className="flex items-end gap-2 h-24">
                    {[60, 80, 45, 90, 70, 85, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-lg bg-gradient-to-t from-teal-400 to-emerald-300 landing-bar-grow"
                        style={{ height: `${h}%`, animationDelay: `${1600 + i * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-5 text-white landing-card-pop" style={{ animationDelay: '2300ms' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{t.nextAppointment}</p>
                      <p className="text-teal-100 text-sm">{t.tomorrow}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 flex items-center gap-3 landing-card-pop" style={{ animationDelay: '2600ms' }}>
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{t.medicationReminder}</p>
                  <p className="text-[10px] text-slate-400">{t.justNow}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={scrollToFeatures} className="absolute bottom-10 left-1/2 -translate-x-1/2 landing-bounce">
          <ChevronDown className="w-8 h-8 text-slate-300" />
        </button>
      </section>

      <section id="features" className="py-32 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeSection className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-bold mb-6 border border-teal-100">
              {t.featuresBadge}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t.featuresTitle}</h2>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">{t.featuresSubtitle}</p>
          </FadeSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.map((f, i) => (
              <FadeSection key={i} delay={i * 100}>
                <div className="group h-full bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${featureGradients[i]} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    {React.createElement(featureIcons[i], { className: "w-7 h-7 text-white" })}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center text-white">
            {[
              { val: stats.patients, suffix: '+', label: t.statPatients },
              { val: stats.doctors, suffix: '+', label: t.statDoctors },
              { val: stats.satisfaction, suffix: '%', label: t.statSatisfaction },
              { val: stats.availability === "24/7" ? 24 : stats.availability, suffix: stats.availability === "24/7" ? '/7' : '', label: t.statAvailability },
            ].map((s, i) => (
              <FadeSection key={i} delay={i * 150}>
                <p className="text-4xl lg:text-5xl font-black mb-2">
                  <Counter end={s.val} suffix={s.suffix} />
                </p>
                <p className="text-teal-100 font-medium">{s.label}</p>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeSection className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold mb-6 border border-emerald-100">
              {t.howBadge}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t.howTitle}</h2>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">{t.howSubtitle}</p>
          </FadeSection>

          <div className="grid lg:grid-cols-3 gap-12 relative">
            <div className="hidden lg:block absolute top-24 left-[17%] right-[17%] h-0.5 bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-200" />

            {t.steps.map((s, i) => (
              <FadeSection key={i} delay={i * 200}>
                <div className="text-center relative">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-teal-500/20 mb-8 relative z-10">
                    {s.step}
                  </div>
                  <div className="w-12 h-12 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    {React.createElement(stepIcons[i], { className: "w-6 h-6 text-teal-600" })}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3">{s.title}</h3>
                  <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeSection className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{t.rolesTitle}</h2>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">{t.rolesSubtitle}</p>
          </FadeSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.roles.map((r, i) => (
              <FadeSection key={i} delay={i * 120}>
                <div className="group bg-white rounded-3xl border border-slate-100 p-7 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${roleGradients[i]} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    {React.createElement(roleIcons[i], { className: "w-8 h-8 text-white" })}
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">{r.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{r.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <FadeSection>
            <div className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 rounded-[2.5rem] p-12 lg:p-16 text-center text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

              <div className="relative z-10">
                <div className="mx-auto mb-8">
                  <SloumaLogo size={64} />
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">{t.ctaTitle}</h2>
                <p className="text-teal-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed">{t.ctaSubtitle}</p>
                <button
                  onClick={onNavigateToSignup}
                  id="cta-sign-up"
                  className="group inline-flex items-center gap-3 px-12 py-5 bg-white text-teal-700 rounded-2xl font-black text-lg shadow-2xl hover:shadow-white/30 hover:-translate-y-1 transition-all"
                >
                  {t.ctaBtn}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <SloumaLogo size={36} withText textClass="text-white font-bold text-lg" />
          <p className="text-sm text-center">{t.footerCopy}</p>
          <button
            onClick={onNavigateToLogin}
            className="text-teal-400 hover:text-teal-300 font-bold text-sm transition-colors"
          >
            {t.footerSignIn}
          </button>
        </div>
      </footer>
    </div>
  );
}
