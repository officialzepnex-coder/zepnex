'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const quickReplies = [
  'Show me trending products',
  'Find branded fashion deals',
  'How do I join ZEPNEX?',
  'Track my order status',
];

export default function AIChatAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am ZEPNEX AI Assistant. How can I help you today?',
    },
  ]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setMessage('');

    const reply = (() => {
      if (trimmed.toLowerCase().includes('product')) return 'Here are the latest trending products on ZEPNEX today.';
      if (trimmed.toLowerCase().includes('brand')) return 'You can join ZEPNEX through the Brand page and start listing your products.';
      if (trimmed.toLowerCase().includes('order')) return 'Your order updates are available in the cart and checkout flow.';
      return 'I can help you explore products, brands, deals, and onboarding steps on ZEPNEX.';
    })();

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 300);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/40"
        aria-label="Open ZEPNEX AI Assistant"
      >
        <Icon name="CpuChipIcon" size={28} variant="outline" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon name="CpuChipIcon" size={18} variant="outline" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">ZEPNEX AI</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Close assistant"
            >
              <Icon name="XMarkIcon" size={16} variant="outline" />
            </button>
          </div>

          <div className="border-b border-border bg-secondary/20 p-3">
            <div className="space-y-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => setMessage(reply)}
                  className="block w-full rounded-full border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto bg-background p-4">
            {messages.map((msg, index) => (
              <div
                key={`${msg.sender}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  msg.sender === 'bot'
                    ? 'bg-secondary text-foreground'
                    : 'ml-auto bg-primary text-primary-foreground'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border bg-card p-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Ask about products or brands..."
              className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
              aria-label="Send message"
            >
              <Icon name="PaperAirplaneIcon" size={16} variant="outline" />
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-5 right-24 z-[59] hidden md:block">
        <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          AI Assistant
        </div>
      </div>
    </>
  );
}
