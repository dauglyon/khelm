import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import { sprinkles } from '@/theme/sprinkles.css';
import type { Sprinkles } from '@/theme/sprinkles.css';

type SpacingScale = NonNullable<Sprinkles['gap']>;
type FlexDirection = NonNullable<Sprinkles['flexDirection']>;
type AlignItems = NonNullable<Sprinkles['alignItems']>;
type JustifyContent = NonNullable<Sprinkles['justifyContent']>;
type FlexWrap = NonNullable<Sprinkles['flexWrap']>;

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Flex direction. Default: 'column' */
  direction?: Extract<FlexDirection, 'row' | 'column'>;
  /** Gap between children using the spacing scale. Default: 8 */
  gap?: SpacingScale;
  /** Align items along cross axis */
  align?: AlignItems;
  /** Justify content along main axis */
  justify?: JustifyContent;
  /** Flex wrap behavior */
  wrap?: FlexWrap;
  /** Polymorphic element type. Default: 'div' */
  as?: ElementType;
  children?: ReactNode;
}

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    direction = 'column',
    gap = 8,
    align,
    justify,
    wrap,
    as: Component = 'div',
    className,
    children,
    ...rest
  },
  ref
) {
  const sprinklesClass = sprinkles({
    display: 'flex',
    flexDirection: direction,
    gap,
    ...(align != null ? { alignItems: align } : {}),
    ...(justify != null ? { justifyContent: justify } : {}),
    ...(wrap != null ? { flexWrap: wrap } : {}),
  });

  const mergedClassName = className
    ? `${sprinklesClass} ${className}`
    : sprinklesClass;

  return (
    <Component ref={ref} className={mergedClassName} {...rest}>
      {children}
    </Component>
  );
});
