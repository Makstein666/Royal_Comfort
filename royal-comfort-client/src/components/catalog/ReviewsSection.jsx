import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, PenTool } from 'lucide-react';

const ReviewsSection = ({ categoryId, onLeaveReview }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Запрашиваем отзывы для конкретной категории
                const res = await fetch(`http://localhost:5000/api/catalog/reviews?categoryId=${categoryId}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setReviews(data);
                }
            } catch (error) {
                console.error("Ошибка загрузки отзывов:", error);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchReviews();
        }
    }, [categoryId]);

    if (loading) return <div className="py-10 text-center text-gray-400">Загрузка отзывов...</div>;

    return (
        <div className="mt-24 border-t border-[#B88E2F]/20 pt-16">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                <div>
                    <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#0A2A2A] mb-3">
                        Отзывы владельцев
                    </h3>
                    <p className="text-gray-500 max-w-lg">
                        Реальные истории наших клиентов, которые уже наслаждаются отдыхом.
                    </p>
                </div>
                <button 
                    onClick={onLeaveReview}
                    className="px-6 py-3 bg-[#0A2A2A] text-[#B88E2F] rounded-xl font-bold hover:bg-[#B88E2F] hover:text-[#0A2A2A] transition-colors flex items-center gap-2 shadow-lg"
                >
                    <PenTool size={18} /> Написать отзыв
                </button>
            </div>

            {reviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Пока нет отзывов</h4>
                    <p className="text-gray-500 mb-6">Будьте первым, кто поделится впечатлениями об этом товаре!</p>
                    <button onClick={onLeaveReview} className="text-[#B88E2F] font-bold underline hover:text-[#0A2A2A]">
                        Оставить первый отзыв
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-[#F5F1E6] rounded-full flex items-center justify-center text-[#B88E2F]">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-[#0A2A2A] text-sm">{review.author}</h5>
                                        <span className="text-xs text-gray-400">{review.productName || 'Проверенный покупатель'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={14} 
                                            fill={i < review.rating ? "#B88E2F" : "transparent"} 
                                            stroke={i < review.rating ? "#B88E2F" : "#D1D5DB"}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow italic">
                                "{review.text}"
                            </p>

                            {/* ФОТОГРАФИИ В ОТЗЫВЕ */}
                            {review.images && review.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {review.images.map((img, idx) => (
                                        <img 
                                            key={idx} 
                                            src={img} 
                                            alt={`Фото отзыва ${idx + 1}`} 
                                            className="w-16 h-16 object-cover rounded-lg border border-gray-100 hover:scale-105 transition-transform cursor-pointer"
                                            onClick={() => window.open(img, '_blank')}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="text-[10px] text-gray-400 uppercase tracking-wider pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span>{review.date || new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
                                {review.productName && <span className="text-[#B88E2F] font-bold">{review.productName}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;