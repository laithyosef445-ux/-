
import React, { useState, useRef, useEffect } from 'react';
import { Message, AppMode, ChatSession } from '../types.ts';
import { AI_PERSONAS } from '../constants.ts';
import { chatWithGeminiStream, analyzeImage } from '../services/geminiService.ts';
import { 
  Send, ImagePlus, Loader2, User, Flame, 
  Copy, Check, Terminal, 
  BrainCircuit, Zap,
  CheckCheck, Clock, Lightbulb, Sparkles
} from 'lucide-react';

interface ChatWindowProps {
  mode: AppMode;
  session: ChatSession | null;
  onUpdateSession: (messages: Message[]) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ mode, session, onUpdateSession }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState(AI_PERSONAS[0].id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = session?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, streamingText, loading]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const persona = AI_PERSONAS.find(p => p.id === selectedPersona);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    onUpdateSession(newMessages);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setStreamingText('');

    try {
      if (selectedImage) {
        const result = await analyzeImage(selectedImage, currentInput || "حلل الصورة");
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: result,
          timestamp: Date.now()
        };
        onUpdateSession([...newMessages, assistantMsg]);
      } else {
        const fullResponse = await chatWithGeminiStream(
          currentInput, 
          newMessages, 
          (chunk) => setStreamingText(chunk),
          { 
            customSettings: { systemInstruction: persona?.instruction },
            isThinking: isThinking 
          }
        );

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: fullResponse,
          timestamp: Date.now()
        };
        onUpdateSession([...newMessages, assistantMsg]);
      }
    } catch (error: any) {
      onUpdateSession([...newMessages, {
        id: Date.now().toString(),
        role: 'assistant',
        text: `🔥 حدث خطأ في محرك ليث: ${error.message}`,
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
      setStreamingText('');
      setSelectedImage(null);
    }
  };

  const renderText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const codeContent = part.replace(/```/g, '').trim();
        const lang = codeContent.split('\n')[0] || 'code';
        const code = codeContent.split('\n').slice(1).join('\n');
        return (
          <div key={i} className="my-6 rounded-3xl overflow-hidden border border-orange-500/20 bg-slate-950 shadow-2xl">
            <div className="bg-slate-900 px-6 py-3 flex justify-between items-center border-b border-white/5">
              <span className="text-[10px] text-orange-400 font-black uppercase flex items-center gap-2 tracking-widest">
                <Terminal size={14} /> {lang}
              </span>
              <button onClick={() => {
                navigator.clipboard.writeText(code);
                setCopiedId(`code-${i}`);
                setTimeout(() => setCopiedId(null), 2000);
              }} className="text-slate-500 hover:text-white transition-all p-2 rounded-lg">
                {copiedId === `code-${i}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
            <pre className="p-6 overflow-x-auto text-sm leading-relaxed text-orange-200 font-mono custom-scrollbar">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return <p key={i} className="whitespace-pre-wrap mb-4 text-[16px] leading-relaxed font-medium">{part}</p>;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0500] relative overflow-hidden font-['IBM_Plex_Sans_Arabic']">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.15),transparent_50%)] pointer-events-none"></div>
      
      <header className="p-6 glass flex justify-between items-center z-10 border-b border-orange-500/10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Flame size={32} className="text-white fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-black text-white text-2xl tracking-tight">ليث AI</h2>
              <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 text-[10px] font-black border border-orange-500/20">خارق بمفتاح ليث</span>
            </div>
            <div className="flex items-center gap-4 mt-1">
               <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest"><Zap size={10} className="text-orange-500" /> {isThinking ? 'Deep Thinking On' : 'Turbo Mode'}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsThinking(!isThinking)}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs transition-all border ${
            isThinking 
            ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-600/30' 
            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <BrainCircuit size={18} className={isThinking ? 'animate-pulse' : ''} />
          {isThinking ? 'وضع العبقري مفعل' : 'تفعيل التفكير العميق'}
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar relative">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-10 max-w-2xl mx-auto">
            <div className="w-28 h-28 rounded-[40px] bg-orange-600/10 flex items-center justify-center border border-orange-500/20 shadow-2xl relative">
              <div className="absolute inset-0 bg-orange-500/20 blur-2xl animate-pulse rounded-full"></div>
              <Sparkles size={64} className="text-orange-500 relative z-10" />
            </div>
            <div className="space-y-4">
              <h3 className="text-5xl font-black text-white tracking-tighter">جاهز للانطلاق يا ليث</h3>
              <p className="text-slate-400 text-xl font-medium leading-relaxed">
                مفتاحك من نوع <span className="text-orange-500">AIza...</span> هو المفتاح المثالي. أنا الآن في قمة قوتي، اطلب ما تشاء!
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-8 group animate-in slide-in-from-bottom-5 duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xl border transition-all ${
              msg.role === 'user' ? 'bg-orange-600 border-orange-400/50 text-white' : 'bg-slate-900 border-white/10 text-orange-500'
            }`}>
              {msg.role === 'user' ? <User size={28} /> : <Flame size={28} />}
            </div>
            
            <div className={`max-w-[80%] space-y-3 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`relative p-8 rounded-[40px] shadow-2xl border ${
                msg.role === 'user' 
                ? 'bg-orange-600/90 text-white rounded-tr-none border-orange-400/20' 
                : 'glass rounded-tl-none border-orange-500/5'
              }`}>
                {msg.image && <img src={msg.image} className="mb-6 rounded-3xl border border-white/10 max-w-xl" />}
                <div className="text-[17px] leading-[1.8] font-medium tracking-wide">
                  {renderText(msg.text)}
                </div>
              </div>
              <div className="px-4 text-[10px] font-black text-slate-500 flex items-center gap-2">
                <Clock size={10} /> {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                {msg.role === 'user' && <CheckCheck size={12} className="text-orange-500" />}
              </div>
            </div>
          </div>
        ))}

        {(streamingText || loading) && (
          <div className="flex gap-8 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-orange-500/20 flex items-center justify-center shrink-0">
              <Loader2 size={28} className="text-orange-500 animate-spin" />
            </div>
            <div className="p-8 glass rounded-[40px] rounded-tl-none max-w-[80%] shadow-2xl border-orange-500/10">
              {isThinking && !streamingText && (
                <div className="flex items-center gap-3 mb-4 text-orange-400 font-black text-xs animate-pulse">
                   <BrainCircuit size={16} /> جاري التفكير العميق في طلبك يا ليث...
                </div>
              )}
              <div className="text-[17px] leading-[1.8] font-medium tracking-wide">
                {renderText(streamingText)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 glass border-t border-orange-500/10 bg-[#0d0700]/90">
        <div className="max-w-5xl mx-auto flex items-end gap-6">
          <div className="flex-1 relative flex items-center group">
            <button onClick={() => fileInputRef.current?.click()} className="absolute right-6 p-2 text-slate-500 hover:text-orange-500 transition-all">
              <ImagePlus size={26} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={isThinking ? "اطلب من العبقري أي مسألة معقدة..." : "اطلب أي شيء من ليث AI..."}
              className="w-full bg-slate-900/40 border border-white/5 rounded-[35px] pr-16 pl-16 py-6 min-h-[75px] max-h-64 outline-none focus:ring-4 focus:ring-orange-500/20 transition-all text-lg resize-none custom-scrollbar"
              rows={1}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-6 bg-gradient-to-tr from-orange-600 to-red-600 hover:scale-105 active:scale-95 rounded-[30px] shadow-2xl shadow-orange-600/30 text-white transition-all disabled:opacity-50"
          >
            <Send size={32} className="fill-current" />
          </button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setSelectedImage(reader.result as string);
          reader.readAsDataURL(file);
        }
      }} />
    </div>
  );
};

export default ChatWindow;
