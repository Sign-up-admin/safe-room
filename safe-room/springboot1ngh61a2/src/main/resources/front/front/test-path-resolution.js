import { resolve } from 'path';
import { fileURLToPath } from 'url';

// 模拟vitest配置中的路径解析
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const alias = resolve(__dirname, 'src');

console.log('__filename:', __filename);
console.log('__dirname:', __dirname);
console.log('@ alias resolves to:', alias);
console.log('Full path to api:', resolve(alias, 'utils/api.ts'));
