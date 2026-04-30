# DeadFile MVP Tasks

This document outlines the sequential tasks required to build the MVP for **DeadFile**, as defined in the Product Requirements Document (PRD). Completing all these tasks signifies that the MVP tool build is complete.

## Task 1: Initialize Project & CLI Skeleton
* **Description:** 
  * Initialize a Node.js project with TypeScript.
  * Install basic dependencies: `typescript`, `commander`, `chalk`, and `fast-glob`.
  * Set up the base CLI structure using `commander` with basic arguments (`--json`, `--config`).
  * Create the entry point (`src/index.ts` or `src/cli.ts`).
* **Dependencies:** None
* **Verification:** Run the CLI locally (e.g., `npx ts-node src/cli.ts --help`) and confirm it prints the help menu with the defined options.

## Task 2: Configuration Loader
* **Description:**
  * Implement logic to detect and read a `deadfile.config.json` file in the root directory.
  * Provide fallback default configurations (e.g., default extensions like `.js, .ts, .tsx, .jsx`, default entry points like `src/index.tsx` or `src/pages`, default ignores like `node_modules`, `.next`).
  * Merge custom config with defaults.
* **Dependencies:** Task 1
* **Verification:** Create a dummy `deadfile.config.json`, run the CLI, and log the final config object to confirm custom values merged successfully with defaults.

## Task 3: Project File Scanner
* **Description:**
  * Use `fast-glob` to recursively scan the workspace for files based on the configured include/exclude paths and extensions.
  * Filter out ignored directories defined in the configuration.
  * Return a flat array/set of absolute file paths representing all active source files in the project.
* **Dependencies:** Task 2
* **Verification:** Create a small mock directory with nested files, run the scanner function, and confirm it returns exactly the files expected (ignoring `node_modules`).

## Task 4: Import Parsing (AST Extraction)
* **Description:**
  * Set up `ts-morph` or `@babel/parser` to parse JS/TS files into an Abstract Syntax Tree (AST).
  * Write extraction logic to find all `import`, `require()`, and dynamic `import()` statements within a single file.
  * For dynamic imports, flag them as "possibly used".
  * Resolve relative import paths to absolute paths so they map cleanly to the scanned files.
* **Dependencies:** Task 3
* **Verification:** Feed a test file containing various imports to the parser function and ensure it accurately lists all referenced file paths.

## Task 5: Dependency Graph Builder
* **Description:**
  * Iterate over all scanned files from Task 3.
  * Pass each file through the Import Parser (Task 4) to find its dependencies.
  * Construct a dependency graph mapping each file to the files it imports.
  * Format: `Graph = { [filePath: string]: string[] }`.
* **Dependencies:** Task 4
* **Verification:** Inspect the generated graph object for a mock project to ensure each file node correctly points to its dependencies.

## Task 6: Unused File Detection Algorithm
* **Description:**
  * Implement a graph traversal algorithm (like Depth-First Search).
  * Start traversal from the defined `entry` points in the configuration.
  * Mark all traversed/visited nodes as **"reachable" (used)**.
  * Compare the "reachable" list against the full list of scanned files.
  * Files that are scanned but not reachable are marked as **unused**.
  * Keep a separate list for files dependent on dynamic imports to label them as **possibly unused**.
* **Dependencies:** Task 5
* **Verification:** Test against a mock project containing at least one unreachable file. The function must accurately identify the unreachable file and mark reachable files as safe.

## Task 7: CLI Output Formatting
* **Description:**
  * Format the detection results for the terminal using `chalk`.
  * Display a scanning indicator, the number of unused files, the list of unused files, possibly unused files, and the time taken.
  * Implement the `--json` flag logic: if provided, silence the colorful output and print the raw result object as a JSON string.
* **Dependencies:** Task 6
* **Verification:** Run the full CLI tool against a real or mock codebase. Verify the terminal output is formatted clearly. Then, run with `--json` and confirm valid JSON is outputted to stdout.

## Task 8: MVP End-to-End Testing & Polish
* **Description:**
  * Perform an end-to-end integration test of the `deadfile` CLI command against a sample Next.js/React project.
  * Ensure the performance meets the MVP criteria (<10 seconds for medium projects).
  * Ensure the code correctly handles basic missing file extensions or index resolution (`./components/Button/index.tsx`).
* **Dependencies:** Task 1-7
* **Verification:** The CLI successfully runs end-to-end on a test project without crashing, effectively highlights unused files, and meets speed expectations.
