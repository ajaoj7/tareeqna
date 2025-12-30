import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, Camera, AlertTriangle, CheckCircle2, Users, 
  Building2, Heart, TrendingUp, Info, ChevronLeft, 
  Plus, Wallet, Sparkles, Loader2, X, Phone, ShieldCheck, Trophy, 
  Home, Star, Building, Map as MapIcon, Search,
  Lock, ShieldAlert, Share2, Globe, Send, ExternalLink,
  UserCheck, User, CheckCircle, ArrowRight
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, doc, 
  updateDoc, query, getDocs, getDoc, orderBy, limit 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';

// --- إعدادات Firebase الخاصة بك (مدمجة لضمان التشغيل الفوري) ---
const firebaseConfig = {
  apiKey: "AIzaSyCyuIFbQQCzkeaiZiuscS-WfY1Ajs2wAVU",
  authDomain: "tareeqna-57b74.firebaseapp.com",
  projectId: "tareeqna-57b74",
  storageBucket: "tareeqna-57b74.firebasestorage.app",
  messagingSenderId: "797722330698",
  appId: "1:797722330698:web:6488a3f1a5b1b3c4e688b3",
  measurementId: "G-Q3RRP2VHES"
};

// تهيئة النظام مع حماية ضد الانهيار (Crash-Proof Initialization)
let app, auth, db;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase startup delayed or pending...");
}

const appId = "tareeqna_production_v1";

// مفتاح الخرائط: تم التعامل معه بحيث لا يسبب انهياراً إذا كان فارغاً
// يمكنك إضافة مفتاحك هنا لاحقاً بين علامتي التنصيص
const GOOGLE_MAPS_KEY = ""; 

const App = () => {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // ميزانية الرعاة (البيانات التي تظهر الجمالية)
  const sponsors = useMemo(() => [
    { id: 'sp1', name: 'البنك العربي', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=AB', repairs: 52, donated: 150000, color: 'bg-red-600' },
    { id: 'sp2', name: 'زين الأردن', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Zain', repairs: 41, donated: 120000, color: 'bg-black' },
    { id: 'sp3', name: 'أورنج الأردن', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Or', repairs: 35, donated: 95000, color: 'bg-orange-500' },
    { id: 'sp4', name: 'مجموعة المناصير', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=MA', repairs: 28, donated: 70000, color: 'bg-green-800' },
    { id: 'sp5', name: 'الملكية الأردنية', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=RJ', repairs: 22, donated: 55000, color: 'bg-slate-900' }
  ], []);

  // إدارة الدخول الرقمي
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (u) => { 
      if (!u) {
        try { await signInAnonymously(auth); } catch(e) { console.error("Guest login issue"); }
      }
      setUser(u); 
      setLoading(false); 
    });
    return () => unsub();
  }, []);

  // مزامنة البيانات الحية من Firestore
  useEffect(() => {
    if (!user || !db) return;
    
    const reportsPath = collection(db, 'artifacts', appId, 'public', 'data', 'reports');
    const unsubR = onSnapshot(reportsPath, (snap) => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }, (err) => {
      console.error("Data Sync Error:", err);
    });

    const donationsPath = collection(db, 'artifacts', appId, 'public', 'data', 'donations');
    const unsubD = onSnapshot(donationsPath, (snap) => {
      setDonations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubR(); unsubD(); };
  }, [user]);

  const handleDonation = async (details) => {
    if (!user || !db) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'donations'), {
        ...details, userId: user.uid, createdAt: new Date().toISOString()
      });
      if (details.type === 'road') {
        const ref = doc(db, 'artifacts', appId, 'public', 'data', 'reports', details.itemId);
        const item = reports.find(r => r.id === details.itemId);
        if (item) await updateDoc(ref, { collected: (Number(item.collected) || 0) + Number(details.amount) });
      }
      setShowDonateModal(false);
    } catch (e) { alert("حدث خطأ تقني في معالجة الطلب."); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Cairo'] text-slate-900 rtl text-right" dir="rtl">
      {/* Header Premium مع الشعار المطور والخط Cairo */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[60] p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
          <div className="bg-green-600 p-2.5 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">
              طريق<span className="text-green-600">نا</span>
            </h1>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Jordan Road Hub</p>
          </div>
        </div>
        <button onClick={() => setView('leaderboard')} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 hover:bg-amber-100 transition-all shadow-sm active:scale-95">
          <Trophy size={22}/>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto pb-44 px-4 md:px-0">
        {view === 'landing' && <LandingView setView={setView} reports={reports} sponsors={sponsors} />}
        {view === 'roads' && <ListView title="بلاغات الشوارع" items={reports} onDonate={(r) => { setSelectedItem({item: r, type: 'road'}); setShowDonateModal(true); }} onInfo={(r) => { setSelectedItem(r); setShowInfoModal(true); }} />}
        {view === 'report' && <CameraReportView onComplete={() => setView('landing')} user={user} />}
        {view === 'leaderboard' && <LeaderboardView donations={donations} onBack={() => setView('landing')} />}
        {view === 'partner-portal' && <PartnerPortalView onBack={() => setView('landing')} />}
        {view === 'donate' && <DonateUnifiedView reports={reports} onDonate={(item, type) => { setSelectedItem({item, type}); setShowDonateModal(true); }} onInfo={(item) => { setSelectedItem(item); setShowInfoModal(true); }} />}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-[3rem] p-3 flex justify-around items-center z-[70] shadow-2xl border border-white/10 ring-1 ring-white/5">
        <NavBtn icon={<Home />} label="الرئيسية" active={view === 'landing'} onClick={() => setView('landing')} />
        <NavBtn icon={<MapPin />} label="الشوارع" active={view === 'roads'} onClick={() => setView('roads')} />
        <div className="relative">
          <button onClick={() => setView('report')} className="bg-green-600 text-white p-5 rounded-[2.2rem] -mt-16 shadow-2xl shadow-green-900 border-[6px] border-[#F8FAFC] active:scale-90 hover:scale-105 transition-all group">
            <Plus size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        <NavBtn icon={<Building2 />} label="الملاعب" active={view === 'stadiums'} onClick={() => setView('stadiums')} />
        <NavBtn icon={<Wallet />} label="تبرع" active={view === 'donate'} onClick={() => setView('donate')} />
      </nav>

      {/* Modals Container */}
      {showDonateModal && <DonationPopup item={selectedItem} onClose={() => setShowDonateModal(false)} onConfirm={handleDonation} />}
      {showInfoModal && <InfoPopup item={selectedItem} onClose={() => setShowInfoModal(false)} />}
    </div>
  );
};

// --- View: Landing ---

const LandingView = ({ setView, reports, sponsors }) => (
  <div className="py-10 space-y-16 animate-in fade-in duration-1000">
    {/* Hero Section مع تأثير النبض */}
    <section className="bg-slate-900 rounded-[3.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
      <div className="relative z-10 max-w-2xl space-y-8 text-right">
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full border border-green-500/20 text-xs font-black uppercase">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.9)]"></div>
           مبادرة الأردن الرقمية 2030
        </div>
        <h2 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter italic">معاً نعمر <br/><span className="text-green-500 underline decoration-green-900/50">شوارع الوطن</span></h2>
        <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg">المنصة الرسمية الموثقة لإصلاح وتجميل البنية التحتية الأردنية بالتعاون مع القطاع الخاص.</p>
        <div className="flex flex-wrap gap-4 pt-4 justify-end">
           <button onClick={() => setView('report')} className="bg-white text-slate-900 px-12 py-5 rounded-[1.8rem] font-black text-xl shadow-xl hover:bg-green-50 transition-all active:scale-95">بلغ عن عطل</button>
           <button onClick={() => setView('roads')} className="bg-slate-800/50 text-white border border-slate-700 px-12 py-5 rounded-[1.8rem] font-black text-xl hover:bg-slate-800 transition-all">تصفح المشاريع</button>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-600 rounded-full blur-[140px] opacity-20 animate-pulse transition-opacity duration-1000"></div>
    </section>

    {/* CSR Sponsors */}
    <div className="space-y-8 px-2">
      <div className="flex justify-between items-end border-r-4 border-green-600 pr-4 text-right">
         <div><h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">شركاء الإعمار</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic leading-none">Corporate Partnerships</p></div>
         <button onClick={() => setView('partner-portal')} className="text-indigo-600 font-black text-sm flex items-center gap-1 hover:underline">بوابة الشركاء <ExternalLink size={14}/></button>
      </div>
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
         {sponsors.map(s => (
           <div key={s.id} className="min-w-[220px] bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center gap-5 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
              <div className="relative">
                <div className="w-20 h-20 rounded-[1.8rem] bg-slate-50 flex items-center justify-center p-4 border border-slate-100 group-hover:bg-white transition-colors text-center"><img src={s.logo} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" alt={s.name} /></div>
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg ${s.color}`}><CheckCircle2 size={18}/></div>
              </div>
              <div className="text-center space-y-1"><p className="font-black text-slate-800 text-lg tracking-tight leading-none">{s.name}</p><p className="text-[10px] text-green-600 font-black uppercase mt-1">{s.repairs} مشروع منجز</p></div>
           </div>
         ))}
      </div>
    </div>
  </div>
);

// --- View: Camera & Map ---

const CameraReportView = ({ onComplete, user }) => {
  const [img, setImg] = useState(null);
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (showMap && GOOGLE_MAPS_KEY) {
      const initMap = () => {
        const center = coords || { lat: 31.9454, lng: 35.9284 };
        if (!window.google) return;
        const map = new window.google.maps.Map(mapRef.current, { center, zoom: 15, mapTypeControl: false });
        const marker = new window.google.maps.Marker({ position: center, map, draggable: true, animation: window.google.maps.Animation.DROP });
        const updatePos = (pos) => {
          const lat = pos.lat(); const lng = pos.lng();
          setCoords({ lat, lng });
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (res, stat) => {
            if (stat === "OK" && res[0]) setLocation(res[0].formatted_address);
          });
        };
        map.addListener('click', (e) => { marker.setPosition(e.latLng); updatePos(e.latLng); });
        marker.addListener('dragend', () => updatePos(marker.getPosition()));
      };

      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
        script.async = true; script.onload = initMap;
        document.head.appendChild(script);
      } else initMap();
    }
  }, [showMap]);

  const openCamera = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setImg(reader.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!img || !location) return alert("يرجى تصوير الضرر وتحديد الموقع.");
    setSubmitting(true);
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reports'), {
      userId: user.uid, img, location, coords, createdAt: new Date().toISOString(), status: 'reported', collected: 0, goal: 250
    });
    onComplete();
  };

  return (
    <div className="p-6 md:p-10 space-y-12 animate-in slide-in-from-bottom-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between leading-none text-right"><h2 className="text-4xl font-black text-slate-800 tracking-tighter">بلاغ ميداني مباشر</h2><button onClick={onComplete} className="p-3 bg-white rounded-full text-slate-400 border border-slate-100 shadow-sm transition-all"><X/></button></div>
      <div className="bg-white p-10 rounded-[4.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden cursor-pointer shadow-inner group transition-all hover:border-green-500" onClick={openCamera}>
        {img ? <img src={img} className="absolute inset-0 w-full h-full object-cover" alt="Captured" /> : 
          <div className="text-center space-y-8 animate-in zoom-in duration-500">
             <div className="p-10 bg-slate-50 text-slate-300 rounded-[3rem] group-hover:bg-green-50 group-hover:text-green-500 transition-all duration-700 mx-auto w-fit shadow-inner"><Camera size={80}/></div>
             <p className="text-3xl font-black text-slate-700 leading-none italic">فتح الكاميرا</p>
             <p className="text-lg font-bold text-slate-400 max-w-xs mx-auto text-center">التقط صورة حية ومباشرة للضرر لضمان قبول البلاغ فوريّاً.</p>
          </div>
        }
      </div>
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 text-right">
         <div className="space-y-4">
            <div className="flex justify-between items-center mb-2 leading-none"><label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">تحديد الموقع الجغرافي <ShieldCheck size={14} className="text-indigo-600"/></label>
            {GOOGLE_MAPS_KEY && <button onClick={() => setShowMap(!showMap)} className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-2"><MapIcon size={14}/> {showMap ? 'إخفاء الخريطة' : 'فتح الخريطة'}</button>}
            </div>
            <div className="relative">
              <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 text-green-600" size={28}/><input placeholder={GOOGLE_MAPS_KEY ? "الموقع (تلقائي من الخريطة)" : "اكتب الموقع يدوياً (مثلاً: شارع المطار)"} className="w-full p-8 pr-16 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-black outline-none focus:bg-white transition-all text-2xl shadow-inner text-right leading-none" value={location} onChange={e => setLocation(e.target.value)} readOnly={!!GOOGLE_MAPS_KEY} /></div>
            {showMap && <div ref={mapRef} className="w-full h-80 rounded-[3rem] border-2 border-indigo-100 shadow-xl overflow-hidden animate-in zoom-in-95"></div>}
            {!GOOGLE_MAPS_KEY && <p className="text-amber-600 text-xs font-bold leading-none px-4">ملاحظة: نظام الخرائط سيتم تفعيله قريباً، يرجى كتابة الموقع يدوياً حالياً.</p>}
         </div>
      </div>
      <button onClick={handleSubmit} disabled={submitting || !img} className="w-full bg-slate-900 text-white py-8 rounded-[3rem] font-black text-4xl shadow-2xl active:scale-95 disabled:bg-slate-200 transition-all flex items-center justify-center gap-4 group leading-none">{submitting ? <Loader2 className="animate-spin mx-auto"/> : <>نشر البلاغ الموثق <ArrowRight className="rotate-180"/></>}</button>
    </div>
  );
};

// --- Other Components (ListView, Leaderboard, etc.) ---

const ListView = ({ title, items, onDonate, onInfo }) => (
  <div className="py-12 space-y-12 animate-in slide-in-from-right duration-700">
     <div className="px-2 space-y-1 border-r-8 border-slate-900 pr-6 text-right leading-none"><h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none italic">{title}</h2><p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none mt-2">Jordan National Infrastructure</p></div>
     <div className="grid gap-12">
        {items.length > 0 ? items.map(item => (
           <div key={item.id} className="bg-white p-8 md:p-12 rounded-[4.5rem] border border-slate-100 shadow-sm space-y-10 group hover:shadow-2xl transition-all duration-700 text-right leading-none">
              <div className="flex flex-col md:flex-row gap-12 text-right">
                 <div className="relative w-full md:w-80 h-80 flex-shrink-0 overflow-hidden rounded-[3.5rem] shadow-inner"><img src={item.img} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" /><div className="absolute top-6 right-6 bg-red-600 text-white text-[10px] font-black px-6 py-2 rounded-full shadow-xl ring-4 ring-white uppercase tracking-widest leading-none animate-pulse">Critical</div></div>
                 <div className="flex-1 space-y-8">
                    <div className="flex justify-between items-start pt-4 leading-none"><h4 className="font-black text-5xl text-slate-800 leading-[1] tracking-tighter italic">إصلاح وتعبيد شارع</h4><button onClick={() => onInfo(item)} className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] shadow-lg active:scale-90 transition-all hover:bg-indigo-600 hover:text-white"><Info size={28}/></button></div>
                    <p className="text-slate-400 font-bold text-2xl flex items-center gap-3 justify-end leading-none"><MapPin size={28} className="text-green-600"/> {item.location}</p>
                    <div className="pt-10 space-y-4">
                       <div className="flex justify-between text-sm font-black uppercase tracking-widest text-slate-500 leading-none"><span>المساهمات: <span className="text-slate-900 text-2xl">{item.collected || 0} د.أ</span></span><span>الهدف: {item.goal} د.أ</span></div>
                       <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden shadow-inner border border-slate-200/40 p-1.5"><div className="bg-gradient-to-l from-green-500 to-green-700 h-full rounded-full transition-all duration-[1.5s] ease-out shadow-lg" style={{width: `${Math.min(((item.collected||0)/(item.goal||100))*100, 100)}%`}}></div></div>
                    </div>
                 </div>
              </div>
              <button onClick={() => onDonate(item)} className="w-full bg-amber-500 text-white py-10 rounded-[3rem] font-black text-4xl shadow-xl hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group leading-none"><Heart fill="currentColor" size={32} className="group-hover:scale-125 transition-transform" /> ساهم في الإعمار الوطني</button>
           </div>
        )) : <div className="py-32 text-center space-y-8 bg-white rounded-[5rem] border-2 border-dashed border-slate-100 shadow-inner"><AlertTriangle className="mx-auto text-slate-200 animate-pulse" size={100}/><p className="text-3xl font-black text-slate-300 tracking-tighter leading-none uppercase italic">لا يوجد مشاريع نشطة حالياً</p></div>}
     </div>
  </div>
);

const NavBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${active ? 'text-green-500' : 'text-slate-500 hover:text-white'}`}>
    <div className={`p-3.5 rounded-2xl transition-all ${active ? 'bg-green-500/10 shadow-inner ring-1 ring-white/10' : ''}`}>{React.cloneElement(icon, { size: 26, strokeWidth: active ? 3 : 2.5 })}</div>
    <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

const LoadingScreen = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-6 animate-in fade-in duration-500 text-right">
    <div className="relative"><div className="w-20 h-20 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div><TrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600" size={32} /></div>
    <div className="text-center animate-pulse"><p className="text-3xl font-black text-slate-800 italic leading-none">طريقنا</p><p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">Jordan Road Guard</p></div>
  </div>
);

const LeaderboardView = ({ donations, onBack }) => {
  const topDonors = useMemo(() => {
    const grouped = donations.reduce((acc, d) => {
      const name = d.anonymousName ? "فاعل خير" : (d.donorName || "مجهول");
      if (!acc[name]) acc[name] = { name, total: 0 };
      acc[name].total += Number(d.amount);
      return acc;
    }, {});
    return Object.values(grouped).sort((a,b) => b.total - a.total).slice(0, 10);
  }, [donations]);
  return (
    <div className="py-12 px-2 space-y-12 animate-in slide-in-from-left duration-700 text-right leading-none">
      <div className="flex items-center gap-6 text-right"><button onClick={onBack} className="p-5 bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:bg-slate-50 active:scale-90 transition-all"><ChevronLeft className="rotate-180" size={32}/></button><div><h2 className="text-5xl font-black text-slate-800 tracking-tighter leading-none uppercase italic">لوحة الشرف</h2><p className="text-slate-400 font-bold text-sm uppercase tracking-[0.3em] mt-2 leading-none italic text-center">Elite Contributors Hub</p></div></div>
      <div className="bg-white rounded-[5rem] border border-slate-100 shadow-2xl overflow-hidden ring-1 ring-slate-100">
        {topDonors.map((d, i) => (
          <div key={i} className="p-10 md:p-14 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-amber-50/20 transition-all group">
            <div className="flex items-center gap-10">
               <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-lg border-4 ${i === 0 ? 'bg-amber-500 text-white border-amber-200 ring-4 ring-amber-50' : i === 1 ? 'bg-slate-100 text-slate-400' : i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-300'}`}>{i+1}</div>
               <div><p className="font-black text-3xl text-slate-800 group-hover:text-slate-900 transition-colors tracking-tight italic leading-none">{d.name}</p><div className="flex items-center gap-2 text-green-600 text-sm font-black uppercase mt-3 tracking-widest leading-none"><UserCheck size={18}/> مساهم وطني موثق</div></div>
            </div>
            <p className="text-green-600 font-black text-5xl tracking-tighter leading-none">{d.total} <span className="text-xl opacity-60 font-bold leading-none">د.أ</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

const DonateUnifiedView = ({ reports, onDonate }) => (
  <div className="py-12 space-y-16 animate-in fade-in duration-1000 text-right leading-none">
    <div className="bg-amber-50 p-10 md:p-16 rounded-[4rem] border-2 border-amber-100 flex flex-col md:flex-row items-center gap-14 shadow-inner relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-2 bg-amber-500 opacity-20"></div>
       <div className="p-10 bg-white rounded-[3.5rem] shadow-xl relative z-10"><Wallet className="text-amber-600" size={80}/></div>
       <div className="space-y-6 relative z-10 max-w-2xl leading-relaxed text-right">
         <h2 className="text-4xl font-black text-amber-900 leading-none tracking-tighter italic uppercase">صندوق إعمار الأردن الرقمي</h2>
         <p className="text-amber-700 text-2xl font-bold opacity-80 leading-relaxed italic text-right">تبرعاتك تذهب مباشرة لصيانة شوارعنا وملاعبنا استعداداً للاستحقاقات الوطنية الكبرى. كل دينار يساهم في جعل وطننا أكثر أماناً.</p>
       </div>
    </div>
    <div className="space-y-12">
       <div className="px-4 space-y-2 border-r-8 border-green-600 pr-8 leading-none"><h3 className="text-3xl font-black text-slate-800 uppercase leading-none italic">إعمار الشوارع</h3><p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none mt-2 italic">Active National Projects</p></div>
       <div className="grid md:grid-cols-2 gap-10">{reports.map(r => (<div key={r.id} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-8 group hover:shadow-xl transition-all leading-none text-right"><img src={r.img} className="w-full h-64 rounded-[3rem] object-cover shadow-xl grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" alt="Repair" /><div className="space-y-6"><h4 className="font-black text-3xl truncate text-slate-800 italic leading-none tracking-tight">{r.location}</h4><div className="flex justify-between items-center bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner"><p className="text-green-600 font-black text-4xl tracking-tighter leading-none">{r.collected || 0} / {r.goal} <span className="text-lg opacity-40 font-black">د.أ</span></p><button onClick={() => onDonate(r, 'road')} className="bg-slate-900 text-white px-12 py-4 rounded-3xl font-black text-xl hover:bg-green-600 transition-all active:scale-95 shadow-xl leading-none italic uppercase transition-all">تبرع الآن</button></div></div></div>))}</div>
    </div>
  </div>
);

const PartnerPortalView = ({ onBack }) => (
  <div className="py-12 space-y-12 animate-in fade-in duration-700 text-right leading-none">
     <div className="flex items-center gap-6 leading-none"><button onClick={onBack} className="p-5 bg-white rounded-[2rem] border hover:bg-slate-50 active:scale-90 shadow-sm transition-all leading-none"><ChevronLeft className="rotate-180" size={32}/></button><h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-none italic uppercase">بوابة الشركاء</h2></div>
     <div className="bg-slate-900 p-20 rounded-[5rem] border border-white/5 shadow-2xl text-center space-y-12 relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600 rounded-full blur-[140px] opacity-10"></div>
        <div className="relative z-10 space-y-8 text-center"><Lock className="mx-auto text-indigo-400" size={80} /><h3 className="text-5xl font-black text-white tracking-tight leading-none text-center italic uppercase">المؤسسات المعتمدة</h3><p className="text-slate-400 font-medium leading-relaxed max-w-xl mx-auto text-xl italic opacity-80 text-center leading-relaxed">بوابة حصرياً لمسؤولي أمانة عمان الكبرى، البلديات، والرعاة لإدارة المشاريع ميدانياً ومتابعة الأثر المالي والقانوني.</p><div className="flex flex-col gap-5 max-w-sm mx-auto pt-10"><input type="password" placeholder="كود الدخول المؤسسي الموحد" className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] outline-none focus:border-indigo-500 text-center font-black text-white text-3xl placeholder:text-slate-800 shadow-inner text-right leading-none transition-all" /><button className="bg-indigo-600 text-white py-8 rounded-[2.5rem] font-black text-4xl shadow-xl hover:bg-indigo-700 active:scale-95 leading-none transition-all uppercase">تسجيل الدخول</button></div></div>
     </div>
  </div>
);

const DonationPopup = ({ item, onClose, onConfirm }) => {
  const [amount, setAmount] = useState('10');
  const [name, setName] = useState('');
  const [anon, setAnon] = useState(false);
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[4.5rem] w-full max-w-lg p-16 space-y-12 shadow-2xl animate-in zoom-in-95 ring-1 ring-slate-100 text-right leading-none">
        <div className="flex justify-between items-center leading-none"><h3 className="text-4xl font-black text-slate-800 tracking-tighter leading-none italic uppercase">ساهم في البناء</h3><button onClick={onClose} className="p-4 bg-slate-100 rounded-full shadow-sm hover:bg-slate-200 transition-all leading-none"><X size={24}/></button></div>
        <div className="bg-green-50 p-10 rounded-[3rem] border border-green-100 shadow-inner text-center"><p className="font-black text-slate-800 text-3xl leading-[1.1] tracking-tight italic">{item.item.location}</p></div>
        <div className="space-y-6"><label className="text-xs font-black text-slate-400 mr-2 uppercase tracking-[0.3em] opacity-70 leading-none italic">Contribution (JOD)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-10 bg-slate-50 border-2 border-transparent rounded-[3rem] font-black text-center text-6xl outline-none focus:border-green-600 focus:bg-white transition-all shadow-inner text-slate-900 leading-none italic" /></div>
        <div className="space-y-8"><input placeholder="الاسم الكامل" disabled={anon} className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] font-black outline-none focus:border-green-600 disabled:bg-slate-50 transition-all text-2xl shadow-sm text-right leading-none placeholder:italic" value={name} onChange={e => setName(e.target.value)} /><label className="flex items-center gap-6 cursor-pointer group justify-end"><span className="text-2xl font-black text-slate-500 group-hover:text-slate-800 transition-colors tracking-tight italic">التبرع بهوية مجهولة</span><input type="checkbox" className="hidden" checked={anon} onChange={e => setAnon(e.target.checked)} /><div className={`w-10 h-10 rounded-2xl border-4 flex items-center justify-center transition-all ${anon ? 'bg-green-600 border-green-600 shadow-xl' : 'bg-white border-slate-200 group-hover:border-green-300'}`}>{anon && <CheckCircle2 size={24} className="text-white" />}</div></label></div>
        <button onClick={() => onConfirm({ amount, donorName: name, anonymousName: anon, itemId: item.item.id, type: item.type })} className="w-full bg-amber-500 text-white py-10 rounded-[3rem] font-black text-4xl shadow-xl shadow-amber-200 active:scale-95 transition-all flex items-center justify-center gap-4 group leading-none italic uppercase transition-all">تأكيد ونشر المساهمة <CheckCircle size={32} className="group-hover:scale-125 transition-transform" /></button>
      </div>
    </div>
  );
};

const InfoPopup = ({ item, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-6 animate-in fade-in">
    <div className="bg-white rounded-[6rem] w-full max-w-4xl p-14 md:p-20 space-y-14 shadow-2xl relative overflow-hidden animate-in zoom-in ring-1 ring-slate-100 text-right leading-none">
      <button onClick={onClose} className="absolute top-12 right-12 p-6 bg-white/50 backdrop-blur-md rounded-full text-slate-800 z-20 border border-slate-200 shadow-xl hover:bg-white transition-all leading-none"><X size={40}/></button>
      <div className="relative group text-right">
        <img src={item.img} className="w-full h-[550px] rounded-[5rem] object-cover shadow-2xl transition-transform duration-[3s] group-hover:scale-105" alt="Road Detail" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent rounded-[5rem]"></div>
        <div className="absolute bottom-12 right-12 left-12 leading-none">
          <p className="text-slate-200 font-bold text-lg mb-4 flex items-center gap-3 justify-end uppercase tracking-[0.3em] leading-none italic"><MapPin size={24} className="text-green-500"/> {item.location}</p>
          <h3 className="text-6xl font-black text-white leading-tight tracking-tighter leading-none uppercase italic">التفاصيل الفنية والهندسية</h3>
        </div>
      </div>
      <div className="bg-slate-50 p-12 rounded-[4.5rem] border border-slate-100 shadow-inner space-y-8 text-right leading-relaxed">
         <div className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-3 rounded-full font-black text-lg shadow-xl leading-none italic"><ShieldCheck size={28}/> تقرير هندسي معتمد</div>
         <p className="text-slate-600 text-3xl leading-[1.6] font-medium tracking-tight text-right leading-relaxed italic">يخضع هذا الموقع لرقابة مهندسي المساحة والتعبيد في أمانة عمان الكبرى. يتم تنفيذ الأعمال وفق كودات الطرق الأردنية المستدامة لضمان جودة التعبيد لأكثر من 15 عاماً ومقاومة كافة الظروف الجوية القاسية.</p>
      </div>
    </div>
  </div>
);

export default App;
