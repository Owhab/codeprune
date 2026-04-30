import fg from 'fast-glob';
import path from 'path';
import type { DeadFileConfig } from './config.js';

export async function scanFiles(config: DeadFileConfig, cwd: string = process.cwd()): Promise<string[]> {
  const extList = config.extensions.map(ext => ext.startsWith('.') ? ext.slice(1) : ext).join(',');
  const extPattern = extList.includes(',') ? `{${extList}}` : extList;
  
  const patterns = config.include.map(inc => {
    // remove leading ./ or /
    const cleanInc = inc.replace(/^(\.\/|\/)/, '');
    return `${cleanInc}/**/*.${extPattern}`;
  });

  const ignorePatterns = [
    ...config.exclude.map(ex => `**/${ex}/**`),
    ...config.ignore.map(ig => `**/${ig}/**`)
  ];

  const files = await fg(patterns, {
    cwd,
    ignore: ignorePatterns,
    absolute: true,
    dot: true,
  });

  return files.map(file => path.normalize(file));
}
