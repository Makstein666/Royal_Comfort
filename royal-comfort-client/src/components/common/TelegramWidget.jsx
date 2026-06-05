import React from 'react';
import { Send } from 'lucide-react';

const TelegramWidget = () => {
  return (
    <div className="fixed z-[9000] flex flex-col items-end gap-2 group"
      style={{
        /* На мобиле — выше (bottom-20), чтобы не перекрывать текст в Telegram WebView.
           На десктопе — стандартные bottom-6 right-6 */
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        right: '1rem',
      }}
    >
      {/* Подсказка (только на десктопе с hover) */}
      <div className="hidden md:block absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-[#0A2A2A] px-4 py-2 rounded-xl text-sm font-bold shadow-xl border border-[#B88E2F]/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap translate-x-2 group-hover:translate-x-0">
        Перейти в Telegram-бот
        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-[#B88E2F]/20 rotate-45" />
      </div>

      {/* Кнопка */}
      <a
        href="https://t.me/royal_comfort_bot"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Открыть Telegram-бот Royal Comfort"
        className="w-14 h-14 md:w-16 md:h-16 bg-[#B88E2F] hover:bg-[#D4AF37] rounded-full shadow-[0_10px_25px_rgba(184,142,47,0.4)] flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 relative touch-manipulation"
      >
        {/* Анимация пульсации */}
        <div className="absolute inset-0 bg-[#B88E2F] rounded-full animate-ping opacity-40" />
        <Send size={24} className="relative z-10 -ml-0.5 mt-0.5 md:-ml-1 md:mt-1 md:w-7 md:h-7" />
      </a>
    </div>
  );
};

export default TelegramWidget;
