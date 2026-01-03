
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import ChatWindow from './components/ChatWindow.tsx';
import GenerativeWindow from './components/GenerativeWindow.tsx';
import VoiceWindow from './components/VoiceWindow.tsx';
import Dashboard from './components/Dashboard.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import { AppMode, ChatSession, Message, AISettings } from './types.ts';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.CHAT);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

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
    setSessions(prev => {
      const updated = prev.map(session => {
        if (session.id === activeSessionId) {
          let title = session.title;
          if (newMessages.length > 0 && (session.title === 'مهمة جديدة لليث' || session.title === 'محادثة جديدة')) {
             title = newMessages[0].text.slice(0, 30);
          }
          return { ...session, messages: newMessages, title, updatedAt: Date.now() };
        }
        return session;
      });
      localStorage.setItem('nexus_sessions', JSON.stringify(updated));
      return updated;
    });
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
          const updated = sessions.filter(s => s.id !== id);
          setSessions(updated);
          localStorage.setItem('nexus_sessions', JSON.stringify(updated));
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
