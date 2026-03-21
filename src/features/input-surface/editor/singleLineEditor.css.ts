import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const editorWrapper = style({
  flex: 1,
  minWidth: 0,
  position: 'relative',
});

export const editorContainer = style({
  width: '100%',
  fontFamily: vars.font.sans,
  fontSize: '15px',
  lineHeight: '24px',
  color: vars.color.text,
  background: 'transparent',
  outline: 'none',
  border: 'none',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
});

// Style the ProseMirror editor content
globalStyle(`${editorContainer} .ProseMirror`, {
  outline: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  whiteSpace: 'nowrap',
  overflowX: 'hidden',
});

globalStyle(`${editorContainer} .ProseMirror p`, {
  margin: 0,
  padding: 0,
});

// Placeholder
globalStyle(`${editorContainer} .ProseMirror p.is-editor-empty:first-child::before`, {
  content: 'attr(data-placeholder)',
  color: vars.color.textLight,
  pointerEvents: 'none',
  position: 'absolute',
  left: 0,
  top: 0,
  fontStyle: 'normal',
});

export const disabled = style({
  opacity: 0.5,
  pointerEvents: 'none',
});
