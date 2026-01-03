
import { Message } from '../types.ts';

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const exportToMarkdown = (messages: Message[]) => {
  let content = "# Nexus AI Chat Export\n\n";
  messages.forEach(m => {
    content += `### ${m.role === 'user' ? 'User' : 'Nexus AI'} (${new Date(m.timestamp).toLocaleString()})\n`;
    content += `${m.text}\n\n`;
    if (m.image) content += `![Image](${m.image})\n\n`;
    content += "---\n\n";
  });
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexus_chat_${Date.now()}.md`;
  a.click();
};

export const simulateTokenCount = (text: string) => {
  return Math.ceil(text.length / 4);
};

export const generateId = () => Math.random().toString(36).substring(2, 15);
