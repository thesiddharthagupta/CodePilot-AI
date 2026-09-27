# AI Assistant Architecture & Collaboration

## Context Selection & Hierarchy

CollabCode implements an intelligent context-pruning hierarchy to prevent bloated prompts, reduce token latency, and optimize LLM cost:

```
[User Identity / Role]
         ↓
[Project Metadata & Files Index]
         ↓
[Active File & Extension]
         ↓
[Selected Code Segment (if highlighted)]
         ↓
[Compiler / Runtime Diagnostics (Line, Column, Message)]
         ↓
[Active Conversation Turn & User Prompt]
```

## 10 Specialized AI Capabilities

| Action | Function | Output |
|---|---|---|
| **Explain** | Line-by-line algorithm analysis in natural language | Markdown explanation with structural breakdown |
| **Fix** | Error diagnostic analysis and automatic patch proposal | Diff preview + runnable fixed source |
| **Generate** | Synthesizes complete modules from intent prompts | Commented source snippet |
| **Optimize** | Replaces algorithmic bottlenecks with standard idioms | High-performance alternative with diff |
| **Debug** | Traces stack traces, unhandled exceptions, and edge cases | Diagnostic checklist |
| **Refactor** | Decouples monolithic code, extracts helper methods | Modularized source + diff |
| **Test** | Generates unit tests and assertion suites | Runnable test suite for active language |
| **Document** | Injects docstrings and parameter types | Source with standard documentation |
| **Convert** | Transpiles algorithms across languages | Target language implementation |
| **Review** | Comprehensive security, bug, and style audit | Bulleted report with severity badges |

## Diff Engine & Editor Collaboration

CollabCode features active pair programming between the AI and Monaco editor:
1. When AI proposes new or modified code, the backend diff engine creates a standard unified patch (`createPatch`).
2. The frontend renders the patch with colorized additions (`+ green`), deletions (`- red`), and hunk headers (`@@ cyan`).
3. The developer can inspect changes and click **Apply to Editor**, immediately updating the Monaco editor buffer with undo/redo history preserved.
