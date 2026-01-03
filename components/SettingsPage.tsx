
import React from 'react';
import { AISettings } from '../types.ts';
import { UI_THEMES, SYSTEM_MODELS } from '../constants.ts';
import { 
  Sliders, Shield, Monitor, Key, 
  Flame, Zap, Save, RefreshCcw, Bell, ExternalLink
} from 'lucide-react';

interface SettingsPageProps {
  settings: AISettings;
  onUpdate: (s: Partial<AISettings>) => void;
  onOpenKeyDialog?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdate, onOpenKeyDialog }) => {
  return (
    <div className="flex-1 overflow-y-auto p-10 bg-[#0a0500] custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600/10 rounded-2xl">
              <Sliders className="text-orange-500" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">إعدادات ليث AI</h1>
              <p className="text-slate-500 font-medium">تحكم في قوة المحرك وتجربة المستخدم.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-10">
          {/* Key Management */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-sm font-black text-orange-500 uppercase tracking-[0.3em]">
              <Key size={20} /> بوابة الربط (API)
            </div>
            <div className="glass p-8 rounded-[40px] border-orange-500/10 space-y-6 bg-black/40">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-orange-600/5 border border-orange-500/10 rounded-3xl">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-orange-600/20 flex items-center justify-center text-orange-500">
                    <Zap size={28} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">مفتاح API الفعال</p>
                    <p className="text-sm text-slate-500">يتم سحب المفتاح من بيئة التشغيل الرسمية.</p>
                  </div>
                </div>
                <button 
                  onClick={onOpenKeyDialog}
                  className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-orange-600/20 active:scale-95 flex items-center gap-2"
                >
                  <RefreshCcw size={18} /> تغيير المفتاح
                </button>
              </div>
              <p className="text-xs text-slate-500 px-2 flex items-center gap-2">
                <Flame size={12} className="text-orange-500" /> 
                ملاحظة: يتطلب ليث مفتاحاً من مشروع GCP مدفوع لتشغيل Veo و Gemini 3 Pro.
              </p>
            </div>
          </section>

          {/* AI Configuration */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-sm font-black text-red-500 uppercase tracking-[0.3em]">
              <Zap size={20} /> محرك المعالجة
            </div>
            <div className="glass p-8 rounded-[40px] border-orange-500/10 space-y-8 bg-black/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400">الموديل النشط</label>
                  <select 
                    value={settings.modelName}
                    onChange={(e) => onUpdate({ modelName: e.target.value })}
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-500/30 text-sm text-white"
                  >
                    {SYSTEM_MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400">درجة الحرارة (الإبداع): {settings.temperature}</label>
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={settings.temperature}
                    onChange={(e) => onUpdate({ temperature: parseFloat(e.target.value) })}
                    className="w-full accent-orange-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>منطقي</span>
                    <span>مبدع ناري</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400">هوية ليث (التعليمات البرمجية)</label>
                <textarea 
                  value={settings.systemInstruction}
                  onChange={(e) => onUpdate({ systemInstruction: e.target.value })}
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl p-6 min-h-[150px] outline-none focus:ring-2 focus:ring-orange-500/30 text-sm leading-relaxed text-white"
                />
              </div>
            </div>
          </section>
        </div>

        <footer className="pt-10 border-t border-orange-500/5 flex justify-end gap-4">
          <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-tr from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-xl shadow-orange-600/30 transition-all font-black text-sm active:scale-95">
            <Save size={18} /> حفظ جميع الإعدادات
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsPage;
