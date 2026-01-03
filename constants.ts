
import { ImageStyle, AppMode } from './types.ts';

export const AI_PERSONAS = [
  { id: 'nexus_core', name: 'Nexus Core', icon: 'Zap', desc: 'الذكاء العام المتوازن', instruction: 'أنت النواة المركزية لنظام Nexus. أجِب بذكاء شمولي.' },
  { id: 'coder', name: 'المبرمج الخبير', icon: 'Code', desc: 'متخصص في كتابة وتصحيح الأكواد', instruction: 'أنت مهندس برمجيات محترف. ركز على كفاءة الكود ونظافته.' },
  { id: 'artist', name: 'المبدع الفني', icon: 'Palette', desc: 'متخصص في التصميم والخيال', instruction: 'أنت فنان رقمي مبدع. استخدم لغة بصرية غنية في وصفك.' },
  { id: 'scientist', name: 'الباحث العلمي', icon: 'Beaker', desc: 'تحليل دقيق ومنطقي للبيانات', instruction: 'أنت عالم وباحث. استند إلى الحقائق والمنطق الرياضي.' },
  { id: 'writer', name: 'الكاتب الأدبي', icon: 'PenTool', desc: 'كتابة إبداعية ومحتوى تسويقي', instruction: 'أنت أديب بارع. استخدم استعارات لغوية وبلاغة عربية.' },
  { id: 'legal', name: 'المستشار القانوني', icon: 'Scale', desc: 'تحليل الوثائق والقوانين', instruction: 'أنت مستشار قانوني دقيق. حلل النصوص بحيادية وموضوعية.' },
];

export const IMAGE_STYLES: ImageStyle[] = [
  { id: 'cinematic', name: 'سينمائي', promptSuffix: 'cinematic lighting, 8k, highly detailed, anamorphic lens flares', previewColor: 'bg-blue-900' },
  { id: 'hyperreal', name: 'واقعي فائق', promptSuffix: 'hyper-realistic, macro photography, unreal engine 5 render, ray tracing', previewColor: 'bg-slate-800' },
  { id: 'cyberpunk', name: 'سايبربانك', promptSuffix: 'cyberpunk aesthetic, neon city, futuristic, synthwave color palette', previewColor: 'bg-purple-900' },
  { id: 'anime', name: 'أنمي احترافي', promptSuffix: 'high-quality anime style, Makoto Shinkai aesthetics, vibrant colors', previewColor: 'bg-pink-800' },
  { id: 'oil_paint', name: 'رسم زيتي', promptSuffix: 'thick oil paint texture, canvas grain, expressive brushwork, classical art', previewColor: 'bg-amber-900' },
  { id: 'blueprint', name: 'مخطط هندسي', promptSuffix: 'architectural blueprint, technical drawing, white on blue background', previewColor: 'bg-blue-700' },
  { id: 'vaporwave', name: 'فيبورويف', promptSuffix: 'vaporwave aesthetic, lo-fi, glitch art, 90s nostalgia', previewColor: 'bg-indigo-600' },
  { id: 'pixel', name: 'بكسل آرت', promptSuffix: '16-bit pixel art, retro gaming style, sharp edges', previewColor: 'bg-green-900' },
];

export const SYSTEM_MODELS = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', type: 'Complex Reasoning', tokens: '2M' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', type: 'Speed & Efficiency', tokens: '1M' },
  { id: 'gemini-2.5-flash-lite-latest', name: 'Gemini Flash Lite', type: 'Ultra-low Latency', tokens: '512K' },
];

export const UI_THEMES = [
  { id: 'obsidian', name: 'أوبسيديان', primary: '#020617', secondary: '#1e293b', accent: '#3b82f6' },
  { id: 'midnight', name: 'منتصف الليل', primary: '#000000', secondary: '#111827', accent: '#8b5cf6' },
  { id: 'cyber', name: 'سايبر', primary: '#0a0a0a', secondary: '#1a1a1a', accent: '#ec4899' },
  { id: 'nord', name: 'نورد', primary: '#2e3440', secondary: '#3b4252', accent: '#88c0d0' },
];
