import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  ShieldCheck, Eye, HeartHandshake,
  Lightbulb, Globe, Users,
  CheckCircle2, Network, Plane, UserCheck, Package, MapPin, PackageCheck
} from 'lucide-react';

const values = [
  { title: 'Trust First', icon: <ShieldCheck size={28} className="text-flyora-teal" /> },
  { title: 'Transparency', icon: <Eye size={28} className="text-blue-500" /> },
  { title: 'Safety', icon: <HeartHandshake size={28} className="text-emerald-500" /> },
  { title: 'Innovation', icon: <Lightbulb size={28} className="text-amber-500" /> },
  { title: 'Global Connectivity', icon: <Globe size={28} className="text-indigo-500" /> },
  { title: 'Community Collaboration', icon: <Users size={28} className="text-purple-500" /> },
];

const whyFlyora = [
  "Verified Global Network",
  "Modern Technology",
  "Escrow-Based Payments",
  "Secure Matching",
  "Real-Time Tracking",
  "Human-Centered Logistics"
];

const AboutUsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header />

      <main className="flex-1">

        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-flyora-navy">
          {/* Abstract background nodes simulation */}
          <div className="absolute inset-0 world-map-bg opacity-10 mix-blend-overlay" />
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-flyora-teal/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="container-flyora relative z-10 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-flyora-teal/20 border border-flyora-teal/30 text-flyora-teal-bright text-xs font-bold uppercase tracking-widest mb-6">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight max-w-5xl mx-auto">
              Building the Future of <br className="hidden md:block" />
              <span className="text-gradient-teal">Community-Powered Shipping</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto font-medium">
              At Flyora, every journey creates an opportunity to help someone else.
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-10 bg-white" style={{ borderTopLeftRadius: '100%', borderTopRightRadius: '100%' }} />
        </section>

        {/* ─── Our Story ────────────────────────────────────────────────── */}
        <section className="py-16 lg:py-24 bg-white relative">
          <div className="container-flyora">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                  <img src="/images/about_team_custom.png" alt="Flyora Team Discussing" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-flyora-navy/10 mix-blend-overlay" />
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-black text-flyora-navy mb-6">Our Story</h2>
                <p className="text-lg text-flyora-gray-600 leading-relaxed mb-6">
                  Millions of travelers fly every day with unused luggage capacity, while individuals and businesses pay expensive courier fees to ship items internationally.
                </p>
                <p className="text-lg text-flyora-gray-600 leading-relaxed">
                  Flyora bridges this gap by securely connecting verified travelers with senders, creating a smarter, more sustainable global delivery ecosystem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Mission & Vision ─────────────────────────────────────────── */}
        <section className="py-16 lg:py-24 bg-flyora-gray-50">
          <div className="container-flyora">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

              <div className="bg-white rounded-3xl p-10 lg:p-12 border border-flyora-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-flyora-teal/10 flex items-center justify-center mb-8">
                  <Network size={32} className="text-flyora-teal" />
                </div>
                <h3 className="text-3xl font-black text-flyora-navy mb-4">Our Mission</h3>
                <p className="text-xl text-flyora-gray-600 leading-relaxed">
                  To make international shipping faster, more affordable, and community-driven through trusted travelers.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-10 lg:p-12 border border-flyora-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8">
                  <Plane size={32} className="text-blue-500" />
                </div>
                <h3 className="text-3xl font-black text-flyora-navy mb-4">Our Vision</h3>
                <p className="text-xl text-flyora-gray-600 leading-relaxed">
                  To become the world's most trusted peer-to-peer travel logistics platform where every flight creates value beyond transportation.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ─── Our Values ───────────────────────────────────────────────── */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container-flyora">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-flyora-navy mb-4">Our Values</h2>
              <p className="text-lg text-flyora-gray-600">The core principles that guide everything we build at Flyora.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-8 rounded-3xl bg-flyora-gray-50 border border-flyora-gray-100">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                    {val.icon}
                  </div>
                  <h4 className="text-xl font-bold text-flyora-navy">{val.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Why Flyora? ──────────────────────────────────────────────── */}
        <section className="py-12 lg:py-16 bg-flyora-navy relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/srv_hero_bg.png')] bg-cover opacity-10 mix-blend-overlay" />
          <div className="container-flyora relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              <div className="w-full lg:w-1/2">
                <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Why Flyora?</h2>
                <p className="text-lg text-white/70 leading-relaxed mb-8">
                  We are building a platform that puts people first. Experience a revolutionary way to ship globally while ensuring total security and trust.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  {whyFlyora.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 size={24} className="text-flyora-teal flex-shrink-0" />
                      <span className="text-white font-medium text-lg">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-[55%] relative h-[450px] lg:min-h-[500px] flex items-center justify-center mt-10 lg:mt-0 overflow-hidden sm:overflow-visible">
                <style>{`
                  @keyframes fly-path-1 {
                    0% { offset-distance: 0%; opacity: 0; transform: scale(0.65) rotate(0deg); }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { offset-distance: 100%; opacity: 0; transform: scale(0.8) rotate(0deg); }
                  }
                  @keyframes fly-path-2 {
                    0% { offset-distance: 0%; opacity: 0; transform: scale(0.8) rotate(0deg); }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { offset-distance: 100%; opacity: 0; transform: scale(0.6) rotate(0deg); }
                  }
                  @keyframes radar-pulse {
                    0% { transform: scale(0.5); opacity: 0.8; }
                    100% { transform: scale(2.5); opacity: 0; }
                  }
                  @keyframes dash-flow {
                    to {
                      stroke-dashoffset: -40;
                    }
                  }
                  @keyframes hologram-glow {
                    0%, 100% { opacity: 0.15; filter: drop-shadow(0 0 10px rgba(20, 184, 166, 0.2)); }
                    50% { opacity: 0.35; filter: drop-shadow(0 0 25px rgba(20, 184, 166, 0.4)); }
                  }
                `}</style>

                {/* Holographic Projection Background Glow */}
                <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.15),transparent_70%)] pointer-events-none" />

                {/* The Sci-Fi Hologram Board */}
                <div className="relative w-full max-w-[500px] h-[450px] rounded-[2.5rem] bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl p-6 overflow-hidden flex flex-col justify-between">
                  
                  {/* Hologram Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                  
                  {/* Header info */}
                  <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-flyora-teal animate-ping" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Global Route Matcher</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 font-mono">SYS-ACTIVE v1.02</span>
                  </div>

                  {/* Main SVG Map & Flights Layer */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <svg className="w-full h-full opacity-90" viewBox="0 0 500 400">
                      <defs>
                        {/* Gradients */}
                        <linearGradient id="gradient-teal" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0D9488" stopOpacity="0.1" />
                          <stop offset="50%" stopColor="#14B8A6" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.1" />
                        </linearGradient>
                        <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.1" />
                          <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>

                      {/* Tilted World Map Outline Silhouette */}
                      <path 
                        d="M50,150 Q100,140 120,130 T170,120 T220,150 T280,160 T350,130 T400,110 T450,120 M80,240 Q130,260 160,250 T200,230 T250,220 M280,250 Q320,290 350,280 T400,230 T430,220" 
                        fill="none" 
                        stroke="rgba(255, 255, 255, 0.05)" 
                        strokeWidth="2.5" 
                        className="animate-[hologram-glow_8s_ease-in-out_infinite]"
                      />

                      {/* Active Route 1 (USA to Europe) */}
                      <path 
                        id="route1"
                        d="M 90 140 Q 240 60 380 120" 
                        fill="none" 
                        stroke="url(#gradient-teal)" 
                        strokeWidth="2" 
                      />
                      <path 
                        d="M 90 140 Q 240 60 380 120" 
                        fill="none" 
                        stroke="#2DD4BF" 
                        strokeWidth="2" 
                        strokeDasharray="5, 15" 
                        style={{ animation: 'dash-flow 3s linear infinite' }}
                      />

                      {/* Active Route 2 (South America to Middle East) */}
                      <path 
                        id="route2"
                        d="M 120 240 C 220 220, 280 140, 390 180" 
                        fill="none" 
                        stroke="url(#gradient-blue)" 
                        strokeWidth="2" 
                      />
                      <path 
                        d="M 120 240 C 220 220, 280 140, 390 180" 
                        fill="none" 
                        stroke="#60A5FA" 
                        strokeWidth="2" 
                        strokeDasharray="5, 15" 
                        style={{ animation: 'dash-flow 4s linear infinite_reverse' }}
                      />

                      {/* City Hub Markers & Radar Pulses */}
                      {/* NYC */}
                      <circle cx="90" cy="140" r="3" fill="#2DD4BF" />
                      <circle cx="90" cy="140" r="10" fill="none" stroke="#2DD4BF" strokeWidth="1" className="origin-center" style={{ animation: 'radar-pulse 2s ease-out infinite' }} />
                      
                      {/* London */}
                      <circle cx="380" cy="120" r="3" fill="#2DD4BF" />
                      <circle cx="380" cy="120" r="10" fill="none" stroke="#2DD4BF" strokeWidth="1" className="origin-center" style={{ animation: 'radar-pulse 2s ease-out infinite', animationDelay: '0.7s' }} />

                      {/* São Paulo */}
                      <circle cx="120" cy="240" r="3" fill="#60A5FA" />
                      <circle cx="120" cy="240" r="10" fill="none" stroke="#60A5FA" strokeWidth="1" className="origin-center" style={{ animation: 'radar-pulse 2s ease-out infinite', animationDelay: '0.4s' }} />

                      {/* Dubai */}
                      <circle cx="390" cy="180" r="3" fill="#60A5FA" />
                      <circle cx="390" cy="180" r="10" fill="none" stroke="#60A5FA" strokeWidth="1" className="origin-center" style={{ animation: 'radar-pulse 2s ease-out infinite', animationDelay: '1.1s' }} />
                    </svg>

                    {/* Plane on Route 1 */}
                    <div 
                      className="absolute pointer-events-none"
                      style={{
                        offsetPath: "path('M 90 140 Q 240 60 380 120')",
                        offsetRotate: 'auto',
                        animation: 'fly-path-1 6s linear infinite',
                        width: '32px',
                        height: '32px',
                        left: '4px',
                        top: '4px'
                      }}
                    >
                      <Plane size={20} className="text-flyora-teal-light fill-flyora-teal-light transform rotate-90 drop-shadow-[0_0_8px_#14B8A6]" />
                    </div>

                    {/* Plane on Route 2 */}
                    <div 
                      className="absolute pointer-events-none"
                      style={{
                        offsetPath: "path('M 120 240 C 220 220, 280 140, 390 180')",
                        offsetRotate: 'auto',
                        animation: 'fly-path-2 8s linear infinite',
                        animationDelay: '2s',
                        width: '32px',
                        height: '32px',
                        left: '4px',
                        top: '4px'
                      }}
                    >
                      <Plane size={18} className="text-blue-400 fill-blue-400 transform rotate-90 drop-shadow-[0_0_8px_#60A5FA]" />
                    </div>
                  </div>

                  {/* Floating Glassmorphic Overlay Status Cards */}
                  
                  {/* Match Banner Top Left */}
                  <div className="absolute top-16 left-6 bg-slate-900/80 backdrop-blur-md border border-white/10 p-2.5 px-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-float">
                    <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-flyora-teal flex items-center justify-center">
                      <Package size={14} />
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Luggage Match</div>
                      <div className="text-[10px] font-black text-white">Rahul S. ➔ Paris (23kg)</div>
                    </div>
                  </div>

                  {/* Carbon Savings Bottom Left */}
                  <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-md border border-white/10 p-2.5 px-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-float" style={{ animationDelay: '1.5s' }}>
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck size={14} />
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Green Logistics</div>
                      <div className="text-[10px] font-black text-white">1.2 Tons CO₂ Saved</div>
                    </div>
                  </div>

                  {/* Traveler In-Transit Bottom Right */}
                  <div className="absolute bottom-12 right-6 bg-slate-900/80 backdrop-blur-md border border-white/10 p-2.5 px-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-float" style={{ animationDelay: '3s' }}>
                    <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Plane size={14} className="transform -rotate-45" />
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">In Transit</div>
                      <div className="text-[10px] font-black text-white">Airliner UA-449 Active</div>
                    </div>
                  </div>

                  {/* Live Feed Footer */}
                  <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Secure Escrow Network</span>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-black">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SECURE MATCH
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default AboutUsPage;
