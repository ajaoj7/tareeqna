import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, Camera, AlertTriangle, CheckCircle2, Users, 
  Building2, Heart, TrendingUp, Info, ChevronLeft, 
  Plus, Wallet, Sparkles, Loader2, X, Phone, ShieldCheck, Trophy, 
  Home, Star, Building, Map as MapIcon, Search,
  Lock, ShieldAlert, Share2, Globe, Send, ExternalLink,
  UserCheck, User, CheckCircle, ArrowRight, AlertCircle, Smartphone, HardHat, Mail, Facebook, Twitter, Instagram
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, doc, 
  updateDoc, query, getDocs, getDoc, orderBy, limit 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';

// --- إعدادات Firebase المعتمدة ---
const firebaseConfig = {
  apiKey: "AIzaSyCyuIFbQQCzkeaiZiuscS-WfY1Ajs2wAVU",
  authDomain: "tareeqna-57b74.firebaseapp.com",
  projectId: "tareeqna-57b74",
  storageBucket: "tareeqna-57b74.firebasestorage.app",
  messagingSenderId: "797722330698",
  appId: "1:797722330698:web:6488a3f1a5b1b3c4e688b3",
  measurementId: "G-Q3RRP2VHES"
};

const appId = "tareeqna_production_final_v1";

let app, auth, db;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) { console.warn("Firebase wait..."); }

const App = () => {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    const injectResource = (tag, id, attr) => {
      if (!document.getElementById(id)) {
        const el = document.createElement(tag); el.id = id;
        Object.assign(el, attr); document.head.appendChild(el);
      }
    };
    injectResource('script', 'tailwind-cdn', { src: 'https://cdn.tailwindcss.com' });
    injectResource('link', 'cairo-font', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap' });
  }, []);

  useEffect(() => {
    const safetyTimeout = setTimeout(() => loading && setLoading(false), 5000);
    if (!auth) return setLoading(false);
    const unsub = onAuthStateChanged(auth, async (u) => { 
      if (!u) try { await signInAnonymously(auth); } catch(e) {}
      setUser(u); setLoading(false); clearTimeout(safetyTimeout);
    });
    return () => unsub();
  }, [loading]);

  useEffect(() => {
    if (!user || !db) return;
    const unsubR = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'reports'), (snap) => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });
    const unsubD = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'donations'), (snap) => {
      setDonations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubR(); unsubD(); };
  }, [user]);

  const sponsors = useMemo(() => [
    { id: 'sp1', name: 'البنك العربي', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=AB', repairs: 52, color: 'bg-red-600' },
    { id: 'sp2', name: 'زين الأردن', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Zain', repairs: 41, color: 'bg-black' },
    { id: 'sp3', name: 'أورنج الأردن', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Or', repairs: 35, color: 'bg-orange-500' },
    { id: 'sp4', name: 'مجموعة المناصير', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=MA', repairs: 28, color: 'bg-green-800' },
    { id: 'sp5', name: 'الملكية الأردنية', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=RJ', repairs: 22, color: 'bg-slate-900' }
  ], []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 rtl text-right" style={{ fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[60] p-3 md:p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0" onClick={() => setView('landing')}>
          <div className="bg-green-600 p-2 md:p-2.5 rounded-xl md:rounded-2xl text-white shadow-lg group-hover:rotate-6 transition-all">
            <TrendingUp size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
          </div>
          {/* تم استبدال الـ SVG بالنص العادي المنسق لضمان الظهور بجانب الأيقونة */}
          <div className="flex flex-col leading-none select-none">
            <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter italic whitespace-nowrap leading-none" style={{ fontFamily: "'Cairo', sans-serif" }}>
              طريق<span className="text-green-600">نا</span>
            </h1>
            <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Jordan Road Guard</p>
          </div>
        </div>
        <button onClick={() => setView('leaderboard')} className="p-2 md:p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 active:scale-95 transition-all"><Trophy size={20}/></button>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6">
        {view === 'landing' && <LandingView setView={setView} reports={reports} sponsors={sponsors} />}
        {view === 'roads' && <ListView title="بلاغات الشوارع" items={reports} onDonate={(r) => { setSelectedItem({item: r, type: 'road'}); setShowDonateModal(true); }} onInfo={(r) => { setSelectedItem(r); setShowInfoModal(true); }} />}
        {view === 'stadiums' && <ListView title="مشاريع الملاعب" items={[]} isStadium onDonate={() => {}} onInfo={() => {}} />}
        {view === 'report' && <ReportView onComplete={() => setView('landing')} user={user} />}
        {view === 'leaderboard' && <LeaderboardView donations={donations} onBack={() => setView('landing')} />}
        {view === 'partner-portal' && <PartnerPortalView onBack={() => setView('landing')} />}
        {view === 'donate' && <DonateUnifiedView reports={reports} onDonate={(item, type) => { setSelectedItem({item, type}); setShowDonateModal(true); }} onInfo={(item) => { setSelectedItem(item); setShowInfoModal(true); }} />}
      </main>

      <Footer setView={setView} />

      {/* Floating Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3rem] p-2 md:p-3 flex justify-around items-center z-[70] shadow-2xl border border-white/10">
        <NavBtn icon={<Home />} label="الرئيسية" active={view === 'landing'} onClick={() => setView('landing')} />
        <NavBtn icon={<MapPin />} label="الشوارع" active={view === 'roads'} onClick={() => setView('roads')} />
        <div className="relative">
          <button onClick={() => setView('report')} className="bg-green-600 text-white p-4 md:p-5 rounded-[1.8rem] md:rounded-[2.2rem] -mt-12 md:-mt-16 shadow-2xl shadow-green-900 border-[4px] md:border-[6px] border-[#F8FAFC] active:scale-90 hover:scale-105 transition-all group">
            <Plus size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        <NavBtn icon={<Building2 />} label="الملاعب" active={view === 'stadiums'} onClick={() => setView('stadiums')} />
        <NavBtn icon={<Wallet />} label="تبرع" active={view === 'donate'} onClick={() => setView('donate')} />
      </nav>

      {showDonateModal && <DonationPopup item={selectedItem} onClose={() => setShowDonateModal(false)} onConfirm={async (d) => {
        try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'donations'), {...d, createdAt: new Date().toISOString()});
          if (d.type === 'road') {
            const ref = doc(db, 'artifacts', appId, 'public', 'data', 'reports', d.itemId);
            const r = reports.find(x => x.id === d.itemId);
            await updateDoc(ref, { collected: (Number(r.collected)||0) + Number(d.amount) });
          }
          setShowDonateModal(false);
        } catch(e) { console.error("Database error"); }
      }} />}
      {showInfoModal && <InfoPopup item={selectedItem} onClose={() => setShowInfoModal(false)} />}
    </div>
  );
};

// --- Landing View ---
const LandingView = ({ setView, reports, sponsors }) => {
  const categories = useMemo(() => ({
    urgent: reports.filter(r => r.severity >= 8 && (r.collected < (r.goal || 100))).slice(0, 4),
    recent: reports.slice(0, 4),
    completed: reports.filter(r => r.collected >= (r.goal || 100)).slice(0, 4)
  }), [reports]);

  return (
    <div className="py-6 md:py-10 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR LEFT */}
        <aside className="w-full lg:w-72 space-y-6 lg:order-1 order-2">
           <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm sticky top-28">
              <div className="space-y-1 mb-8 border-r-4 border-green-600 pr-4 text-right">
                 <h3 className="text-xl font-black text-slate-800 leading-none">شركاء الإعمار</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">Corporate Partnerships</p>
              </div>
              <div className="space-y-6">
                 {sponsors.map(s => (
                   <div key={s.id} className="flex items-center gap-4 group cursor-pointer text-right transition-transform hover:-translate-x-1 justify-start">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 flex items-center justify-center p-2 border border-slate-50 transition-all shrink-0"><img src={s.logo} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" alt={s.name} /></div>
                      <div className="flex-1 min-w-0">
                         <p className="font-black text-xs md:text-sm text-slate-800 truncate mb-1">{s.name}</p>
                         <p className="text-[9px] md:text-[10px] font-bold text-green-600 leading-none flex items-center gap-1"><CheckCircle2 size={10}/> {s.repairs} مشروع منجز</p>
                      </div>
                   </div>
                 ))}
              </div>
              <button onClick={() => setView('partner-portal')} className="w-full mt-10 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-xl active:scale-95 leading-none"><Lock size={12}/> بوابة الشركاء</button>
           </div>
        </aside>

        {/* MAIN FEED */}
        <div className="flex-1 space-y-12 md:space-y-20 lg:order-2 order-1 text-right">
          <section className="bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/5 text-right">
            <div className="relative z-10 max-w-2xl space-y-6 text-right leading-none">
              <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 text-[9px] md:text-xs font-black uppercase tracking-widest leading-none">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                 رؤية الأردن الرقمية 2030
              </div>
              <h2 className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tighter italic text-right leading-none">معاً نعمر <br/><span className="text-green-500 underline decoration-green-900/50 leading-none">شوارع الوطن</span></h2>
              <p className="text-slate-400 text-sm md:text-xl font-medium leading-relaxed max-w-lg italic text-right leading-relaxed">المنصة الذكية الموثقة لإصلاح وتجميل البنية التحتية بالتعاون مع القطاع الخاص.</p>
              <div className="flex flex-wrap gap-3 pt-4 justify-end leading-none">
                 <button onClick={() => setView('report')} className="bg-white text-slate-900 px-8 py-3 md:px-12 md:py-5 rounded-2xl font-black text-base md:text-xl shadow-xl hover:bg-green-50 active:scale-95 transition-all">بلغ عن عطل</button>
                 <button onClick={() => setView('roads')} className="bg-slate-800/50 text-white border border-slate-700 px-8 py-3 md:px-12 md:py-5 rounded-2xl font-black text-base md:text-xl hover:bg-slate-800 transition-all">تصفح المشاريع</button>
              </div>
            </div>
            <div className="absolute -bottom-20 -left-20 w-64 md:w-96 h-64 md:h-96 bg-green-600 rounded-full blur-[100px] md:blur-[140px] opacity-20 animate-pulse"></div>
          </section>

          <HomeSection title="عاجل: حفر شديدة الخطورة" items={categories.urgent} setView={setView} icon={<ShieldAlert className="text-red-500 animate-pulse"/>} />
          <HomeSection title="أحدث البلاغات الميدانية" items={categories.recent} setView={setView} icon={<Sparkles className="text-blue-500"/>} />
          <HomeSection title="قصص نجاح: تم التصليح" items={categories.completed} setView={setView} icon={<CheckCircle2 className="text-green-500"/>} isSuccess />
        </div>
      </div>
    </div>
  );
};

const HomeSection = ({ title, items, setView, icon, isSuccess }) => (
  <div className="space-y-6 px-2 text-right">
    <div className="flex justify-between items-center border-r-4 border-slate-900 pr-4 leading-none text-right">
       <div className="flex items-center gap-3 justify-start text-right">
          <div className="shrink-0 leading-none">{icon}</div>
          <h3 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight leading-none">{title}</h3>
       </div>
       <button onClick={() => setView('roads')} className="text-slate-400 font-bold text-xs hover:text-green-600 transition-colors leading-none">الكل</button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-right">
      {items.length > 0 ? items.map(item => (
        <div key={item.id} onClick={() => setView('roads')} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full text-right leading-none">
           <div className="relative h-40 md:h-48 overflow-hidden rounded-2xl mb-4 leading-none">
              <img src={item.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Repair" />
              {isSuccess && <div className="absolute inset-0 bg-green-600/30 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"><div className="bg-white text-green-600 p-3 rounded-full shadow-2xl leading-none"><CheckCircle2 size={32}/></div></div>}
           </div>
           <div className="space-y-2 flex-1 text-right leading-none">
              <h4 className="font-black text-slate-800 text-sm md:text-lg truncate leading-none italic mb-2 text-right">{item.location}</h4>
              <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] md:text-xs justify-end leading-none">
                 {item.streetType || "شارع فرعي"} <MapPin size={12} className="text-green-600 leading-none"/>
              </div>
           </div>
           <div className="pt-4 border-t mt-3 leading-none"><div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden leading-none"><div className={`${isSuccess ? 'bg-green-500' : 'bg-amber-500'} h-full rounded-full transition-all leading-none`} style={{width: `${Math.min(((item.collected||0)/(item.goal||100))*100, 100)}%`}}></div></div></div>
        </div>
      )) : <p className="col-span-full text-center py-10 text-slate-300 font-bold italic border-2 border-dashed border-slate-50 rounded-[2rem] leading-none text-right">بانتظار تحديث البيانات الميدانية...</p>}
    </div>
  </div>
);

// --- Report View ---
const ReportView = ({ onComplete, user }) => {
  const [img, setImg] = useState(null);
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const compressImage = (base64) => {
    return new Promise((resolve) => {
      const img = new Image(); img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000; let width = img.width; let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const handleSubmission = async () => {
    if (!location.trim()) return setError("يرجى كتابة عنوان الشارع بدقة.");
    if (!img) return setError("يجب إرفاق صورة للضرر.");
    
    setSubmitting(true); setError(null);

    const timer = setTimeout(() => {
        if (submitting) { setSubmitting(false); setError("بطء في الاتصال."); }
    }, 20000);

    try {
      const compressedImg = await compressImage(img);
      const streetType = location.includes("مطار") ? "طريق سيادي" : "شارع حيوي";

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reports'), {
        userId: user?.uid || "guest",
        img: compressedImg,
        location,
        streetType,
        severity: 7, 
        goal: 250, 
        collected: 0,
        createdAt: new Date().toISOString(),
        status: 'verified_original'
      });
      
      clearTimeout(timer);
      onComplete();
    } catch (e) {
      clearTimeout(timer);
      setError("حدث خطأ أثناء الإرسال. تأكد من الإنترنت.");
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-8 animate-in slide-in-from-bottom-12 max-w-4xl mx-auto text-right leading-none">
      <div className="flex items-center justify-between"><h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none text-right">تبليغ جديد</h2><button onClick={onComplete} className="p-2 md:p-3 bg-white rounded-full text-slate-400 border border-slate-100 shadow-sm leading-none"><X/></button></div>
      
      <div className="bg-white p-8 md:p-10 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden cursor-pointer group hover:border-green-500 shadow-inner text-center transition-all leading-none" onClick={() => fileInputRef.current.click()}>
        {img ? <img src={img} className="absolute inset-0 w-full h-full object-cover leading-none" alt="Selected" /> : 
          <div className="text-center space-y-6 animate-in zoom-in leading-none">
             <div className="p-8 bg-slate-50 text-slate-300 rounded-[2.5rem] group-hover:bg-green-50 group-hover:text-green-500 transition-all mx-auto w-fit shadow-inner leading-none"><Camera size={60} className="leading-none"/></div>
             <div className="leading-none"><p className="text-2xl font-black text-slate-700 leading-none italic uppercase text-center leading-none">إرفاق صورة</p><p className="text-sm font-bold text-slate-400 mt-4 max-w-xs mx-auto italic leading-none text-center leading-none">اضغط هنا لفتح الكاميرا أو الاستوديو.</p></div>
          </div>
        }
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => {
          const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = () => setImg(r.result); r.readAsDataURL(f); }
        }} />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 relative text-right leading-none">
         <div className="space-y-4 leading-none text-right">
            <label className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 leading-none justify-end text-right ${error ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>
               العنوان <ShieldCheck size={14} className={error ? 'text-red-600' : 'text-indigo-600'}/>
            </label>
            <div className="relative text-right">
              <MapPin className={`absolute right-6 top-1/2 -translate-y-1/2 transition-colors leading-none ${error ? 'text-red-600' : 'text-green-600'}`} size={24}/>
              <input 
                placeholder="اسم الشارع أو المنطقة..." 
                className={`w-full p-6 md:p-8 pr-14 md:pr-16 bg-slate-50 border-4 rounded-[2rem] font-black outline-none transition-all text-xl md:text-2xl shadow-inner text-right leading-none ${error ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-green-600 focus:bg-white'}`} 
                value={location} 
                onChange={e => { setLocation(e.target.value); if(e.target.value.trim()) setError(null); }}
              />
            </div>
            {error && (
              <div className="flex items-start gap-3 bg-red-100 text-red-600 p-5 rounded-[1.8rem] border-2 border-red-200 animate-in slide-in-from-top-4 text-right leading-none text-right">
                <AlertCircle size={24} className="shrink-0 mt-1 leading-none text-right" />
                <p className="font-black text-sm md:text-lg leading-snug text-right leading-none text-right">{error}</p>
              </div>
            )}
         </div>
      </div>

      <button onClick={handleSubmission} disabled={submitting} className="w-full bg-slate-900 text-white py-6 md:py-8 rounded-[2rem] font-black text-2xl md:text-4xl shadow-2xl active:scale-95 disabled:bg-slate-400 transition-all flex items-center justify-center gap-4 group leading-none text-center">
        {submitting ? <Loader2 className="animate-spin" size={32}/> : <>نشر البلاغ <Send size={28} className="rotate-180 group-hover:rotate-0 transition-transform leading-none"/></>}
      </button>
    </div>
  );
};

const ListView = ({ title, items, isStadium }) => (
  <div className="py-8 md:py-12 space-y-10 animate-in slide-in-from-right duration-700 text-right leading-none">
     <div className="px-2 border-r-8 border-slate-900 pr-4 md:pr-6 text-right leading-none">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase italic text-right leading-none">{title}</h2>
        <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-2 text-right leading-none">Verified Infrastructure Database</p>
     </div>
     <div className="grid gap-8 leading-none text-right">
        {items.length > 0 ? items.map(item => (
           <DetailedCard key={item.id} item={item} />
        )) : (
          <div className="py-20 md:py-32 text-center space-y-8 bg-white rounded-[3rem] md:rounded-[5rem] border-2 border-dashed border-slate-100 shadow-inner flex flex-col items-center leading-none text-right">
             <div className="p-8 bg-slate-50 rounded-full text-slate-200 animate-pulse leading-none text-right"><Building2 size={100} className="leading-none text-right"/></div>
             <div className="space-y-4 text-center leading-none text-right"><p className="text-2xl md:text-3xl font-black text-slate-300 tracking-tighter uppercase leading-none italic text-center leading-none text-right">{isStadium ? 'لا توجد تطويرات للملاعب حالياً' : 'لا يوجد مشاريع نشطة'}</p><p className="text-slate-400 font-bold text-xs md:text-sm max-w-sm mx-auto leading-relaxed italic text-center leading-none text-right">سيتم تحديث القائمة فور توفر تقارير ميدانية معتمدة من اللجنة الفنية للمنصة.</p></div>
          </div>
        )}
     </div>
  </div>
);

const DetailedCard = ({ item }) => (
  <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[4.5rem] border border-slate-100 shadow-sm space-y-8 group hover:shadow-2xl transition-all duration-700 text-right leading-none text-right text-right text-right">
     <div className="flex flex-col lg:flex-row gap-8 md:gap-12 leading-none text-right text-right text-right text-right">
        <div className="relative w-full lg:w-80 h-64 md:h-80 flex-shrink-0 overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] shadow-inner leading-none text-right text-right text-right text-right">
           <img src={item.img} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000 leading-none text-right text-right text-right" alt="Hole" />
           <div className={`absolute top-4 right-4 text-white text-[9px] md:text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl ring-2 md:ring-4 ring-white uppercase animate-pulse leading-none text-right text-right ${item.severity >= 8 ? 'bg-red-600' : 'bg-green-600'}`}> {item.severity >= 8 ? 'خطر جداً' : 'أولوية'} </div>
        </div>
        <div className="flex-1 space-y-6 md:space-y-8 text-right flex flex-col justify-center leading-none text-right text-right text-right text-right text-right">
           <div className="flex justify-between items-start leading-none w-full text-right text-right text-right text-right text-right text-right text-right"><h4 className="font-black text-3xl md:text-5xl text-slate-800 tracking-tighter italic text-right shrink-0 leading-none text-right text-right text-right">إصلاح وتعبيد</h4><button className="p-3 md:p-4 bg-indigo-50 text-indigo-600 rounded-xl leading-none text-right text-right text-right text-right text-right text-right text-right"><Info size={24} className="leading-none text-right text-right text-right text-right"/></button></div>
           <p className="text-slate-400 font-bold text-xl md:text-2xl flex items-center gap-3 justify-end leading-none text-right italic leading-none text-right text-right text-right text-right text-right"><MapPin size={24} className="text-green-600 leading-none text-right text-right text-right"/> {item.location}</p>
           <div className="flex flex-wrap gap-2 justify-end leading-none text-right text-right text-right text-right text-right text-right"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black italic text-right leading-none text-right text-right text-right text-right">{item.streetType || "شارع"}</span></div>
           <div className="pt-6 space-y-4 text-right leading-none text-right text-right text-right text-right text-right">
              <div className="flex justify-between text-[10px] md:text-sm font-black uppercase tracking-widest text-slate-500 leading-none text-right text-right text-right text-right text-right text-right text-right"><span className="text-right text-right text-right text-right text-right">المساهمات: <span className="text-slate-900 text-xl md:text-2xl leading-none text-right text-right text-right text-right text-right">{item.collected || 0} د.أ</span></span><span className="text-right text-right text-right text-right text-right">الهدف الوطني: {item.goal || 150} د.أ</span></div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner p-1 leading-none text-right text-right text-right text-right text-right text-right text-right text-right text-right"><div className="bg-gradient-to-l from-green-500 to-green-700 h-full rounded-full transition-all duration-1000 leading-none text-right text-right text-right text-right text-right" style={{width: `${Math.min(((item.collected||0)/(item.goal||100))*100, 100)}%`}}></div></div>
           </div>
        </div>
     </div>
     <button className="w-full bg-amber-500 text-white py-6 md:py-8 rounded-[1.8rem] md:rounded-[2.5rem] font-black text-2xl md:text-4xl shadow-xl hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group leading-none uppercase italic text-center text-right leading-none">
       <Heart fill="currentColor" size={28} className="group-hover:scale-125 transition-transform leading-none" /> ساهم في الإعمار
     </button>
  </div>
);

const NavBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all active:scale-90 leading-none shrink-0 ${active ? 'text-green-500' : 'text-slate-500'}`}>
    <div className={`p-2 md:p-3.5 rounded-xl md:rounded-2xl transition-all shrink-0 ${active ? 'bg-green-500/10 shadow-inner' : ''} text-right text-right text-right`}>
       {React.cloneElement(icon, { size: 20, className: "md:w-[26px] md:h-[26px] text-right text-right", strokeWidth: active ? 3 : 2.5 })}
    </div>
    <span className={`text-[7px] md:text-[10px] font-black uppercase tracking-widest transition-opacity leading-none shrink-0 ${active ? 'opacity-100' : 'opacity-40'} text-right text-right text-right`}>{label}</span>
  </button>
);

const Footer = ({ setView }) => (
  <footer className="bg-white border-t border-slate-100 pt-16 pb-32 mt-20">
    <div className="max-w-7xl mx-auto px-6 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-right">
        
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-black text-slate-900">اتصل بنا</h4>
            <p className="text-xs text-slate-400 font-bold uppercase italic">Contact Us</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-start group cursor-pointer">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-all"><Phone size={18}/></div>
              <p className="font-black text-slate-600 text-sm">0656 66970</p>
            </div>
            <div className="flex items-center gap-3 justify-start group cursor-pointer">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all"><Mail size={18}/></div>
              <p className="font-black text-slate-600 text-sm">sales@mcc-jo.com</p>
            </div>
            <div className="flex items-start gap-3 justify-start group cursor-pointer text-right">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all mt-1"><MapIcon size={18}/></div>
              <div className="space-y-1">
                <p className="font-black text-slate-600 text-sm leading-none">عمان، الجاردنز، شارع وصفي التل</p>
                <p className="text-[10px] text-slate-400 font-bold leading-tight">Mosa Center, No:78</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xl font-black text-slate-900">بوابتي الرقمية</h4>
          <ul className="space-y-3">
            {['لوحة التحكم', 'بلاغاتي الميدانية', 'سجل مساهماتي', 'الملف الشخصي'].map((item, i) => (
              <li key={i} className="group flex items-center gap-3 cursor-pointer justify-start">
                <div className="w-1.5 h-1.5 bg-slate-200 rounded-full group-hover:bg-green-500 transition-all shrink-0"></div>
                <span className="text-sm font-black text-slate-500 group-hover:text-slate-900 transition-colors">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-xl font-black text-slate-900">حول المنصة</h4>
          <ul className="space-y-3 text-right">
            <li onClick={() => setView('partner-portal')} className="flex items-center gap-3 justify-start cursor-pointer"><div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div><span className="text-sm font-black text-slate-500">عن طريقنا</span></li>
            <li className="flex items-center gap-3 justify-start cursor-pointer"><div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div><span className="text-sm font-black text-slate-500">سياسة الخصوصية</span></li>
          </ul>
          <div className="flex gap-4 pt-4 justify-start">
             {[Facebook, Twitter, Instagram].map((Icon, i) => (
               <button key={i} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Icon size={18} /></button>
             ))}
          </div>
        </div>

        <div>
           <div className="bg-green-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10 text-right">
                 <div className="flex items-center gap-3 mb-4 justify-start">
                    <ShieldCheck className="text-white animate-pulse shrink-0" size={28}/>
                    <p className="font-black text-sm uppercase italic">توثيق ذكي 100%</p>
                 </div>
                 <p className="text-xs text-green-50 leading-relaxed font-bold">جميع البلاغات تخضع لنظام التحقق من الموقع والصورة لضمان المصداقية وتوجيه الدعم لمستحقيه فعلياً.</p>
              </div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
           </div>
        </div>

      </div>
      <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">© 2024 Tareeqna Jordan | All Rights Reserved</p>
         <div className="flex items-center gap-2 opacity-30 grayscale pointer-events-none">
            <span className="text-[8px] font-black text-slate-900">Powered by</span>
            <TrendingUp size={12} className="text-green-600"/>
            <span className="text-[8px] font-black text-slate-900">Jordan AI Engine</span>
         </div>
      </div>
    </div>
  </footer>
);

const LoadingScreen = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-6 animate-in fade-in text-center px-10 leading-none text-right">
    <div className="relative leading-none text-right text-right">
      <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-green-100 border-t-green-600 rounded-full animate-spin leading-none text-right"></div>
      <TrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600 leading-none text-right" size={32} />
    </div>
    <div className="space-y-2 leading-none text-right text-right">
       <p className="text-xl md:text-2xl font-black text-slate-800 italic uppercase leading-none tracking-tighter text-right">طريق<span className="text-green-600 leading-none text-right">نا</span></p>
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none text-right text-right">المنصة الوطنية الأردنية</p>
    </div>
  </div>
);

const DonationPopup = ({ item, onClose, onConfirm }) => {
  const [amount, setAmount] = useState('10');
  const [name, setName] = useState('');
  const [anon, setAnon] = useState(false);
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[100] flex items-end md:items-center justify-center p-4 md:p-6 animate-in fade-in duration-300 leading-none text-right">
      <div className="bg-white rounded-t-[3rem] md:rounded-[4rem] w-full max-w-lg p-8 md:p-16 space-y-8 shadow-2xl animate-in slide-in-from-bottom-20 md:zoom-in-95 text-right leading-none text-right text-right text-right">
        <div className="flex justify-between items-center leading-none text-right w-full leading-none text-right text-right text-right text-right"><h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter italic uppercase text-right leading-none text-right text-right text-right text-right">ساهم في البناء</h3><button onClick={onClose} className="p-3 bg-slate-100 rounded-full shadow-sm active:scale-90 leading-none text-right text-right text-right text-right text-right"><X size={20} className="leading-none text-right text-right text-right text-right"/></button></div>
        <div className="bg-green-50 p-6 md:p-10 rounded-[2rem] border border-green-100 shadow-inner text-center leading-none text-right text-right text-right text-right"><p className="font-black text-2xl md:text-3xl leading-[1.1] tracking-tight italic text-center leading-none text-right text-right text-right text-right">{item.item.location}</p></div>
        <div className="space-y-4 md:space-y-6 leading-none text-right text-right text-right text-right text-right"><label className="text-xs font-black text-slate-400 mr-2 uppercase tracking-[0.3em] opacity-70 leading-none block italic text-right w-full leading-none text-right text-right text-right text-right">Contribution (JOD)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-8 md:p-10 bg-slate-50 border-2 border-transparent rounded-[2rem] md:rounded-[3rem] font-black text-center text-4xl md:text-6xl outline-none focus:border-green-600 focus:bg-white transition-all shadow-inner text-slate-900 italic leading-none text-right text-right text-right text-right" /></div>
        <div className="space-y-6 md:space-y-8 text-right leading-none text-right text-right text-right text-right text-right text-right text-right text-right"><input placeholder="الاسم الكامل" disabled={anon} className="w-full p-6 md:p-8 bg-white border-2 border-slate-100 rounded-[1.8rem] md:rounded-[2.5rem] font-black outline-none focus:border-green-600 disabled:bg-slate-50 transition-all text-xl md:text-2xl shadow-sm text-right leading-none text-right text-right text-right text-right text-right" value={name} onChange={e => setName(e.target.value)} /><label className="flex items-center gap-4 md:gap-6 cursor-pointer group justify-end leading-none text-right text-right text-right text-right text-right text-right text-right text-right"><span className="text-xl md:text-2xl font-black text-slate-500 group-hover:text-slate-800 transition-colors italic leading-none text-right text-right text-right text-right text-right text-right text-right text-right">التبرع بهوية مجهولة</span><input type="checkbox" className="hidden" checked={anon} onChange={e => setAnon(e.target.checked)} /><div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl border-4 flex items-center justify-center transition-all leading-none ${anon ? 'bg-green-600 border-green-600 shadow-xl' : 'bg-white border-slate-200'}`}>{anon && <CheckCircle2 size={24} className="text-white leading-none text-right text-right text-right" />}</div></label></div>
        <button onClick={() => onConfirm({ amount, donorName: name, anonymousName: anon, itemId: item.item.id, type: item.type })} className="w-full bg-amber-500 text-white py-8 md:py-10 rounded-[2rem] md:rounded-[3rem] font-black text-3xl md:text-4xl shadow-xl shadow-amber-200 active:scale-95 transition-all flex items-center justify-center gap-4 group leading-none italic uppercase text-center text-right leading-none text-right text-right text-right text-right text-right text-right text-right">تأكيد المساهمة <CheckCircle size={28} className="group-hover:scale-110 transition-transform leading-none text-right" /></button>
      </div>
    </div>
  );
};

const InfoPopup = ({ item, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in leading-none text-right text-right">
    <div className="bg-white rounded-[3rem] md:rounded-[6rem] w-full max-w-4xl p-8 md:p-20 space-y-10 shadow-2xl relative overflow-hidden animate-in zoom-in ring-1 ring-slate-100 text-right leading-none text-right text-right text-right">
      <button onClick={onClose} className="absolute top-6 right-6 md:top-12 md:right-12 p-4 bg-white/50 backdrop-blur-md rounded-full text-slate-800 z-20 border border-slate-200 shadow-xl active:scale-90 leading-none text-right text-right text-right"><X size={32} className="leading-none text-right text-right"/></button>
      <div className="relative group text-right leading-none text-right text-right">
        <img src={item.img} className="w-full h-[300px] md:h-[550px] rounded-[2.5rem] md:rounded-[5rem] object-cover shadow-2xl transition-transform duration-[3s] group-hover:scale-105 leading-none text-right text-right text-right" alt="Detail" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent rounded-[2.5rem] md:rounded-[5rem] leading-none text-right text-right"></div>
        <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 leading-none text-right text-right text-right text-right">
          <p className="text-slate-200 font-bold text-base md:text-lg mb-4 flex items-center gap-3 justify-end uppercase tracking-[0.3em] leading-none italic text-right leading-none text-right text-right text-right text-right text-right"><MapPin size={24} className="text-green-500 leading-none text-right text-right text-right"/> {item.location}</p>
          <h3 className="text-3xl md:text-6xl font-black text-white leading-tight tracking-tighter uppercase italic text-right leading-none text-right text-right text-right text-right text-right">التفاصيل الفنية</h3>
        </div>
      </div>
      <div className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4.5rem] border border-slate-100 shadow-inner space-y-8 text-right leading-relaxed text-right text-right text-right text-right">
         <div className="inline-flex items-center gap-3 bg-indigo-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-full font-black text-base md:text-lg shadow-xl leading-none italic text-right text-right leading-none text-right text-right text-right text-right"><ShieldCheck size={24} className="leading-none text-right text-right text-right"/> تقرير هندسي معتمد</div>
         <p className="text-slate-600 text-xl md:text-3xl leading-[1.6] font-medium tracking-tight text-right leading-relaxed italic text-right text-right text-right text-right text-right">يخضع هذا الموقع لرقابة مهندسي المساحة والتعبيد في أمانة عمان الكبرى لضمان جودة التعبيد لأكثر من 15 عاماً ومقاومة كافة الظروف الجوية القاسية.</p>
      </div>
    </div>
  </div>
);

const LeaderboardView = ({ donations, onBack }) => {
  const topDonors = useMemo(() => {
    const grouped = donations.reduce((acc, d) => {
      const name = d.anonymousName ? "فاعل خير" : (d.donorName || "مجهول");
      if (!acc[name]) acc[name] = { name, total: 0 };
      acc[name].total += Number(d.amount); return acc;
    }, {});
    return Object.values(grouped).sort((a,b) => b.total - a.total).slice(0, 10);
  }, [donations]);

  return (
    <div className="py-8 md:py-12 px-2 space-y-10 animate-in slide-in-from-left text-right leading-none text-right">
      <div className="flex items-center gap-4 md:gap-6 text-right justify-end text-right"><div className="text-right text-right text-right"><h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase text-right leading-none shrink-0 text-right text-right">لوحة الشرف</h2><p className="text-slate-400 font-bold text-[10px] md:text-sm uppercase tracking-[0.2em] mt-2 italic text-right leading-none text-right text-right">Elite National Contributors</p></div><button onClick={onBack} className="p-4 bg-white rounded-2xl border hover:bg-slate-50 active:scale-90 shadow-sm leading-none shrink-0 text-right"><ChevronLeft className="rotate-180 text-right" size={28}/></button></div>
      <div className="bg-white rounded-[2.5rem] md:rounded-[5rem] border border-slate-100 shadow-2xl overflow-hidden ring-1 ring-slate-100 text-right">
        {topDonors.map((d, i) => (
          <div key={i} className="p-8 md:p-14 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-amber-50/20 transition-all group text-right leading-none text-right">
            <p className="text-green-600 font-black text-3xl md:text-5xl tracking-tighter leading-none text-left shrink-0 text-left">{d.total} <span className="text-lg md:text-xl opacity-60 font-bold leading-none text-left text-left">د.أ</span></p>
            <div className="flex items-center gap-6 md:gap-10 text-right leading-none justify-end text-right">
               <div className="text-right leading-none text-right"><p className="font-black text-xl md:text-3xl text-slate-800 leading-none mb-2 text-right text-right text-right">{d.name}</p><div className="flex items-center gap-2 text-green-600 text-[10px] md:text-xs font-black uppercase tracking-widest leading-none text-right justify-end text-right"><UserCheck size={16} className="text-right"/> مساهم وطني موثق</div></div>
               <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center font-black text-2xl md:text-4xl shadow-lg border-4 text-right ${i === 0 ? 'bg-amber-500 text-white border-amber-200 shadow-amber-100' : 'bg-slate-50 text-slate-300'}`}>{i+1}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DonateUnifiedView = ({ reports, onDonate }) => (
  <div className="py-8 md:py-12 space-y-12 animate-in fade-in text-right leading-none text-right">
    <div className="bg-amber-50 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border-2 border-amber-100 flex flex-col md:flex-row items-center gap-8 shadow-inner relative overflow-hidden text-right leading-none text-right">
       <div className="space-y-4 md:space-y-6 relative z-10 text-right w-full leading-none order-2 md:order-1 text-right text-right">
         <h2 className="text-3xl md:text-4xl font-black text-amber-900 leading-none italic uppercase text-right w-full leading-none text-right text-right">صندوق الإعمار الرقمي</h2>
         <p className="text-amber-700 text-lg md:text-2xl font-bold opacity-80 leading-relaxed italic text-right leading-relaxed text-right text-right">تتبرعاتك تذهب مباشرة لصيانة شوارعنا وملاعبنا استعداداً للاستحقاقات الوطنية الكبرى. كل دينار يساهم في جعل وطننا أكثر أماناً وجمالاً.</p>
       </div>
       <div className="p-8 bg-white rounded-[2rem] shadow-xl relative z-10 leading-none order-1 md:order-2 text-right"><Wallet className="text-amber-600 md:w-16 md:h-16 text-right" size={50}/></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 text-right leading-none text-right text-right">
       {reports.length > 0 ? reports.map(r => (<div key={r.id} className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 shadow-sm space-y-6 group hover:shadow-xl transition-all leading-none text-right flex flex-col h-full text-right"><img src={r.img} className="w-full h-48 md:h-56 rounded-[2rem] md:rounded-[3rem] object-cover shadow-xl grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 text-right" alt="Repair" /><div className="space-y-6 text-right flex-1 flex flex-col justify-between leading-none text-right text-right"><h4 className="font-black text-2xl md:text-3xl truncate text-slate-800 italic leading-none text-right text-right text-right">{r.location}</h4><div className="flex justify-between items-center bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-inner text-right leading-none text-right text-right text-right text-right"><p className="text-green-600 font-black text-2xl md:text-4xl tracking-tighter leading-none text-right shrink-0 text-right text-right">{r.collected || 0} / {r.goal || 150} <span className="text-base md:text-lg opacity-40 font-black leading-none shrink-0 text-right text-right">د.أ</span></p><button onClick={() => onDonate(r, 'road')} className="bg-slate-900 text-white px-8 md:px-12 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl hover:bg-green-600 transition-all active:scale-95 leading-none italic uppercase transition-all shrink-0 text-center text-right text-right">تبرع</button></div></div></div>)) : <div className="col-span-full py-20 text-center text-slate-300 font-bold italic border-2 border-dashed border-slate-50 rounded-[2rem] text-right">لا توجد بلاغات نشطة حالياً.</div>}
    </div>
  </div>
);

const PartnerPortalView = ({ onBack }) => (
  <div className="py-8 md:py-12 space-y-10 animate-in fade-in text-right leading-none text-right text-right">
     <div className="flex items-center gap-6 leading-none text-right justify-end text-right text-right"><h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter italic uppercase text-right leading-none shrink-0 text-right text-right">بوابة الشركاء</h2><button onClick={onBack} className="p-4 bg-white rounded-2xl border hover:bg-slate-50 active:scale-90 shadow-sm transition-all leading-none shrink-0 text-right"><ChevronLeft className="rotate-180 text-right text-right" size={28}/></button></div>
     <div className="bg-slate-900 p-12 md:p-20 rounded-[3rem] border border-white/5 shadow-2xl text-center space-y-10 relative overflow-hidden ring-1 ring-white/10 text-right">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full blur-[140px] opacity-10 leading-none text-right text-right"></div>
        <div className="relative z-10 space-y-8 text-center leading-none text-right text-center text-center"><Lock className="mx-auto text-indigo-400 leading-none text-right text-right" size={60} /><h3 className="text-3xl md:text-5xl font-black text-white leading-none italic uppercase text-center text-center text-center">المؤسسات المعتمدة</h3><p className="text-slate-400 font-medium leading-relaxed max-w-xl mx-auto text-base md:text-xl italic opacity-80 text-center leading-relaxed italic text-center text-center">بوابة حصرياً لمسؤولي أمانة عمان الكبرى والبلديات لإدارة المشاريع ميدانياً ومتابعة الأثر.</p><div className="flex flex-col gap-5 max-w-sm mx-auto pt-10 text-center text-center text-center"><input type="password" placeholder="كود الدخول الموحد" className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] outline-none focus:border-indigo-500 text-center font-black text-white text-2xl md:text-3xl placeholder:text-slate-800 shadow-inner text-right leading-none transition-all text-center text-center" /><button className="bg-indigo-600 text-white py-6 md:py-8 rounded-[1.8rem] md:rounded-[2.5rem] font-black text-3xl md:text-4xl shadow-xl hover:bg-indigo-700 active:scale-95 leading-none transition-all uppercase text-center text-center">دخول</button></div></div>
     </div>
  </div>
);

export default App;
