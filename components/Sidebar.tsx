
import React, { useState } from 'react';
import { AppMode, ChatSession } from '../types.ts';
import { 
  MessageSquare, Image, Video, Mic, Settings, 
  LayoutDashboard, Plus, Trash2, Search, Flame, Key,
  ShieldCheck, Zap
} from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onOpenKeyDialog: () => void; // إضافة التابع هنا
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentMode, setMode, sessions, activeSessionId, 
  onSelectSession, onNewChat, onDeleteSession, onOpenKeyDialog
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navItems = [
    { mode: AppMode.CHAT, icon: <MessageSquare size={18} />, label: 'دردشة ليث', color: 'text-orange-500' },
    { mode: AppMode.IMAGE, icon: <Image size={18} />, label: 'خيال ليث (صور)', color: 'text-red-500' },
    { mode: AppMode.VIDEO, icon: <Video size={18} />, label: 'سينما ليث', color: 'text-orange-400' },
    { mode: AppMode.VOICE, icon: <Mic size={18} />, label: 'نداء ليث المباشر', color: 'text-red-400' },
  ];

  return (
    <div className="w-80 glass border-l border-orange-500/10 h-full flex flex-col overflow-hidden shadow-2xl z-20 bg-[#0d0700]/80">
      {/* Brand */}
      <div className="p-8 border-b border-orange-500/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
             <Flame className="text-white fill-white" size={24} />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter text-white">ليث AI</h1>
            <span className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em]">Fire Engine v5</span>
          </div>
        </div>

        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-2xl transition-all text-sm font-black shadow-lg shadow-orange-600/20 active:scale-95 text-white"
        >
          <Plus size={20} /> مهمة جديدة
        </button>
      </div>

      {/* Navigation */}
      <div className="px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => setMode(item.mode)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
              currentMode === item.mode 
              ? 'bg-orange-600/10 border border-orange-500/20' 
              : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`${currentMode === item.mode ? item.color : 'text-slate-500'} transition-colors`}>{item.icon}</span>
              <span className={`text-sm font-bold ${currentMode === item.mode ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
            </div>
            {currentMode === item.mode && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_orange]"></div>}
          </button>
        ))}
      </div>

      {/* History */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 mt-4">
        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="بحث في ذكريات ليث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-xl pr-12 pl-4 py-3 text-xs outline-none focus:border-orange-500/30 transition-all text-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-10">
          <div className="space-y-1">
            {filteredSessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group flex items-center gap-4 p-3 rounded-2xl transition-all cursor-pointer border ${
                  activeSessionId === session.id ? 'bg-orange-600/5 border-orange-500/10' : 'border-transparent hover:bg-white/5'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${activeSessionId === session.id ? 'bg-orange-600/20 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
                  <MessageSquare size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate text-slate-200">{session.title}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">{new Date(session.updatedAt).toLocaleTimeString('ar-EG')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-orange-500/5 bg-black/40 space-y-2">
        <div className="flex gap-2">
          <button 
            onClick={() => setMode(AppMode.DASHBOARD)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 transition-all border border-transparent hover:border-orange-500/20"
            title="مركز التحكم"
          >
            <LayoutDashboard size={18} />
          </button>
          <button 
            onClick={onOpenKeyDialog}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600/10 hover:bg-orange-600 text-orange-500 hover:text-white transition-all border border-orange-500/20"
            title="تغيير مفتاح API"
          >
            <Key size={18} />
          </button>
          <button 
            onClick={() => setMode(AppMode.SETTINGS)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-orange-500/10 text-slate-400 hover:text-orange-500 transition-all border border-transparent hover:border-orange-500/20"
            title="الإعدادات"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
