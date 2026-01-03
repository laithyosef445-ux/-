
import React, { useState, useRef, useEffect } from 'react';
import { getAI } from '../services/geminiService.ts';
import { Modality, LiveServerMessage } from '@google/genai';
import { Mic, Volume2, Loader2, Play, Square, Settings2, Globe2 } from 'lucide-react';

// Manual implementation of encoding/decoding as required by guidelines.
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceWindow: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('جاهز للتحدث');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  // Cursor to track end of playback queue for gapless playback.
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const drawVisualizer = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const r = 100 + (i * 2);
        const g = 50 + (i * 5);
        const b = 255;
        
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    render();
  };

  const startSession = async () => {
    try {
      setIsProcessing(true);
      setStatus('جاري ربط القنوات الصوتية...');
      const ai = getAI();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      
      const analyser = inputCtx.createAnalyser();
      const source = inputCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      drawVisualizer(analyser);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('متصل: تحدث الآن');
            setIsActive(true);
            setIsProcessing(false);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Crucial: Use sessionPromise to avoid stale closures.
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString =
              message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              setStatus('Nexus يتحدث...');
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputCtx.currentTime,
              );
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputCtx,
                24000,
                1,
              );
              const sourceNode = outputCtx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(outputCtx.destination);
              sourceNode.addEventListener('ended', () => {
                sourcesRef.current.delete(sourceNode);
                if (sourcesRef.current.size === 0) setStatus('متصل: استماع...');
              });

              // Schedule playback for gapless experience.
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const s of sourcesRef.current.values()) {
                s.stop();
                sourcesRef.current.delete(s);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => { 
            console.error('Gemini Live Error:', e); 
            stopSession(); 
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: 'أنت مساعد صوتي ذكي جداً وسريع البديهة. تستخدم لغة عربية فصيحة وراقية.'
        }
      });
    } catch (e) {
      console.error(e);
      alert('خطأ في الوصول للميكروفون');
      setIsProcessing(false);
    }
  };

  const stopSession = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    cancelAnimationFrame(animationFrameRef.current);
    setIsActive(false);
    setStatus('جاهز للتحدث');
    nextStartTimeRef.current = 0;
    sourcesRef.current.clear();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-6">
      <div className="max-w-4xl w-full flex flex-col items-center space-y-12">
        
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Globe2 className="text-blue-500 animate-spin-slow" size={20} />
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Real-time Neural Engine</span>
          </div>
          <h1 className="text-5xl font-black text-white">Nexus Voice</h1>
          <p className="text-slate-500 font-medium">محادثة صوتية طبيعية بدون تأخير مع وعي كامل بالسياق.</p>
        </div>

        <div className="relative w-full glass rounded-[60px] p-16 border-white/5 overflow-hidden flex flex-col items-center shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          
          <div className="mb-12 h-40 w-full max-w-xl">
             <canvas ref={canvasRef} width={600} height={160} className="w-full h-full opacity-60" />
          </div>

          <div className="relative z-10 space-y-8 flex flex-col items-center">
            <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-700 shadow-[0_0_80px_rgba(59,130,246,0.1)] ${
              isActive ? 'bg-blue-600 ring-[20px] ring-blue-500/10 scale-110 shadow-blue-500/40' : 'bg-slate-800 ring-[20px] ring-white/5'
            }`}>
              <Mic size={56} className={`${isActive ? 'text-white animate-pulse' : 'text-slate-500'}`} />
            </div>

            <div className="text-center space-y-2">
              <p className="text-2xl font-black text-white tracking-tight">{status}</p>
              <div className="flex items-center gap-2 justify-center">
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{isActive ? 'Session Active' : 'Standby'}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
               <button onClick={() => {}} className="p-4 glass rounded-2xl text-slate-400 hover:text-white transition-all border-white/5"><Settings2 size={24} /></button>
               <button
                  onClick={isActive ? stopSession : startSession}
                  disabled={isProcessing}
                  className={`px-12 py-5 rounded-[28px] font-black text-lg tracking-widest uppercase flex items-center gap-4 transition-all shadow-2xl ${
                    isActive ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30'
                  }`}
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : (isActive ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />)}
                  {isActive ? 'إيقاف' : 'بدء المحادثة'}
               </button>
               <button onClick={() => {}} className="p-4 glass rounded-2xl text-slate-400 hover:text-white transition-all border-white/5"><Volume2 size={24} /></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
          {[
            { label: 'ترميز PCM', val: '16kHz' },
            { label: 'زمن الاستجابة', val: '< 200ms' },
            { label: 'الذكاء العاطفي', val: 'V3.1' }
          ].map((stat, i) => (
            <div key={i} className="glass p-4 rounded-2xl border-white/5 text-center space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-sm font-bold text-blue-400">{stat.val}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
};

export default VoiceWindow;
