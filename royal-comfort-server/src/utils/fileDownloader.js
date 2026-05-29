const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Скачивает файл с серверов Telegram и сохраняет его локально.
 * Использует встроенный модуль https (без внешних зависимостей).
 *
 * @param {Object} telegram - Экземпляр ctx.telegram
 * @param {string} fileId - ID файла из сообщения Telegram
 * @param {string} subfolder - Подпапка в public/uploads ('reviews', 'products', 'categories', 'promo')
 * @returns {Promise<string>} Относительный путь к сохраненному файлу (например, '/uploads/products/products_123.jpg')
 */
async function downloadTelegramFile(telegram, fileId, subfolder) {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    if (!BOT_TOKEN) {
        throw new Error('BOT_TOKEN is not defined in environment variables');
    }

    // 1. Получаем путь к файлу на серверах Telegram
    const fileInfo = await telegram.getFile(fileId);
    const telegramFilePath = fileInfo.file_path; // например, photos/file_0.jpg

    // 2. Получаем расширение файла
    const ext = path.extname(telegramFilePath) || '.jpg';

    // 3. Генерируем уникальное имя файла
    const uniqueFilename = `${subfolder}_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;

    // 4. Определяем пути и создаём папку
    const targetDir = path.join(__dirname, '../../public/uploads', subfolder);
    const targetFilePath = path.join(targetDir, uniqueFilename);
    fs.mkdirSync(targetDir, { recursive: true });

    // 5. Скачиваем файл через встроенный https
    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${telegramFilePath}`;

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(targetFilePath);

        https.get(downloadUrl, (response) => {
            if (response.statusCode !== 200) {
                writer.destroy();
                fs.unlink(targetFilePath, () => {}); // удаляем пустой файл
                return reject(new Error(`Telegram вернул HTTP ${response.statusCode} при скачивании файла`));
            }

            response.pipe(writer);

            writer.on('finish', () => {
                resolve(`/uploads/${subfolder}/${uniqueFilename}`);
            });
            writer.on('error', (err) => {
                fs.unlink(targetFilePath, () => {}); // чистим при ошибке записи
                reject(err);
            });
        }).on('error', (err) => {
            writer.destroy();
            fs.unlink(targetFilePath, () => {});
            reject(err);
        });
    });
}

module.exports = { downloadTelegramFile };
