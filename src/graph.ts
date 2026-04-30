import { ImportParser } from './parser';
import fs from 'fs';
import path from 'path';

export interface GraphEdges {
  static: string[];
  dynamic: string[];
}

export type Graph = Record<string, GraphEdges>;

export interface AnalysisResult {
  totalFiles: number;
  unusedFiles: string[];
  possiblyUnusedFiles: string[];
}

export function buildGraph(files: string[], parser: ImportParser): Graph {
  const graph: Graph = {};

  for (const file of files) {
    const deps = parser.parseFile(file);
    graph[file] = {
      static: deps.static,
      dynamic: deps.dynamic,
    };
  }

  return graph;
}

export function findUnusedFiles(
  allFiles: string[],
  graph: Graph,
  entryPoints: string[],
  cwd: string = process.cwd()
): AnalysisResult {
  const resolvedEntries = resolveEntryPoints(entryPoints, allFiles, cwd);
  
  const staticReachable = new Set<string>();
  const dynamicReachable = new Set<string>();

  function traverse(node: string, isDynamicRoute: boolean) {
    if (isDynamicRoute) {
      if (dynamicReachable.has(node) || staticReachable.has(node)) return;
      dynamicReachable.add(node);
    } else {
      if (staticReachable.has(node)) return;
      staticReachable.add(node);
      dynamicReachable.delete(node);
    }

    const edges = graph[node];
    if (!edges) return;

    for (const child of edges.static) {
      traverse(child, isDynamicRoute);
    }
    for (const child of edges.dynamic) {
      traverse(child, true);
    }
  }

  for (const entry of resolvedEntries) {
    traverse(entry, false);
  }

  const unusedFiles: string[] = [];
  const possiblyUnusedFiles: string[] = [];

  for (const file of allFiles) {
    if (staticReachable.has(file)) {
      continue;
    } else if (dynamicReachable.has(file)) {
      possiblyUnusedFiles.push(file);
    } else {
      unusedFiles.push(file);
    }
  }

  return {
    totalFiles: allFiles.length,
    unusedFiles,
    possiblyUnusedFiles,
  };
}

function resolveEntryPoints(entries: string[], allFiles: string[], cwd: string): string[] {
  const resolved = new Set<string>();

  for (const entry of entries) {
    const absPath = path.normalize(path.resolve(cwd, entry));
    
    if (!fs.existsSync(absPath)) continue;

    if (fs.statSync(absPath).isDirectory()) {
      for (const file of allFiles) {
        if (file.startsWith(absPath + path.sep)) {
          resolved.add(file);
        }
      }
    } else {
      resolved.add(absPath);
    }
  }

  return Array.from(resolved);
}
