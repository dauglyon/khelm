import { skeletonBase, skeletonCircle, skeletonLine } from './Skeleton.css';

export interface SkeletonProps {
  /** Shape variant. Default: 'text' */
  variant?: 'text' | 'rect' | 'circle';
  /** Width of the skeleton. Default: '100%' */
  width?: string | number;
  /**
   * Height of the skeleton. Derived from variant if not specified.
   * Note: ignored for the circle variant — the diameter is derived from `width`
   * alone so that a perfect circle is always produced.
   */
  height?: string | number;
  /** Number of text lines (text variant only). Default: 1 */
  lines?: number;
  /** Additional CSS class */
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
}: SkeletonProps) {
  if (variant === 'text') {
    // lines <= 0: render nothing
    if (lines <= 0) return null;

    const resolvedWidth =
      width === undefined
        ? '100%'
        : typeof width === 'number'
          ? `${width}px`
          : width;

    const lineHeight = height ?? 20;
    const resolvedLineHeight =
      typeof lineHeight === 'number' ? `${lineHeight}px` : lineHeight;

    if (lines <= 1) {
      const baseClass = [skeletonBase, skeletonLine, className]
        .filter(Boolean)
        .join(' ');
      return (
        <div
          aria-hidden="true"
          className={baseClass}
          style={{ width: resolvedWidth, height: resolvedLineHeight }}
        />
      );
    }

    const containerClass = className || undefined;
    return (
      <div aria-hidden="true" className={containerClass}>
        {Array.from({ length: lines }, (_, i) => {
          const isLast = i === lines - 1;
          const lineWidth = isLast ? '80%' : resolvedWidth;
          const lineClass = `${skeletonBase} ${skeletonLine}`;
          return (
            <div
              key={i}
              className={lineClass}
              style={{ width: lineWidth, height: resolvedLineHeight }}
            />
          );
        })}
      </div>
    );
  }

  if (variant === 'circle') {
    const diameter = width ?? 40;
    const resolvedDiameter =
      typeof diameter === 'number' ? `${diameter}px` : diameter;
    const baseClass = [skeletonBase, skeletonCircle, className]
      .filter(Boolean)
      .join(' ');
    return (
      <div
        aria-hidden="true"
        className={baseClass}
        style={{ width: resolvedDiameter, height: resolvedDiameter }}
      />
    );
  }

  // rect variant
  const resolvedWidth =
    width === undefined
      ? '100%'
      : typeof width === 'number'
        ? `${width}px`
        : width;
  const resolvedHeight = height ?? '100px';
  const resolvedHeightStr =
    typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight;
  const baseClass = [skeletonBase, className].filter(Boolean).join(' ');
  return (
    <div
      aria-hidden="true"
      className={baseClass}
      style={{ width: resolvedWidth, height: resolvedHeightStr }}
    />
  );
}
