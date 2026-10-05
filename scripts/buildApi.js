import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src/api/sheets');
const outDir = path.resolve('api/sheets');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts'));

console.log(`Building ${files.length} API routes with esbuild...`);

for (const file of files) {
  const entryPath = path.join(srcDir, file);
  const outPath = path.join(outDir, file.replace(/\.ts$/, '.js'));

  await build({
    entryPoints: [entryPath],
    outfile: outPath,
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    external: ['googleapis', '@google/genai'],
    sourcemap: false,
    minify: false,
  });

  console.log(`✓ Built ${file} -> ${path.relative(process.cwd(), outPath)}`);
}

// Xóa các file .ts cũ trong api/sheets/ nếu còn tồn tại để Vercel không bị trùng route
for (const file of files) {
  const oldTs = path.join(outDir, file);
  if (fs.existsSync(oldTs)) {
    fs.unlinkSync(oldTs);
    console.log(`Cleaned legacy ${file} from api/sheets/`);
  }
}

console.log('All API routes compiled successfully!');
