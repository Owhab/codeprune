#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { loadConfig } from './config.js';
import { scanFiles } from './scanner.js';
import { ImportParser } from './parser.js';
import { buildGraph, findUnusedFiles } from './graph.js';

const program = new Command();

program
  .name('deadfile')
  .description('A CLI tool to detect unused files in JS/TS projects')
  .version('1.0.0');

program
  .option('-c, --config <path>', 'custom config path')
  .option('-j, --json', 'output JSON')
  .option('-d, --delete', 'move unused files')
  .option('-i, --interactive', 'confirm each delete')
  .action(async (options) => {
    const cwd = process.cwd();
    const isJson = options.json;

    if (!isJson) {
      console.log(chalk.blue('🔍 Scanning project...'));
    }

    const startTime = Date.now();

    const config = loadConfig(options.config);
    const files = await scanFiles(config, cwd);
    const parser = new ImportParser(config.extensions);
    const graph = buildGraph(files, parser);
    const result = findUnusedFiles(files, graph, config.entry, cwd);

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);

    if (isJson) {
      console.log(JSON.stringify({
        unused: result.unusedFiles.map(f => path.relative(cwd, f)),
        possiblyUnused: result.possiblyUnusedFiles.map(f => path.relative(cwd, f))
      }, null, 2));
    } else {
      console.log('');
      console.log(chalk.red(`❌ Unused Files (${result.unusedFiles.length}):`));
      for (const file of result.unusedFiles) {
        console.log(`- ${path.relative(cwd, file)}`);
      }

      if (result.possiblyUnusedFiles.length > 0) {
        console.log('');
        console.log(chalk.yellow(`⚠️ Possibly Unused (dynamic import detected) (${result.possiblyUnusedFiles.length}):`));
        for (const file of result.possiblyUnusedFiles) {
          console.log(`- ${path.relative(cwd, file)}`);
        }
      }

      console.log('');
      console.log(chalk.green(`✅ Done in ${timeTaken}s (Scanned ${result.totalFiles} files)`));

      if (options.delete && result.unusedFiles.length > 0) {
        const fs = await import('fs');
        console.log('');
        console.log(chalk.cyan('🗑️  Moving unused files to .deadfile-trash...'));
        const trashDir = path.resolve(cwd, '.deadfile-trash');
        if (!fs.existsSync(trashDir)) {
          fs.mkdirSync(trashDir);
        }

        for (const file of result.unusedFiles) {
          const relativePath = path.relative(cwd, file);
          const trashPath = path.resolve(trashDir, relativePath.replace(/\\|\//g, '_'));
          try {
            fs.renameSync(file, trashPath);
            console.log(chalk.gray(`Moved: ${relativePath}`));
          } catch (e: any) {
            console.error(chalk.red(`Failed to move ${relativePath}: ${e.message}`));
          }
        }
        console.log(chalk.green('✅ Cleanup complete! (Check .deadfile-trash to recover if needed)'));
      }
    }
  });

program.parse();
