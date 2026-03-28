import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, Camera, AlertTriangle, CheckCircle2, Users, 
  Building2, Heart, TrendingUp, Info, ChevronLeft, 
  Plus, Wallet, Sparkles, Loader2, X, Phone, ShieldCheck, Trophy, 
  Home, Star, Map as MapIcon, Search,
  Lock, ShieldAlert, Share2, Globe, Send, ExternalLink,
  UserCheck, User, CheckCircle, ArrowRight, AlertCircle, Smartphone, HardHat, Mail, Facebook, Twitter, Instagram,
  Map as MapPinIcon, Bot, MessageCircle, HandHeart, Copy, UserPlus, Calendar, CreditCard, BarChart3, PieChart, FileText, Activity
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- 1. الإعدادات والبيانات الثابتة ---

const firebaseConfig = {
  apiKey: "AIzaSyCyuIFbQQCzkeaiZiuscS-WfY1Ajs2wAVU",
  authDomain: "tareeqna-57b74.firebaseapp.com",
  projectId: "tareeqna-57b74",
  storageBucket: "tareeqna-57b74.firebasestorage.app",
  messagingSenderId: "797722330698",
  appId: "1:797722330698:web:6488a3f1a5b1b3c4e688b3",
  measurementId: "G-Q3RRP2VHES"
};

const GEMINI_KEY = "AIzaSyDlCh6zXjGf_yJGdotpXY3eM0d28oAFfrQ";
const appId = "tareeqna_production_final_v1";

let app, auth, db;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) { console.warn("Firebase wait..."); }

const DEMO_REPORTS = [
  { id: 'r1', type: 'road', location: 'عمان - شارع الجاردنز، قرب مجمع موسى', description: 'هبوط حاد في منتصف الشارع يسبب أزمة سير خانقة وأضراراً للمركبات.', img: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800', severity: 9, streetType: 'شارع تجاري حيوي', collected: 1250, goal: 2000, pitDepth: '15.5', impact: '25,000 مستفيد يومياً' },
  { id: 'r2', type: 'road', location: 'إربد - دوار الدرة، الحي الشرقي', description: 'تشققات واسعة في الإسفلت وتجمع مياه الأمطار.', img: 'https://images.unsplash.com/photo-1584463635292-e48f7633d25d?auto=format&fit=crop&q=80&w=800', severity: 7, streetType: 'شارع سكني', collected: 120, goal: 500, pitDepth: '8.0', impact: '5,000 مستفيد يومياً' },
  { id: 's1', type: 'stadium', location: 'ملعب القويسمة الشعبي', description: 'أرضية الملعب متهالكة وبحاجة لترميم العشب الصناعي والإنارة.', img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=800', severity: 5, streetType: 'منشأة رياضية', collected: 1500, goal: 3000, pitDepth: 'صيانة شاملة', impact: 'يخدم 3 أندية محلية' },
];

const DEMO_TEAMS = [
  { id: 't1', teamName: 'نشامى العقبة', task: 'تنظيف الشاطئ الجنوبي', location: 'العقبة', members: 45, membersCount: 50, seasonPoints: 320, description: 'حملة لتنظيف الشاطئ من المخلفات البلاستيكية حمايةً للبيئة البحرية.' },
  { id: 't2', teamName: 'سواعد عجلون', task: 'زراعة 100 شجرة', location: 'محمية عجلون', members: 20, membersCount: 25, seasonPoints: 210, description: 'مبادرة لزيادة الرقعة الخضراء في غابات عجلون.' },
];

const NASHMI_POSES = {
  welcome: "https://i.ibb.co/8nnWQtJ5/1-Welcome-Pose.png",
  thinking: "https://i.ibb.co/4w6tYtqw/2-Thinking-Pose.png",
  explaining: "https://i.ibb.co/xqDg9M42/3-Explaining-Pose.png",
  success: "https://i.ibb.co/R4hyNNfN/4-Success-Pose.png",
  confused: "https://i.ibb.co/Ps56xNzJ/5-Confused-Pose.png",
  alert: "https://i.ibb.co/BHKpz558/6-Alert-Pose.png"
};

const VOLUNTEER_TASKS = [
  { id: 1, label: 'تنظيف شارع حيوي', points: 2 },
  { id: 2, label: 'تنظيف شاطئ / واجهة مائية', points: 3 },
  { id: 3, label: 'تنظيف وتعقيم مسجد', points: 4 },
  { id: 4, label: 'تنظيف حديقة عامة/مكان سياحي', points: 3 },
  { id: 5, label: 'دهان أطاريف وأرصفة', points: 3 },
  { id: 6, label: 'زراعة أشجار (تخضير)', points: 5 },
];

const SPONSORS = [
  { id: 'sp1', name: 'البنك العربي', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=AB', repairs: 52 },
  { id: 'sp2', name: 'زين الأردن', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Zain', repairs: 41 },
  { id: 'sp3', name: 'أورنج الأردن', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Or', repairs: 35 },
  { id: 'sp4', name: 'مجموعة المناصير', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=MA', repairs: 28 },
  { id: 'sp5', name: 'الملكية الأردنية', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=RJ', repairs: 22 }
];

// --- 2. المكونات الفرعية ---

const TareeqnaLogo = () => (
  <div className="flex flex-col leading-none select-none">
    <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter italic whitespace-nowrap leading-none" dir="rtl">
      طريق<span className="text-green-600">نا</span>
    </h1>
    <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 text-right">Jordan Road Guard</p>
  </div>
);

const NavBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all active:scale-90 leading-none shrink-0 ${active ? 'text-green-500' : 'text-slate-500 hover:text-white'}`}>
    <div className={`p-2 md:p-3.5 rounded-xl md:rounded-2xl transition-all shrink-0 ${active ? 'bg-green-500/10 shadow-inner' : ''}`}>
       {React.cloneElement(icon, { size: 20, className: "md:w-[26px] md:h-[26px]", strokeWidth: active ? 3 : 2.5 })}
    </div>
    <span className={`text-[7px] md:text-[10px] font-black uppercase tracking-widest transition-opacity leading-none shrink-0 ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

const LoadingScreen = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-6 animate-in fade-in text-center px-10 leading-none">
    <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
    <div className="space-y-2 leading-none text-center mt-4">
       <TareeqnaLogo />
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">المنصة الوطنية الأردنية</p>
    </div>
  </div>
);

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
      {items && items.length > 0 ? items.map(item => (
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

const LandingView = ({ setView, reports, sponsors }) => {
  const categories = useMemo(() => ({
    urgent: reports.filter(r => r.severity >= 8 && (r.collected < (r.goal || 100))).slice(0, 4),
    recent: reports.slice(0, 4),
    completed: reports.filter(r => r.collected >= (r.goal || 100)).slice(0, 4)
  }), [reports]);

  return (
    <div className="py-6 md:py-10 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 space-y-6 lg:order-1 order-2">
           <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm sticky top-28">
              <div className="space-y-1 mb-8 border-r-4 border-green-600 pr-4 text-right">
                 <h3 className="text-xl font-black text-slate-800 leading-none">شركاء الإعمار</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">Corporate Partnerships</p>
              </div>
              <div className="space-y-6">
                 {sponsors && sponsors.map(s => (
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

const DetailView = ({ item, onBack, onDonate }) => {
  if (!item) return null;
  return (
    <div className="animate-in slide-in-from-left duration-500 pb-20 text-right">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-3 bg-white rounded-xl shadow-sm border"><ChevronLeft className="rotate-180"/></button>
        <h2 className="text-2xl font-black text-slate-800">تفاصيل الحالة</h2>
      </div>
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100">
        <div className="relative h-72">
          <img src={item.img} className="w-full h-full object-cover" alt="Detail" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
          <div className="absolute bottom-6 right-6 text-white text-right">
            <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">خطورة {item.severity}/10</span>
            <h3 className="text-xl font-black leading-tight">{item.location}</h3>
          </div>
        </div>
        <div className="p-8 space-y-8 text-right">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="text-center"><p className="text-xs text-slate-400 font-bold">النوع</p><p className="font-black text-slate-800">{item.streetType}</p></div>
             <div className="w-px h-8 bg-slate-200"></div>
             <div className="text-center"><p className="text-xs text-slate-400 font-bold">الأثر</p><p className="font-black text-green-600">{item.impact || 'عالٍ'}</p></div>
             <div className="w-px h-8 bg-slate-200"></div>
             <div className="text-center"><p className="text-xs text-slate-400 font-bold">الهدف</p><p className="font-black text-amber-600">{item.goal} د.أ</p></div>
          </div>
          <div className="space-y-3">
            <h4 className="font-black text-lg flex items-center gap-2 justify-start"><Info size={18} className="text-indigo-500"/> التقرير الفني</h4>
            <p className="text-slate-600 leading-relaxed text-sm font-medium border-r-4 border-indigo-200 pr-4">{item.description || 'تم رصد الضرر وتوثيقه، ويحتاج لتدخل فوري.'}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold"><span>تم جمع: {item.collected} د.أ</span><span className="text-slate-400">{Math.round((item.collected/item.goal)*100)}%</span></div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-1000" style={{width: `${(item.collected/item.goal)*100}%`}}></div></div>
          </div>
          <button onClick={onDonate} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-3"><Heart fill="currentColor" /> تبرع لهذا المشروع</button>
        </div>
      </div>
    </div>
  );
};

const PaymentSimulation = ({ item, onBack, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      alert("تمت عملية التبرع بنجاح! شكراً لمساهمتك الوطنية.");
      onSuccess();
    }, 2000);
  };
  return (
    <div className="animate-in zoom-in duration-300 text-right pb-20">
      <div className="flex items-center gap-4 mb-6"><button onClick={onBack} className="p-3 bg-white rounded-xl shadow-sm border"><ChevronLeft className="rotate-180"/></button><h2 className="text-2xl font-black text-slate-800">بوابة الدفع الآمن</h2></div>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
         <div className="flex justify-between items-center border-b border-slate-100 pb-4"><span className="text-slate-500 font-bold">المشروع:</span><span className="font-black text-slate-800 text-sm">{item?.location}</span></div>
         <div className="space-y-4"><label className="block text-sm font-bold text-slate-400">قيمة التبرع (د.أ)</label><div className="grid grid-cols-3 gap-3">{[5, 10, 20].map(amt => (<button key={amt} className="py-3 rounded-xl border-2 border-slate-100 font-black hover:border-green-500 hover:bg-green-50 transition-all">{amt}</button>))}</div><input type="number" placeholder="مبلغ آخر" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-center" /></div>
         <div className="space-y-4"><label className="block text-sm font-bold text-slate-400">بيانات البطاقة</label><div className="relative"><CreditCard className="absolute top-4 right-4 text-slate-400" size={20}/><input placeholder="0000 0000 0000 0000" className="w-full p-4 pr-12 bg-slate-50 rounded-2xl outline-none font-mono font-bold text-left ltr" dir="ltr" /></div></div>
         <button onClick={handlePay} disabled={processing} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2">{processing ? <Loader2 className="animate-spin"/> : <Lock size={18}/>} {processing ? 'جاري المعالجة...' : 'دفع آمن الآن'}</button>
      </div>
    </div>
  );
};

const OdooDashboard = ({ onLogout }) => (
  <div className="bg-[#f0f4f7] min-h-screen -mx-4 -mt-6 p-4 font-sans text-right" dir="rtl">
    <div className="bg-[#714B67] text-white p-4 flex justify-between items-center rounded-b-xl shadow-md mb-6"><div className="flex items-center gap-3"><div className="p-2 bg-white/20 rounded-lg"><Building2 size={20}/></div><div><h2 className="font-bold text-sm">Odoo Enterprise</h2><p className="text-[10px] opacity-80">Tareeqna Module</p></div></div><button onClick={onLogout} className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20">خروج</button></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">{[{ label: 'البلاغات', val: '1,240', icon: <FileText className="text-purple-600"/> }, { label: 'قيد التنفيذ', val: '45', icon: <Activity className="text-blue-600"/> }, { label: 'التبرعات', val: '85K د.أ', icon: <Wallet className="text-green-600"/> }, { label: 'الإنجاز', val: '92%', icon: <PieChart className="text-amber-600"/> }].map((stat, i) => (<div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><div className="flex justify-between items-start mb-2">{stat.icon}<span className="text-xs text-slate-400 font-bold">2024</span></div><h3 className="text-2xl font-black text-slate-800">{stat.val}</h3><p className="text-[10px] text-slate-500">{stat.label}</p></div>))}</div>
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"><div className="p-4 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-slate-800 text-sm">أحدث مشاريع الصيانة</h3></div><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3 text-right">المرجع</th><th className="p-3 text-right">الموقع</th><th className="p-3 text-right">الحالة</th></tr></thead><tbody className="divide-y divide-slate-100">{[{ id: '#TR-001', loc: 'شارع الجاردنز', st: 'مكتمل' }, { id: '#TR-002', loc: 'طريق المطار', st: 'جاري العمل' }].map((row, i) => (<tr key={i}><td className="p-3 font-mono font-bold text-slate-600">{row.id}</td><td className="p-3 font-bold text-slate-800">{row.loc}</td><td className="p-3">{row.st}</td></tr>))}</tbody></table></div>
  </div>
);

const JoinTeamForm = ({ team, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', dob: '', phone: '', motivation: '' });
  const handleSubmit = () => {
     const birthDate = new Date(formData.dob);
     const age = new Date().getFullYear() - birthDate.getFullYear();
     if (age < 18) return alert("عذراً، يجب أن يكون عمرك 18 عاماً فما فوق.");
     if (!formData.name || !formData.phone) return alert("يرجى تعبئة الحقول.");
     alert("تم إرسال طلبك لقائد الفريق!");
     onSuccess();
  };
  return (
    <div className="py-6 animate-in slide-in-from-bottom-10 text-right pb-20">
       <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold mb-6"><ChevronLeft className="rotate-180"/> عودة للفرق</button>
       <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600"><HandHeart size={32}/></div><div><h2 className="text-xl font-black text-slate-800">استمارة التطوع</h2><p className="text-xs text-slate-500">فريق: <span className="text-green-600 font-bold">{team?.teamName}</span></p></div></div>
          <div className="space-y-4">
             <div><label className="text-xs font-bold text-slate-500">الاسم</label><input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-right" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
             <div><label className="text-xs font-bold text-slate-500">تاريخ الميلاد</label><input type="date" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-right" value={formData.dob} onChange={e=>setFormData({...formData, dob: e.target.value})} /></div>
             <div><label className="text-xs font-bold text-slate-500">رقم الهاتف</label><input type="tel" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-right" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} /></div>
          </div>
          <button onClick={handleSubmit} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg mt-6 shadow-xl hover:bg-green-600 transition-all">إرسال طلب الانضمام</button>
       </div>
    </div>
  );
};

const VolunteeringHub = ({ teams, user, onBack, setView, setActiveData, initialMode }) => {
  const [viewState, setViewState] = useState(initialMode || 'hub');
  const [teamForm, setTeamForm] = useState({ name: '', task: '', location: '', count: '', phone: '' });

  const handleCreate = async () => {
    if (!teamForm.name) return alert("يرجى تعبئة الحقول");
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'teams'), {
            teamName: teamForm.name, task: teamForm.task, location: teamForm.location, 
            membersCount: teamForm.count, leaderId: 'guest', createdAt: new Date().toISOString(), members: 1
        });
        setViewState('success');
    } catch(e) { alert("تم إنشاء الفريق (محاكاة)"); setViewState('success'); }
  };

  if (viewState === 'success') return (
       <div className="bg-white p-10 rounded-[3rem] text-center space-y-6 shadow-xl border border-green-100 animate-in zoom-in mt-10">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600"><CheckCircle2 size={40}/></div>
           <h3 className="text-2xl font-black text-slate-800">تم إنشاء الفريق بنجاح!</h3>
           <button onClick={() => setViewState('hub')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black mt-4">العودة للقائمة</button>
       </div>
  );

  if (viewState === 'create') return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 animate-in slide-in-from-bottom-10 mt-10 text-right pb-10">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-black text-slate-800">تأسيس فريق</h3><button onClick={() => setViewState('hub')}><X/></button></div>
            <div className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500">اسم الفريق</label><input className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-green-500 text-right" value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})}/></div>
                <div><label className="text-xs font-bold text-slate-500">نوع النشاط</label><select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none text-right" onChange={e => setTeamForm({...teamForm, task: e.target.value})}><option value="">اختر المهمة...</option>{VOLUNTEER_TASKS.map((t,i) => <option key={i} value={t.label}>{t.label} ({t.points} نقاط)</option>)}</select></div>
                <div><label className="text-xs font-bold text-slate-500">الموقع</label><input className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none text-right" value={teamForm.location} onChange={e => setTeamForm({...teamForm, location: e.target.value})} /></div>
            </div>
            <button onClick={handleCreate} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black mt-4 shadow-xl">إنشاء الفريق</button>
        </div>
  );

  return (
    <div className="py-8 space-y-6 animate-in fade-in duration-700 text-right pb-20">
       <div className="flex items-center justify-between"><div><h2 className="text-3xl font-black text-slate-800 tracking-tighter">بوابة التطوع</h2><p className="text-slate-400 font-bold text-xs mt-1">مجتمعنا.. مسؤوليتنا</p></div><button onClick={onBack} className="p-3 bg-white rounded-xl shadow-sm border"><ChevronLeft className="rotate-180"/></button></div>
       
       <div className="space-y-8">
           <div onClick={() => setViewState('create')} className="bg-white border-2 border-dashed border-green-300 rounded-[2rem] p-6 flex items-center justify-center gap-4 cursor-pointer hover:bg-green-50 transition-all group"><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform"><Plus size={24}/></div><div className="text-center"><h4 className="font-black text-slate-800">أسس فريقك الخاص</h4><p className="text-xs text-slate-500">كن قائداً واجمع النقاط</p></div></div>
           <div className="grid gap-4 md:grid-cols-2">
               {teams && teams.map(t => (
                   <div key={t.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all text-right">
                       <div className="flex justify-between items-start mb-4"><div><h4 className="font-black text-lg text-slate-800">{t.teamName}</h4><span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded-lg font-bold">{t.task}</span></div><div className="text-center bg-slate-50 p-2 rounded-xl"><span className="block text-xl font-black text-green-600">{t.members}/{t.membersCount}</span><span className="text-[9px] text-slate-400 font-bold">عضو</span></div></div>
                       <p className="text-xs text-slate-400 flex items-center gap-1 mb-4"><MapPin size={12}/> {t.location}</p>
                       <button onClick={() => { setActiveData(t); setView('join-team'); }} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2"><UserPlus size={16}/> انضم للفريق</button>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
};

const CameraReportView = ({ onComplete, user }) => {
  const [img, setImg] = useState(null);
  const [location, setLocation] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isPC, setIsPC] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) return false;
      return true;
    };
    setIsPC(checkDevice());
  }, []);

  const handleSubmission = () => {
    if (isPC) return;
    if (!location || !img) return setError("يرجى تعبئة كافة الحقول");
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onComplete(); alert("تم استلام البلاغ بنجاح!"); }, 2000);
  };

  return (
    <div className="p-8 text-right space-y-6 pt-20 animate-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center"><h2 className="text-3xl font-black text-slate-800">تبليغ جديد</h2><button onClick={onComplete}><X/></button></div>
      {isPC ? (
        <div className="bg-slate-900 p-8 rounded-[2rem] text-center text-white space-y-4">
           <Smartphone size={48} className="mx-auto text-green-500 animate-pulse"/>
           <h3 className="text-xl font-bold">خاص بالهواتف فقط</h3>
           <p className="text-sm opacity-80">لضمان المصداقية، يرجى استخدام تطبيق الهاتف.</p>
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tareeqna.vercel.app/" className="w-32 h-32 mx-auto rounded-xl border-4 border-white" alt="QR" />
        </div>
      ) : (
        <>
          <div onClick={() => fileInputRef.current.click()} className="bg-slate-100 h-64 rounded-[2rem] border-4 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
             {img ? <img src={img} className="w-full h-full object-cover rounded-[2rem]" alt="preview" /> : <><Camera size={48} className="text-slate-400 mb-2"/><p className="font-bold text-slate-500">اضغط للتصوير</p></>}
             <input ref={fileInputRef} type="file" accept="image/*" capture="environment" hidden onChange={e => { const f=e.target.files[0]; if(f){ const r=new FileReader(); r.onload=()=>setImg(r.result); r.readAsDataURL(f); } }} />
          </div>
          <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-right outline-none" placeholder="موقع البلاغ" value={location} onChange={e=>setLocation(e.target.value)} />
          {error && <p className="text-red-500 font-bold text-sm">{error}</p>}
          <button onClick={handleSubmission} disabled={submitting} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl">{submitting ? 'جاري الرفع...' : 'إرسال البلاغ'}</button>
        </>
      )}
    </div>
  );
};

const DonateUnifiedView = ({ reports, onDonate }) => (
    <div className="py-8 space-y-6 animate-in fade-in text-right pb-20">
       <h2 className="text-3xl font-black text-slate-800 pr-4 border-r-4 border-green-600">صندوق الإعمار</h2>
       <div className="grid gap-4 md:grid-cols-2">
          {reports && reports.length > 0 ? reports.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                  <img src={r.img} className="w-full h-40 object-cover rounded-2xl mb-4" alt="repair"/>
                  <h4 className="font-bold text-lg mb-2">{r.location}</h4>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-4"><span>تم جمع: {r.collected}</span><span>الهدف: {r.goal}</span></div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mb-4"><div className="h-full bg-green-500 rounded-full" style={{width: `${Math.min((r.collected/r.goal)*100, 100)}%`}}></div></div>
                  <button onClick={() => onDonate(r, 'road')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">تبرع الآن</button>
              </div>
          )) : <p className="text-center text-slate-400 py-10">لا توجد مشاريع بحاجة للتبرع حالياً.</p>}
       </div>
    </div>
);

const NashmiAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'يا هلا! أنا نشمي 🇯🇴، مساعدك الذكي. كيف بقدر أساعدك؟' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pose, setPose] = useState(NASHMI_POSES.welcome);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    setPose(NASHMI_POSES.thinking);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `أنت "نشمي"، مساعد ذكي لمنصة "طريقنا الوطنية". رد باختصار ولهجة أردنية. السؤال: ${userMsg}` }] }]
        })
      });
      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، صار في خلل.";
      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
      setPose(NASHMI_POSES.explaining);
      setTimeout(() => setPose(NASHMI_POSES.welcome), 5000);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "نت ضعيف." }]);
      setPose(NASHMI_POSES.alert);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed bottom-24 right-4 z-[90] flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-3xl shadow-2xl border-2 border-slate-100 overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-full overflow-hidden border-2 border-green-500"><img src={NASHMI_POSES.welcome} className="w-full h-full object-cover"/></div><div><p className="font-black text-sm">نشمي AI</p><p className="text-[10px] text-green-400">مساعد طريقنا</p></div></div><button onClick={() => setIsOpen(false)}><X size={18}/></button></div>
          <div className="h-64 bg-slate-50 p-4 overflow-y-auto space-y-3">{messages.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-2xl text-xs font-bold ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-slate-700 shadow-sm rounded-bl-none'}`}>{msg.text}</div></div>))}</div>
          <div className="p-3 bg-white border-t flex gap-2"><input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="اكتب..." className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none text-right" /><button onClick={handleSend}><Send size={16} className="rotate-180 text-slate-900"/></button></div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="pointer-events-auto group relative w-20 h-20 transition-transform hover:scale-105 active:scale-95"><div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-40 animate-pulse"></div><div className="relative w-full h-full"><img src={pose} className="w-full h-full object-contain drop-shadow-xl" /></div></button>
    </div>
  );
};

const DetailedCard = ({ item, onDonate, onInfo }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all text-right group">
     <div className="relative h-48 rounded-[2rem] overflow-hidden mb-4"><img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Card img"/><div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-black">{item.streetType}</div></div>
     <h4 className="font-black text-lg text-slate-800 truncate mb-1">{item.location}</h4>
     <div className="flex justify-between items-center mt-2"><div className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={14}/> {item.city || 'الأردن'}</div><button onClick={() => { if(onInfo) onInfo(item); }} className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl text-xs font-black">التفاصيل</button></div>
     {onDonate && <button onClick={() => onDonate(item)} className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Heart size={16}/> تبرع</button>}
  </div>
);

const Footer = ({ setView }) => (
  <footer className="bg-white border-t border-slate-100 pt-16 pb-32 mt-20 px-6 text-right">
     <div className="grid grid-cols-2 gap-8"><div className="space-y-4"><h4 className="font-black">عن طريقنا</h4><p className="text-xs text-slate-500 leading-relaxed">المنصة الوطنية للرصد والتطوير التشاركي.</p></div><div className="space-y-4"><h4 className="font-black">روابط</h4><ul className="text-xs space-y-2 text-slate-500"><li onClick={() => setView('partner-portal')} className="cursor-pointer hover:text-green-600">الشركاء</li><li>سياسة الخصوصية</li></ul></div></div>
     <div className="mt-8 pt-8 border-t border-slate-100 text-center text-[10px] font-bold text-slate-400">© 2025 Tareeqna Jordan</div>
  </footer>
);

const PartnerLogin = ({ onLogin, onBack }) => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-center"><div className="bg-white w-full max-w-sm p-10 rounded-[3rem] space-y-6"><div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600"><Lock size={40}/></div><h2 className="text-2xl font-black">بوابة الشركاء</h2><input className="w-full p-4 bg-slate-50 rounded-2xl text-center font-black outline-none" placeholder="CODE" onChange={(e) => { if(e.target.value === 'JORDAN2030') onLogin(); }} /><button onClick={onBack} className="text-slate-400 font-bold text-sm">عودة</button></div></div>
);

// --- 4. المكون الرئيسي App (يأتي في النهاية دائماً) ---

const App = () => {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState(DEMO_REPORTS);
  const [teams, setTeams] = useState(DEMO_TEAMS);
  const [activeData, setActiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  // إخفاء شاشة التحميل بعد ثانيتين
  useEffect(() => { setTimeout(() => setLoading(false), 2000); }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 rtl text-right" style={{ fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[60] p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-green-600 p-2 rounded-xl text-white"><TrendingUp size={24} /></div>
          <TareeqnaLogo />
        </div>
        <button onClick={() => setView('landing')} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Trophy size={20}/></button>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-32 pt-6">
        {view === 'landing' && <LandingView setView={setView} reports={reports} sponsors={SPONSORS} />}
        {view === 'roads' && <div className="space-y-6"><h2 className="text-2xl font-black">الشوارع</h2><div className="grid gap-6">{reports.filter(r => r.type === 'road').map(item => <DetailedCard key={item.id} item={item} onDonate={() => { setActiveData(item); setView('payment'); }} onInfo={() => { setActiveData(item); setView('detail'); }} />)}</div></div>}
        {view === 'stadiums' && <div className="space-y-6"><h2 className="text-2xl font-black">الملاعب</h2><div className="grid gap-6">{reports.filter(r => r.type === 'stadium').map(item => <DetailedCard key={item.id} item={item} onDonate={() => { setActiveData(item); setView('payment'); }} onInfo={() => { setActiveData(item); setView('detail'); }} />)}</div></div>}
        {view === 'volunteering' && <VolunteeringHub teams={teams} user={user} onBack={() => setView('landing')} setView={setView} setActiveData={setActiveData} />}
        {view === 'join-team' && <JoinTeamForm team={activeData} onBack={() => setView('volunteering')} onSuccess={() => setView('volunteering')} />}
        {view === 'create-team' && <VolunteeringHub teams={teams} user={user} onBack={() => setView('volunteering')} setView={setView} setActiveData={setActiveData} initialMode="create" />}
        {view === 'detail' && <DetailView item={activeData} onBack={() => setView('landing')} onDonate={() => setView('payment')} />}
        {view === 'payment' && <PaymentSimulation item={activeData} onBack={() => setView('detail')} onSuccess={() => setView('landing')} />}
        {view === 'partner-portal' && <PartnerLogin onLogin={() => setView('odoo-dashboard')} onBack={() => setView('landing')} />}
        {view === 'odoo-dashboard' && <OdooDashboard onLogout={() => setView('landing')} />}
        {view === 'report' && <CameraReportView onComplete={() => setView('landing')} user={user} />}
        {view === 'donate' && <DonateUnifiedView reports={reports} onDonate={(item) => { setActiveData(item); setView('payment'); }} />}
      </main>

      <Footer setView={setView} />
      <NashmiAI />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[96%] max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-2 flex justify-around items-center z-[70] shadow-2xl border border-white/10">
        <NavBtn icon={<Home />} label="الرئيسية" active={view === 'landing'} onClick={() => setView('landing')} />
        <NavBtn icon={<HandHeart />} label="تطوع" active={view === 'volunteering'} onClick={() => setView('volunteering')} />
        <div className="relative -top-6"><button onClick={() => setView('report')} className="bg-green-600 text-white p-4 rounded-[2rem] shadow-2xl border-[6px] border-[#F8FAFC]"><Plus size={28} strokeWidth={3} /></button></div>
        <NavBtn icon={<Building2 />} label="ملاعب" active={view === 'stadiums'} onClick={() => setView('stadiums')} />
        <NavBtn icon={<Wallet />} label="تبرع" active={view === 'donate'} onClick={() => setView('donate')} />
      </nav>
    </div>
  );
};

export default App;
