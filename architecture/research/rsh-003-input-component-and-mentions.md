# RSH-003: Which editor framework best supports inline mention pills, autocomplete, and optional syntax highlighting for a single-line-ish React input?

**Date:** 2026-03-21 | **Status:** Completed

## Question

For The Helm's classification input -- a single-line-ish input that supports inline "pills" (colored chips representing card shortnames, like Slack @mentions), an autocomplete/mentions dropdown, optional SQL/Python syntax awareness, and a live classification preview -- which editor framework is the best fit? The input needs rich inline elements but is not a full document editor.

## Context

The Helm is a React 18 + TypeScript SPA. Scientists type entries that get classified. The input component must support:

1. **Inline pills/chips**: When a user references a card shortname, it renders as a colored chip inline with text (similar to @mentions in Slack or Notion).
2. **Autocomplete/mentions dropdown**: Triggered by a configurable character (e.g. `@` or `/`), showing a filterable list of suggestions.
3. **Optional syntax awareness**: Lightweight SQL or Python token highlighting for entries that contain code-like fragments. Not a full IDE -- just visual cues.
4. **Live classification preview**: The framework must expose the current content programmatically so an external classifier can run against it in real-time.
5. **Single-line-ish**: No multi-paragraph document editing. Behaves more like an `<input>` than a `<textarea>`, but must support rich inline elements that plain `<input>` cannot.

## Findings

### Framework Comparison

| Criterion | TipTap (ProseMirror) | Lexical (Meta) | CodeMirror 6 | Slate.js | Custom contenteditable |
|---|---|---|---|---|---|
| **Mention/pill support** | Native extension (`@tiptap/extension-mention`) with built-in suggestion utility. Renders mentions as inline nodes via `ReactNodeViewRenderer`. First-class support. ([source][1], [source][2]) | Community plugins (`lexical-beautiful-mentions`, `lexical-better-mentions`) provide pill-styled mentions with customizable triggers, automatic spacing, and theming. The core playground has a basic demo. ([source][3], [source][4]) | No native mention/pill concept. Must be built with `Decoration.widget()` and `WidgetType` subclasses. Inline widgets can replace text ranges with custom DOM. Workable but manual. ([source][5], [source][6]) | Official "Mentions" example shows inline void elements rendered as styled spans. No dedicated plugin -- you build it via custom inline elements and `renderElement`. ([source][7]) | Libraries like `react-contenteditable-mention` exist but are thin wrappers. Caret management and pill rendering must be hand-rolled. Fragile. ([source][8]) |
| **React integration** | First-class React bindings (`@tiptap/react`). `useEditor` hook, `ReactNodeViewRenderer` for rendering React components inside the editor. Mature. ([source][9]) | Official `@lexical/react` package. Plugin-based composition with `<LexicalComposer>`. Feels like idiomatic React. ([source][10], [source][11]) | No official React wrapper. Community `@uiw/react-codemirror` is widely used (GitHub: 3k+ stars). CodeMirror's imperative API requires bridging via refs and effects. ([source][12]) | React-first by design. `<Slate>`, `<Editable>` components. Deeply integrated with React's rendering model. ([source][13]) | Full React control, but you own every behavior: selection, input events, IME composition, clipboard. |
| **Bundle size (core, min+gzip)** | ~50-70 kB with basic extensions. Core (`@tiptap/core`) is smaller; ProseMirror dependencies add weight. Modular tree-shaking helps. ([source][14], [source][15]) | ~22 kB core (min+gzip) for plain text. ~44 kB with `@lexical/react` and rich text. Smallest core of the frameworks. ([source][16], [source][17]) | ~75 kB minimal (min+gzip) with view + state + basic setup. Adding language support (SQL, Python) adds more. Modular packages keep unused code out. ([source][18]) | ~80 kB (min+gzip) for `slate` + `slate-react`. Has been reducing size by removing unused helpers. ([source][19]) | Near zero base, but realistic implementations (selection, IME, accessibility) quickly approach similar sizes. |
| **Maintenance status** | Very active. v3.20.4 published March 2026. Backed by Tiptap GmbH (commercial entity). Used by NYT, The Guardian, Atlassian. ([source][20]) | Active. v0.39.0 (March 2026). Backed by Meta. Still pre-1.0 -- API surface may shift. Used in production at Meta (Facebook, Workplace). ([source][21], [source][22]) | Active. v6.38.8+ (Nov 2025). Maintained by Marijn Haverbeke (creator). Used by Replit, Chrome DevTools. Rock-solid stability. ([source][23]) | Active but slower cadence. v0.123.0 (Jan 2026). Community-driven, still beta. Used by Discord, Grafana. ([source][24]) | N/A -- you own it. |
| **Mobile support** | Web-based. Touch improvements in v3.0. iOS generally works; Android described as "somewhat wonky." No native React Native support (WebView needed). ([source][25]) | Native iOS via `lexical-ios` (Swift, TextKit). Android not natively supported yet. Mobile web works but needs custom touch handling. ([source][26]) | Excellent mobile web support -- CM6 was rewritten specifically for touch devices using native contenteditable. Best-in-class mobile code editing (used by Replit mobile). iOS drag handles have known issues. ([source][27], [source][28]) | iOS "supported but not regularly tested." Android recently added but may have more bugs due to composition/mutation differences. ([source][29]) | Depends entirely on implementation quality. |
| **Syntax highlighting** | Via `CodeBlockLowlight` extension (lowlight/highlight.js) or community Shiki extension. Designed for code blocks, not inline token coloring. Could integrate CodeMirror as a node view for richer highlighting. ([source][30], [source][31]) | Via `@lexical/code` package using Prism.js. Supports both code blocks and inline code highlighting. Theme-driven styling. ([source][32]) | Native and best-in-class. Built-in Lezer parser system with language packages for SQL, Python, and 30+ languages. Incremental parsing, proper tokenization. This is what CM6 was built for. ([source][33]) | No built-in syntax highlighting. Would need to implement via custom decorations or integrate a highlighting library. | Must integrate a library (Prism, highlight.js) manually. |
| **Single-line mode** | Supported via custom Document schema (`content: "text*"`) or disabling Enter key with a simple extension. Well-documented pattern. ([source][34]) | No built-in flag. Achievable via `SingleLinePlugin` that strips `LineBreakNode` transforms and filters newlines. Community-discussed pattern. ([source][35]) | Configurable but not a primary use case. CM6 is designed for multi-line code. Would need custom extension to suppress Enter and style as single-line. | Override `editor.insertBreak` to no-op. No built-in single-line mode. ([source][36]) | Trivial to enforce. |
| **Content access for live preview** | `editor.getJSON()`, `editor.getText()`, `editor.getHTML()`. Transaction-based updates via `onUpdate` callback. ([source][9]) | `editor.getEditorState().read()` with node traversal. `registerUpdateListener` for changes. Slightly more verbose but powerful. ([source][10]) | `view.state.doc.toString()` for plain text. Transaction-based updates via `EditorView.updateListener`. ([source][33]) | `editor.children` gives the Slate node tree. `onChange` callback on `<Slate>`. Simple and React-idiomatic. ([source][13]) | Read `innerHTML` or maintain shadow state. |

### Prior Art: How Production Apps Handle Inline Mentions/Pills

#### Slack

Slack uses Quill.js (confirmed by Quill's documentation listing Slack alongside LinkedIn and Salesforce as adopters). In 2019, Slack transitioned to a WYSIWYG editor mode, which faced significant user backlash. Mentions appear as styled inline elements (pills) that are non-editable tokens within the message. The `quill-mention` community module provides the @mention autocomplete pattern. Slack's mention pills are visually distinct with background colors and are atomic -- users can delete them but not edit individual characters within them. ([source][37], [source][38], [source][39])

#### Notion

Notion uses a custom block-based editor. While many open-source Notion clones are built on ProseMirror/TipTap (e.g., BlockNote), Notion's own implementation is a proprietary React-based editor. Mentions in Notion appear as inline pills that can reference pages, people, or dates. They render as colored chips with icons and are inserted via `/` or `@` trigger characters. The mention is an atomic inline element -- clicking it navigates to the referenced entity. This pattern (trigger character -> suggestion dropdown -> atomic inline node) is the gold standard for mention UX. ([source][40], [source][41])

#### Linear

Linear's editor supports @-mentioning teammates, issues, projects, and documents. The mention menu provides relevance-sorted suggestions. Linear is widely reported to use TipTap/ProseMirror for its editor, which gives it the smooth editing experience and collaborative features that TipTap provides. Their mentions render as inline pill elements with entity-type-specific styling. ([source][42], [source][43])

#### GitHub

GitHub uses a lightweight approach for its comment boxes. The `text-expander-element` web component (open-sourced by GitHub) activates a suggestion menu on configurable trigger characters. It fires a `text-expander-change` event, receives a `Promise<{matched, fragment}>` for rendering suggestions, and a `text-expander-value` event when an item is selected. This is layered on top of a plain `<textarea>` -- GitHub does not use a rich text editor for comments. Mentions appear as plain text (`@username`) that get linkified on render, not as inline pills during editing. ([source][44])

### Summary Matrix: Feature Fit for The Helm

| Requirement | Best Fit | Runner-up | Notes |
|---|---|---|---|
| Inline pills/chips | **TipTap** | Lexical | TipTap's mention extension + ReactNodeViewRenderer is the most complete out-of-box solution. Lexical's `lexical-beautiful-mentions` is close but third-party. |
| Autocomplete dropdown | **TipTap** | Lexical | TipTap's Suggestion utility handles positioning, keyboard nav, and rendering. Lexical plugins provide similar. |
| SQL/Python syntax hints | **CodeMirror 6** | Lexical | CM6 has proper language parsers. For light inline highlighting, Lexical's Prism integration may suffice. TipTap would need CodeMirror embedded as a node view. |
| Single-line mode | **TipTap** | Custom | TipTap has the best-documented single-line pattern. |
| React integration | **Slate** / **Lexical** | TipTap | Slate and Lexical feel most React-native. TipTap's React support is excellent but wraps an imperative core. |
| Bundle size | **Lexical** | TipTap | Lexical's 22kB core is the lightest. TipTap at 50-70kB is reasonable. CM6 at 75kB+ is heavier. |
| Mobile support | **CodeMirror 6** | TipTap | CM6 was purpose-built for touch. TipTap is acceptable for web-based mobile. |
| Maintenance/longevity | **TipTap** / **CM6** | Lexical | TipTap has commercial backing. CM6 has a 15+ year track record. Lexical has Meta but is pre-1.0. |

## Conclusions

### Recommendation: TipTap (ProseMirror)

TipTap is the strongest overall fit for The Helm's input component for these reasons:

1. **Mention pills are a solved problem.** The `@tiptap/extension-mention` extension, combined with `ReactNodeViewRenderer`, provides exactly the inline pill/chip pattern needed. Mentions render as atomic inline nodes with full React component control over styling (colored chips per card type). No custom contenteditable wrangling required.

2. **Single-line mode is well-supported.** Extending the Document node with `content: "text*"` or a simple Enter-key-disabling extension creates a clean single-line input. This is a documented, tested pattern.

3. **The Suggestion utility handles autocomplete.** TipTap's built-in Suggestion API manages trigger character detection, popup positioning, keyboard navigation, and item selection. It integrates with tippy.js for the dropdown.

4. **Syntax highlighting is achievable.** For light SQL/Python hints, TipTap can use the `CodeBlockLowlight` extension adapted for inline use, or a custom mark that applies Prism/highlight.js token classes. For deeper syntax support, CodeMirror 6 can be embedded as a TipTap node view -- this is a known integration pattern.

5. **Content access for live classification.** `editor.getJSON()` and `editor.getText()` provide structured and plain-text representations. The `onUpdate` callback fires on every change, enabling real-time classification preview.

6. **Production-proven at scale.** Used by NYT, The Guardian, Atlassian, and reported by Linear. Commercially backed by Tiptap GmbH with an active v3 release line.

### Why not the alternatives?

- **Lexical**: Strong contender. Lighter bundle, good React integration, and `lexical-beautiful-mentions` is capable. However, it is pre-1.0 with potential API churn, and the mention solution is third-party rather than first-party. Worth revisiting when Lexical reaches 1.0.

- **CodeMirror 6**: Best-in-class for syntax highlighting and mobile, but it is a code editor, not a rich text input. Mentions/pills require building from scratch with widget decorations. No React wrapper is official. Overkill for a single-line input that occasionally has SQL fragments.

- **Slate.js**: Maximum flexibility but minimum batteries. No mention plugin, no suggestion utility, no syntax highlighting. Everything must be built. Still in beta after years. The effort/reward ratio is poor for this use case.

- **Custom contenteditable**: Maximum control but maximum cost. Caret management, IME composition, clipboard handling, accessibility, and cross-browser quirks make this a multi-month effort for what TipTap provides out of the box.

### Implementation sketch

```
@tiptap/core + @tiptap/react + @tiptap/extension-mention + @tiptap/suggestion
```

- Custom Document: `Document.extend({ content: 'text*' })` for single-line
- Mention node: extends `@tiptap/extension-mention` with custom `renderHTML` and `ReactNodeViewRenderer` for colored pill rendering
- Suggestion popup: React component passed to the Suggestion utility config
- Classification hook: `useEffect` subscribing to `editor.on('update')`, calling classifier with `editor.getText()`
- Optional syntax marks: custom TipTap marks that apply CSS classes for SQL/Python keywords via regex-based input rules

## Sources

[1]: https://tiptap.dev/docs/editor/extensions/nodes/mention "Mention extension | Tiptap Editor Docs"
[2]: https://tiptap.dev/docs/ui-components/components/mention-dropdown-menu "Mention Dropdown Menu | Tiptap UI Components"
[3]: https://github.com/sodenn/lexical-beautiful-mentions "lexical-beautiful-mentions - GitHub"
[4]: https://socket.dev/npm/package/lexical-better-mentions "lexical-better-mentions - npm"
[5]: https://codemirror.net/examples/decoration/ "CodeMirror Decoration Example"
[6]: https://discuss.codemirror.net/t/quick-inline-widget-example-for-v6/4679 "Quick inline widget example for v6 - CodeMirror"
[7]: https://www.slatejs.org/examples/mentions "Slate Examples - Mentions"
[8]: https://github.com/kejianfeng/react-contenteditable-mention "react-contenteditable-mention - GitHub"
[9]: https://tiptap.dev/docs/editor/getting-started/install/react "React | Tiptap Editor Docs"
[10]: https://lexical.dev/docs/react/ "Lexical + React | Lexical"
[11]: https://lexical.dev/docs/react/plugins "Lexical Plugins | Lexical"
[12]: https://github.com/uiwjs/react-codemirror "react-codemirror - GitHub"
[13]: https://docs.slatejs.org/libraries/slate-react "Slate React | Slate"
[14]: https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025 "Which rich text editor framework should you choose in 2025? | Liveblocks"
[15]: https://www.dhiwise.com/post/tiptap-vs-lexical-choosing-the-best-web-text-editor "Tiptap vs Lexical: Key Differences | dhiwise"
[16]: https://gitnux.org/lexical-statistics/ "Lexical Statistics: Market Data Report 2026"
[17]: https://lexical.dev/docs/intro "Introduction | Lexical"
[18]: https://discuss.codemirror.net/t/minimal-setup-because-by-default-v6-is-50kb-compared-to-v5/4514 "Minimal setup - CodeMirror discuss"
[19]: https://github.com/ianstormtaylor/slate/issues/1555 "Improve Slate's readOnly bundle size - GitHub"
[20]: https://www.npmjs.com/package/@tiptap/core "@tiptap/core - npm"
[21]: https://www.npmjs.com/package/lexical "lexical - npm"
[22]: https://dev.to/codeideal/best-rich-text-editor-for-react-in-2025-3cdb "Best Rich Text Editor for React in 2025 - DEV Community"
[23]: https://blog.replit.com/codemirror-mobile "Replit - A New Code Editor for Mobile - CodeMirror 6"
[24]: https://github.com/ianstormtaylor/slate/releases "Releases - ianstormtaylor/slate - GitHub"
[25]: https://github.com/ueberdosis/tiptap/discussions/3113 "Tiptap for React Native - GitHub Discussion"
[26]: https://github.com/facebook/lexical-ios "lexical-ios - GitHub"
[27]: https://blog.replit.com/codemirror-mobile "Replit - A New Code Editor for Mobile"
[28]: https://blog.replit.com/code-editors "Replit - Comparing Code Editors"
[29]: https://docs.slatejs.org/general/faq "FAQ | Slate"
[30]: https://tiptap.dev/docs/editor/extensions/nodes/code-block-lowlight "CodeBlockLowlight extension | Tiptap Docs"
[31]: https://github.com/ueberdosis/tiptap/discussions/4564 "Codemirror support - TipTap Discussion"
[32]: https://lexical.dev/docs/api/modules/lexical_code "@lexical/code | Lexical"
[33]: https://codemirror.net/ "CodeMirror"
[34]: https://github.com/ueberdosis/tiptap/discussions/2948 "Ability to disable Enter - TipTap Discussion"
[35]: https://github.com/facebook/lexical/issues/3675 "Feature: Single line input - Lexical Issue"
[36]: https://github.com/ianstormtaylor/slate/issues/419 "Single line? - Slate Issue"
[37]: https://github.com/quill-mention/quill-mention "quill-mention - GitHub"
[38]: https://medium.com/@jhchen/the-state-of-quill-and-2-0-fb38db7a59b9 "The State of Quill and 2.0 - Medium"
[39]: https://www.vice.com/en/article/slacks-new-rich-text-editor-shows-why-markdown-still-scares-people/ "Slack's New Rich Text Editor - Vice"
[40]: https://konstantin.digital/blog/how-to-build-a-text-editor-like-notion "How to Build a Text Editor Like Notion"
[41]: https://github.com/TypeCellOS/BlockNote "BlockNote - GitHub"
[42]: https://linear.app/docs/editor "Editor - Linear Docs"
[43]: https://linear.app/changelog/2024-04-24-editor-improvements "Editor improvements - Linear Changelog"
[44]: https://github.com/github/text-expander-element "text-expander-element - GitHub"
