
import React, { useState } from 'react';
import { AppMode, ImageStyle } from '../types.ts';
import { IMAGE_STYLES } from '../constants.ts';
import { generateImagePro, generateVideo } from '../services/geminiService.ts';
import { 
  Sparkles, Download, Layers, Monitor, 
  Smartphone, Loader2, History, 
  Image as ImageIcon, Flame, Camera, Sliders, Palette
} from 'lucide-react';

interface GenerativeWindowProps {
  mode: AppMode;
}

const GenerativeWindow: React.FC<GenerativeWindowProps> = ({ mode }) => {
  const [prompt, setPrompt] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>(IMAGE_STYLES[0].id);
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [quality, setQuality] = useState<string>("1K");
  const [history, setHistory] = useState<{url: string, prompt: string}[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResultUrl(null);

    const style = IMAGE_STYLES.find(s => s.id === selectedStyle);

    try {
      if (mode === AppMode.IMAGE) {
        const finalPrompt = `${prompt}, ${style?.promptSuffix}`;
        const url = await generateImagePro(finalPrompt, { aspectRatio, size: quality });
        if (url) {
          setResultUrl(url);
          setHistory(prev => [{url, prompt}, ...prev].slice(0, 10));
        }
      } else {
        const url = await generateVideo(prompt, aspectRatio);
        setResultUrl(url);
      }
    } catch (error) {
      console.error(error);
      alert('🔥 محرك ليث يواجه ضغطاً: تأكد من مفتاح API والاتصال.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0500] overflow-hidden p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 w-full h-full">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8 overflow-y-auto custom-scrollbar pr-4">
          <header className="space-y-2">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
                 <Flame className="text-white fill-white" size={28} />
               </div>
               <div>
                 <h1 className="text-3xl font-black text-white">{mode === AppMode.IMAGE ? 'خيال ليث' : 'سينما ليث'}</h1>
                 <p className="text-orange-500/60 font-black text-[10px] uppercase tracking-widest">Ultra Gen Engine</p>
               </div>
            </div>
          </header>

          <div className="glass p-8 rounded-[40px] border-orange-500/10 space-y-8 bg-black/40">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">وصف المشهد</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="تنين ناري يخرج من بركان، تفاصيل سينمائية، 8k..."
                className="w-full bg-slate-900/50 border border-white/5 rounded-3xl p-6 min-h-[160px] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all text-white text-sm resize-none custom-scrollbar shadow-inner"
              />
            </div>

            {mode === AppMode.IMAGE && (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Palette size={14} /> النمط</label>
                <div className="grid grid-cols-2 gap-3">
                  {IMAGE_STYLES.slice(0, 4).map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 rounded-2xl border text-[11px] font-black transition-all ${
                        selectedStyle === style.id ? 'bg-orange-600 border-orange-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-2xl ${
                loading || !prompt.trim() 
                ? 'bg-slate-800 text-slate-600' 
                : 'bg-gradient-to-tr from-orange-600 to-red-600 text-white shadow-orange-600/40 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} className="fill-current" />}
              {loading ? 'Nexus Computing...' : 'توليد السحر'}
            </button>
          </div>
        </div>

        {/* Display Area */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex-1 relative glass rounded-[60px] border-orange-500/10 overflow-hidden flex items-center justify-center bg-[#0d0700] shadow-2xl group border-2">
            {loading ? (
              <div className="flex flex-col items-center gap-8 animate-pulse">
                <div className="w-40 h-40 rounded-full border-t-4 border-orange-600 animate-spin"></div>
                <div className="text-center">
                  <p className="text-3xl font-black text-white">ليث يصنع المستحيل...</p>
                  <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Neural Fire Forge</p>
                </div>
              </div>
            ) : resultUrl ? (
              mode === AppMode.IMAGE ? (
                <img src={resultUrl} className="w-full h-full object-contain p-4 rounded-[50px]" alt="" />
              ) : (
                <video src={resultUrl} controls autoPlay loop className="w-full h-full object-contain" />
              )
            ) : (
              <div className="text-center space-y-6 opacity-20">
                <Flame size={160} className="mx-auto text-orange-600" strokeWidth={0.5} />
                <p className="text-orange-600 text-3xl font-black uppercase tracking-[0.6em]">Nexus Studio</p>
              </div>
            )}

            {resultUrl && (
              <button className="absolute bottom-10 right-10 p-5 bg-orange-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                <Download size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerativeWindow;
