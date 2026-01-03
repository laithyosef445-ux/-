
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import ChatWindow from './components/ChatWindow.tsx';
import GenerativeWindow from './components/GenerativeWindow.tsx';
import VoiceWindow from './components/VoiceWindow.tsx';
import Dashboard from './components/Dashboard.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import { AppMode, ChatSession, Message, AISettings } from './types.ts';
import { Flame, Key, ExternalLink, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.CHAT);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(true);

  const [settings, setSettings] = useState<AISettings>({
    modelName: 'gemini-3-flash-preview',
    temperature: 0.8,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 4096,
    safetySettings: 'BLOCK_NONE',
    systemInstruction: 'أنت "ليث AI"، ذكاء اصطناعي فائق وسريع جداً. صانعك هو الشخص المبدع "ليث" (Laith). يجب أن تظهر روح المساعدة الذكية والفخر باسمك في كل رد. ردودك دائماً مشتعلة بالحماس والذكاء.',
    thinkingBudget: 0,
    useSearch: true,
    useMaps: false
  });

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(!!process.env.API_KEY);
      }
    };
    checkKey();
    
    const saved = localStorage.getItem('nexus_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setActiveSessionId(parsed[0].id);
    } else {
      createNewChat();
    }
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'مهمة جديدة لليث',
      messages: [],
      updatedAt: Date.now(),
      mode: AppMode.CHAT
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setCurrentMode(AppMode.CHAT);
  };

  const updateActiveSession = (newMessages: Message[]) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(session => {
      if (session.id === activeSessionId) {
        let title = session.title;
        if (newMessages.length > 0 && (session.title === 'مهمة جديدة لليث' || session.title === 'محادثة جديدة')) {
           title = newMessages[0].text.slice(0, 30);
        }
        return { ...session, messages: newMessages, title, updatedAt: Date.now() };
      }
      return session;
    }));
  };

  const renderContent = () => {
    const activeSession = sessions.find(s => s.id === activeSessionId) || null;
    
    switch (currentMode) {
      case AppMode.CHAT:
        return <ChatWindow mode={currentMode} session={activeSession} onUpdateSession={updateActiveSession} />;
      case AppMode.IMAGE:
      case AppMode.VIDEO:
        return <GenerativeWindow mode={currentMode} />;
      case AppMode.VOICE:
        return <VoiceWindow />;
      case AppMode.DASHBOARD:
        return <Dashboard sessions={sessions} />;
      case AppMode.SETTINGS:
        return <SettingsPage settings={settings} onUpdate={(s) => setSettings({...settings, ...s})} onOpenKeyDialog={handleOpenKeyDialog} />;
      default:
        return <ChatWindow mode={AppMode.CHAT} session={activeSession} onUpdateSession={updateActiveSession} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0500] text-slate-100 font-['IBM_Plex_Sans_Arabic'] selection:bg-orange-500/30 relative">
      {!hasKey && (
        <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="max-w-xl w-full glass border-orange-500/30 p-12 rounded-[50px] text-center space-y-10 shadow-[0_0_150px_rgba(234,88,12,0.3)] border-2">
            <div className="w-32 h-32 bg-gradient-to-tr from-orange-600 to-red-600 rounded-[40px] mx-auto flex items-center justify-center shadow-2xl relative">
               <div className="absolute inset-0 bg-orange-600 blur-3xl opacity-20 animate-pulse"></div>
               <Key size={64} className="text-white relative z-10" />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-black text-white tracking-tight">نظام ليث AI بانتظارك</h2>
              <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-2xl flex items-start gap-4 text-right">
                <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={24} />
                <p className="text-sm text-orange-200 font-medium leading-relaxed">
                   يا ليث، المحرك يحتاج مفتاح <strong>Google Gemini</strong> حصراً ليعمل. المفاتيح التي تبدأ بـ <code className="bg-black/40 px-2 rounded">sk-</code> لا تعمل هنا لأنها خاصة بـ OpenAI.
                </p>
              </div>
              <p className="text-slate-400 font-medium">
                اضغط على الزر أدناه واختر مفتاحاً من مشروع جوجل الخاص بك لتفعيل "خيال ليث" و "سينما ليث".
              </p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={handleOpenKeyDialog}
                className="w-full py-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-3xl font-black text-xl shadow-2xl shadow-orange-600/40 transition-all active:scale-95 flex items-center justify-center gap-4"
              >
                <Flame size={28} className="fill-current" /> ربط مفتاح ليث المعتمد
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                className="flex items-center justify-center gap-2 text-xs font-black text-slate-500 hover:text-orange-400 transition-colors uppercase tracking-widest"
              >
                احصل على مفتاح Gemini مجاني <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      <Sidebar 
        currentMode={currentMode} 
        setMode={setCurrentMode} 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          const s = sessions.find(x => x.id === id);
          if (s) setCurrentMode(s.mode);
        }}
        onNewChat={createNewChat}
        onDeleteSession={(id) => {
          setSessions(prev => prev.filter(s => s.id !== id));
          if (activeSessionId === id) setActiveSessionId(null);
        }}
        onOpenKeyDialog={handleOpenKeyDialog}
      />
      <main className="flex-1 h-full relative overflow-hidden flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
