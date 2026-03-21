import type { SVGAttributes } from 'react';
import { iconPaths } from './icons';
import { iconBase } from './Icon.css';

export interface IconProps extends SVGAttributes<SVGElement> {
  /** Icon name from the registry */
  name: string;
  /** Icon size in pixels. Default: 20 */
  size?: 16 | 20 | 24;
  /** Icon color. Default: 'currentColor' */
  color?: string;
}

export function Icon({
  name,
  size = 20,
  color = 'currentColor',
  className,
  ...rest
}: IconProps) {
  const paths = iconPaths[name];
  if (!paths) {
    return null;
  }

  const mergedClassName = className
    ? `${iconBase} ${className}`
    : iconBase;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      color={color}
      aria-hidden="true"
      className={mergedClassName}
      {...rest}
    >
      {paths}
    </svg>
  );
}
