import React, { useState } from 'react';
import { Star, Quote, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Подключаем Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const ReviewCard = ({ review }) => {
  const [isZoomed, setIsZoomed] = useState(null); // Состояние для зума картинки

  // Приводим данные к массиву (поддержка и старого поля image, и нового images)
  const photos = review.images || (review.image ? [review.image] : []);

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2rem] p-6 shadow-xl border border-[#B88E2F]/10 h-full flex flex-col relative group hover:shadow-2xl transition-all duration-300"
    >
      {/* Иконка кавычки (фон) */}
      <div className="absolute top-6 right-6 text-[#B88E2F]/5 group-hover:text-[#B88E2F]/10 transition-colors pointer-events-none">
        <Quote size={64} fill="currentColor" />
      </div>

      {/* Шапка: Автор */}
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="w-12 h-12 rounded-full bg-[#F5F1E6] flex items-center justify-center text-[#B88E2F] font-bold text-lg uppercase border border-[#B88E2F]/20">
            {review.author[0]}
        </div>
        <div>
            <div className="flex items-center gap-2">
                <h4 className="font-bold text-[#0A2A2A]">{review.author}</h4>
                <CheckCircle size={14} className="text-emerald-500" fill="currentColor" color="white" />
            </div>
            <div className="flex gap-0.5 mt-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={12} 
                        className={i < review.rating ? "text-[#B88E2F] fill-[#B88E2F]" : "text-gray-200"} 
                    />
                ))}
            </div>
        </div>
      </div>

      {/* Текст отзыва */}
      <p className="text-gray-600 text-sm leading-relaxed mb-6 italic relative z-10 flex-grow">
        "{review.text}"
      </p>

      {/* --- ГАЛЕРЕЯ ФОТОГРАФИЙ --- */}
      {photos.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden relative z-10 border border-gray-100">
            {photos.length === 1 ? (
                // Если фото одно - просто показываем
                <div 
                    className="h-48 w-full bg-cover bg-center cursor-zoom-in hover:scale-105 transition-transform duration-500"
                    style={{ backgroundImage: `url(${photos[0]})` }}
                    onClick={() => setIsZoomed(photos[0])}
                />
            ) : (
                // Если фото несколько - включаем SWIPER
                <Swiper
                    modules={[Pagination]}
                    spaceBetween={10}
                    slidesPerView={1}
                    pagination={{ clickable: true, dynamicBullets: true }}
                    className="h-56 w-full review-swiper"
                >
                    {photos.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <div 
                                className="h-full w-full bg-cover bg-center cursor-zoom-in"
                                style={{ backgroundImage: `url(${img})` }}
                                onClick={() => setIsZoomed(img)}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
      )}

      {/* Дата */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium">
        <span>{review.date}</span>
        <span className="text-[#B88E2F]/60">Проверенный отзыв</span>
      </div>
    </motion.div>

    {/* --- ЛАЙТБОКС (Увеличение фото) --- */}
    <AnimatePresence>
        {isZoomed && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                onClick={() => setIsZoomed(null)}
            >
                <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2">
                    <X size={32} />
                </button>
                <motion.img 
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                    src={isZoomed} 
                    alt="Review full" 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
};

export default ReviewCard;