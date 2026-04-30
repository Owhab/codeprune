# 🧾 Product Requirements Document (PRD)

## Product Name: **DeadFile (working name)**

*A CLI tool to detect unused files in JS/TS projects*

---

# 1. 🎯 Objective

### Goal:

Help developers automatically detect **unused (dead) files** in a codebase to:

* reduce bundle size
* improve maintainability
* safely refactor large projects

### Success Criteria:

* Detect unused files with **>90% accuracy**
* Run in **<10 seconds for medium projects (~5k files)**
* Reduce manual cleanup effort by **80%**

---

# 2. 👤 Target Users

### Primary:

* Frontend developers (React, Next.js)
* Full-stack developers (like you)

### Secondary:

* Team leads (codebase cleanup)
* DevOps (optimize builds)

---

# 3. ❗ Problem Statement

Modern JS projects accumulate:

* unused components
* old pages/routes
* images/assets not referenced
* legacy utility files

Manual detection:

* error-prone
* time-consuming
* risky (fear of breaking things)

---

# 4. 💡 Solution Overview

A CLI tool that:

1. Scans project files
2. Builds dependency graph
3. Finds files **not referenced anywhere**
4. Outputs report (CLI + optional JSON)

---

# 5. ⚙️ Core Features (MVP)

## 5.1 Project Scan

* Recursively scan directories:

  * `/src`
  * `/components`
  * `/pages` or `/app`
* Configurable include/exclude

---

## 5.2 Dependency Graph Builder

* Parse:

  * `import`
  * `require`
  * dynamic imports (basic support)
* Build graph:

  ```
  File A → File B → File C
  ```

---

## 5.3 Entry Point Detection

Default entry points:

* Next.js:

  * `/pages`
  * `/app`
* Custom config:

```json
{
  "entry": ["src/index.tsx"]
}
```

---

## 5.4 Unused File Detection

Logic:

* Traverse graph from entry points
* Mark all reachable files
* Unreachable files = **unused**

---

## 5.5 CLI Output

Example:

```bash
npx deadfile
```

Output:

```
🔍 Scanning project...

❌ Unused Files (12):
- components/OldCard.tsx
- utils/legacyHelper.ts
- assets/banner-old.png

⚠️ Possibly Unused (dynamic import detected):
- pages/temp.tsx

✅ Done in 3.2s
```

---

## 5.6 Config File

`deadfile.config.json`

```json
{
  "include": ["src"],
  "exclude": ["node_modules", ".next"],
  "extensions": [".js", ".ts", ".tsx"],
  "entry": ["src/pages", "src/app"],
  "ignore": ["src/components/ui"]
}
```

---

# 6. 🚀 Advanced Features (V2)

## 6.1 Smart Asset Detection

* Detect:

  * images in JSX (`<img src="..." />`)
  * CSS background images
* Compare with `/public` or `/assets`

---

## 6.2 Framework Awareness

* Next.js:

  * route-based usage
* Laravel Blade:

  * detect asset usage in `.blade.php`

---

## 6.3 Safe Delete Mode

```bash
deadfile --delete
```

* moves unused files → `/trash`
* NOT permanent delete

---

## 6.4 Interactive Mode

```bash
deadfile --interactive
```

```
Delete components/OldCard.tsx? (y/n)
```

---

## 6.5 CI Integration

* Fail build if:

  ```
  unused files > threshold
  ```

---

## 6.6 Visual Graph (Optional UI)

* Show dependency graph
* Highlight unused nodes

---

# 7. 🧱 Technical Architecture

## 7.1 Tech Stack

* Node.js (CLI)
* TypeScript
* Libraries:

  * `ts-morph` or `@babel/parser` (AST parsing)
  * `commander` (CLI)
  * `fast-glob` (file scanning)
  * `chalk` (CLI colors)

---

## 7.2 High-Level Flow

```
Scan Files
   ↓
Parse Imports (AST)
   ↓
Build Dependency Graph
   ↓
Mark Reachable Files
   ↓
Find Unused Files
   ↓
Output Report
```

---

## 7.3 Dependency Graph Structure

```ts
type Graph = {
  [filePath: string]: string[] // dependencies
}
```

---

## 7.4 Algorithm

### Step 1: Build Graph

```ts
A → B, C
B → D
C → []
D → []
```

### Step 2: Traverse from Entry

Reachable:

```
A, B, C, D
```

### Step 3: Compare with all files

Unused:

```
E, F, G
```

---

# 8. ⚠️ Edge Cases

### 8.1 Dynamic Imports

```ts
import(`./${name}`)
```

→ mark as **possibly used**

---

### 8.2 Barrel Files

```ts
export * from "./Button"
```

→ must resolve re-exports

---

### 8.3 Alias Paths

```ts
@/components/Button
```

→ resolve via `tsconfig.json`

---

### 8.4 CSS / SCSS Imports

```ts
import "./styles.css"
```

---

### 8.5 Runtime Usage

* Files used via:

  * API responses
  * config strings
    → mark as **unknown**

---

# 9. 📊 Output Formats

### CLI (default)

### JSON

```bash
deadfile --json
```

```json
{
  "unused": ["components/OldCard.tsx"],
  "possiblyUnused": ["pages/temp.tsx"]
}
```

---

# 10. 🔐 Safety Considerations

* Never auto-delete without confirmation
* Always support:

  * dry run mode
* Backup before delete

---

# 11. 📈 Performance Requirements

| Project Size       | Expected Time |
| ------------------ | ------------- |
| Small (<1k files)  | <2s           |
| Medium (~5k files) | <10s          |
| Large (10k+)       | <25s          |

---

# 12. 🧪 Testing Strategy

* Unit tests:

  * import parsing
  * graph building
* Integration:

  * sample Next.js project
* Edge cases:

  * dynamic imports
  * alias resolution

---

# 13. 📦 CLI Commands Summary

```bash
deadfile                # scan project
deadfile --json         # output JSON
deadfile --delete       # move unused files
deadfile --interactive  # confirm each delete
deadfile --config       # custom config path
```

---

# 14. 🗺️ Roadmap

### MVP (2–3 days)

* file scan
* import parsing
* dependency graph
* CLI output

### V2 (1 week)

* assets detection
* safe delete
* alias support

### V3

* UI dashboard
* CI/CD integration

---

# 15. 💰 Future Potential

This can evolve into:

* VS Code extension
* full **code quality analyzer tool**
* SaaS (team-level insights)

---

# 🧠 Final Advice (important)

Don’t try to build everything in this PRD.

Start with:

* JS/TS import parsing
* simple graph
* CLI output

Ship fast. Use it on your own projects.

