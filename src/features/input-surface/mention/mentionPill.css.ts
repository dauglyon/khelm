import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/theme';

export const pillBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '12px',
  padding: '1px 8px',
  fontSize: '13px',
  fontFamily: vars.font.sans,
  lineHeight: '20px',
  fontWeight: 500,
  userSelect: 'none',
  whiteSpace: 'nowrap',
  borderWidth: '1px',
  borderStyle: 'solid',
  verticalAlign: 'baseline',
});

export const pillColorVariants = styleVariants({
  sql: {
    color: vars.color.inputType.sql.fg,
    backgroundColor: vars.color.inputType.sql.bg,
    borderColor: vars.color.inputType.sql.border,
  },
  python: {
    color: vars.color.inputType.python.fg,
    backgroundColor: vars.color.inputType.python.bg,
    borderColor: vars.color.inputType.python.border,
  },
  literature: {
    color: vars.color.inputType.literature.fg,
    backgroundColor: vars.color.inputType.literature.bg,
    borderColor: vars.color.inputType.literature.border,
  },
  hypothesis: {
    color: vars.color.inputType.hypothesis.fg,
    backgroundColor: vars.color.inputType.hypothesis.bg,
    borderColor: vars.color.inputType.hypothesis.border,
  },
  note: {
    color: vars.color.inputType.note.fg,
    backgroundColor: vars.color.inputType.note.bg,
    borderColor: vars.color.inputType.note.border,
  },
  dataIngest: {
    color: vars.color.inputType.dataIngest.fg,
    backgroundColor: vars.color.inputType.dataIngest.bg,
    borderColor: vars.color.inputType.dataIngest.border,
  },
});
