// Адрес твоего сервера
const API_URL = 'http://localhost:5000/api';

// 1. Получить все категории
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error('Ошибка сети');
    return await response.json();
  } catch (error) {
    console.error("Ошибка при загрузке категорий:", error);
    return [];
  }
};

// 2. Получить товары (можно по категории)
export const fetchProducts = async (categoryId = null) => {
  try {
    let url = `${API_URL}/products`;
    if (categoryId) {
      url += `?categoryId=${categoryId}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка сети');
    return await response.json();
  } catch (error) {
    console.error("Ошибка при загрузке товаров:", error);
    return [];
  }
};

// 3. Получить отзывы (ЭТОЙ ФУНКЦИИ НЕ ХВАТАЛО)
export const fetchReviews = async (categoryId = null) => {
    try {
      let url = `${API_URL}/reviews`;
      if (categoryId) {
        url += `?categoryId=${categoryId}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Ошибка сети');
      return await response.json();
    } catch (error) {
      console.error("Ошибка при загрузке отзывов:", error);
      return [];
    }
};