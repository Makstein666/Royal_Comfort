import React from 'react';
import { Send } from 'lucide-react';

const TelegramWidget = () => {
  return (
    <div className="fixed bottom-6 right-6 z-[9000] flex flex-col items-end gap-2 group">
      {/* Подсказка, которая появляется при наведении */}
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-[#0A2A2A] px-4 py-2 rounded-xl text-sm font-bold shadow-xl border border-[#B88E2F]/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap translate-x-2 group-hover:translate-x-0">
        Перейти в Telegram-бот
        {/* Треугольник для подсказки */}
        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-[#B88E2F]/20 rotate-45"></div>
      </div>

      {/* Сама кнопка */}
      <a
        href="https://t.me/royal_comfort_bot"
        target="_blank"
        rel="noopener noreferrer"
        className="w-16 h-16 bg-[#B88E2F] hover:bg-[#D4AF37] rounded-full shadow-[0_10px_25px_rgba(184,142,47,0.4)] flex items-center justify-center text-white transition-transform hover:scale-110 relative"
      >
        {/* Анимация пульсации */}
        <div className="absolute inset-0 bg-[#B88E2F] rounded-full animate-ping opacity-40"></div>
        <Send size={28} className="relative z-10 -ml-1 mt-1" />
      </a>
    </div>
  );
};

export default TelegramWidget;
