const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.sqlite');
const BACKUPS_DIR = path.join(__dirname, '../../backups');

/**
 * Создает резервную копию базы данных.
 */
const createBackup = async () => {
    if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const filename = `backup_${timestamp}.sqlite`;
    const destPath = path.join(BACKUPS_DIR, filename);

    return new Promise((resolve, reject) => {
        fs.copyFile(DB_PATH, destPath, (err) => {
            if (err) return reject(err);
            resolve(filename);
        });
    });
};

/**
 * Возвращает список файлов бэкапа.
 */
const listBackups = () => {
    if (!fs.existsSync(BACKUPS_DIR)) return [];
    return fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.endsWith('.sqlite'))
        .sort((a, b) => b.localeCompare(a)); // Свежие сверху
};

/**
 * Восстанавливает базу из файла.
 * ВНИМАНИЕ: Процесс завершится для перезагрузки!
 */
const restoreBackup = async (filename) => {
    const safeFilename = path.basename(filename);
    const srcPath = path.join(BACKUPS_DIR, safeFilename);
    if (!fs.existsSync(srcPath)) throw new Error('Файл не найден');

    return new Promise((resolve, reject) => {
        fs.copyFile(srcPath, DB_PATH, (err) => {
            if (err) return reject(err);
            resolve();
            // Даем время на логирование и выходим для перезапуска nodemon
            setTimeout(() => process.exit(0), 1000);
        });
    });
};

module.exports = { createBackup, listBackups, restoreBackup };
