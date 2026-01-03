
import React, { useMemo } from 'react';
import { ChatSession } from '../types.ts';
import { simulateTokenCount } from '../utils/helpers.ts';
import { 
  Activity, Zap, Database, Clock, 
  BarChart3, PieChart, TrendingUp, Cpu
} from 'lucide-react';

interface DashboardProps {
  sessions: ChatSession[];
}

const Dashboard: React.FC<DashboardProps> = ({ sessions }) => {
  const stats = useMemo(() => {
    let totalMessages = 0;
    let totalTokens = 0;
    sessions.forEach(s => {
      totalMessages += s.messages.length;
      s.messages.forEach(m => totalTokens += simulateTokenCount(m.text));
    });
    return {
      sessionsCount: sessions.length,
      messagesCount: totalMessages,
      tokensCount: totalTokens,
      avgResponseTime: "1.2s",
      successRate: "99.8%"
    };
  }, [sessions]);

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-slate-950 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white">تحليلات Nexus</h1>
            <p className="text-slate-500 font-medium">مراقبة الأداء واستهلاك الموارد في الوقت الفعلي.</p>
          </div>
          <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-white/5">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">اليوم</button>
            <button className="px-4 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all">الأسبوع</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'إجمالي الجلسات', val: stats.sessionsCount, icon: <Database />, color: 'text-blue-500' },
            { label: 'الرسائل المعالجة', val: stats.messagesCount, icon: <Activity />, color: 'text-purple-500' },
            { label: 'التوكنز المستهلكة', val: stats.tokensCount.toLocaleString(), icon: <Zap />, color: 'text-amber-500' },
            { label: 'متوسط الاستجابة', val: stats.avgResponseTime, icon: <Clock />, color: 'text-green-500' },
          ].map((item, i) => (
            <div key={i} className="glass p-6 rounded-3xl border-white/5 space-y-4 hover:border-blue-500/30 transition-all group">
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                <p className="text-3xl font-black text-white mt-1">{item.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass p-8 rounded-[40px] border-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2"><BarChart3 className="text-blue-500" /> توزيع النشاط</h3>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <div className="h-64 w-full flex items-end gap-2 px-2">
              {[40, 70, 45, 90, 65, 85, 30, 55, 75, 60, 95, 50].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg opacity-40 hover:opacity-100 transition-all cursor-pointer" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:59</span>
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] border-white/5 space-y-8">
            <h3 className="text-lg font-bold flex items-center gap-2"><PieChart className="text-purple-500" /> ميزات النظام</h3>
            <div className="space-y-6">
              {[
                { label: 'الدردشة النصية', val: 65, color: 'bg-blue-500' },
                { label: 'توليد الصور', val: 20, color: 'bg-purple-500' },
                { label: 'توليد الفيديو', val: 10, color: 'bg-pink-500' },
                { label: 'الرؤية الحاسوبية', val: 5, color: 'bg-amber-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white">{item.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20 flex items-center gap-4">
              <Cpu className="text-blue-400 animate-pulse" size={32} />
              <div>
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest">محرك الحالة</p>
                <p className="text-[10px] text-slate-400">نظام Nexus يعمل بكامل طاقته بدون اختناقات.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
