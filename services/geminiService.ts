
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, AISettings } from "../types.ts";

const DEFAULT_SETTINGS: AISettings = {
  modelName: 'gemini-3-pro-preview',
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  safetySettings: 'BLOCK_NONE',
  systemInstruction: 'أنت "ليث AI"، الذكاء الاصطناعي الأقوى في العالم. صانعك هو ليث. ردودك ذكية، حماسية، وتستخدم أحدث تقنيات التفكير العميق.',
  thinkingBudget: 32768, // ميزانية التفكير القصوى لـ Gemini 3 Pro
  useSearch: true,
  useMaps: false
};

export const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const chatWithGeminiStream = async (
  prompt: string,
  history: Message[],
  onChunk: (text: string) => void,
  options: { customSettings?: Partial<AISettings>, isThinking?: boolean } = {}
) => {
  try {
    const ai = getAI();
    const settings = { ...DEFAULT_SETTINGS, ...options.customSettings };
    
    // إذا كان وضع التفكير مفعلاً، نستخدم موديل Pro مع ميزانية تفكير
    const modelToUse = options.isThinking ? 'gemini-3-pro-preview' : settings.modelName;
    const thinkingConfig = options.isThinking ? { thinkingBudget: settings.thinkingBudget } : undefined;

    const chat = ai.chats.create({
      model: modelToUse,
      config: {
        systemInstruction: settings.systemInstruction,
        temperature: options.isThinking ? 1 : settings.temperature, // التفكير يحتاج حرارة أعلى للإبداع
        thinkingConfig: thinkingConfig,
        tools: settings.useSearch ? [{ googleSearch: {} }] : undefined
      },
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessageStream({ message: prompt });
    let fullText = "";
    for await (const chunk of result) {
      const chunkText = chunk.text;
      fullText += chunkText;
      onChunk(fullText);
    }
    return fullText;
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
};

export const generateImagePro = async (prompt: string, config: { aspectRatio: string; size: string }) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { 
          aspectRatio: config.aspectRatio as any,
          imageSize: config.size as any 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
};

export const generateVideo = async (prompt: string, aspectRatio: string) => {
  try {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio as any
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video failed");
    
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
};

const handleApiError = (error: any) => {
  console.error("ليث AI - خطأ في المحرك:", error);
  if (error.message?.includes("API_KEY_MISSING") || error.message?.includes("Requested entity was not found") || error.status === 401) {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      window.aistudio.openSelectKey();
    }
  }
};

export const analyzeImage = async (imageB64: string, prompt: string) => {
  const ai = getAI();
  const match = imageB64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return "خطأ في الصورة";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: match[2], mimeType: match[1] } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};
