import { iconRegistry } from './icons';
import { iconBase, iconSizes } from './Icon.css';

export interface IconProps {
  /** Icon name from the registry */
  name: string;
  /** Icon size in pixels. Default: 20 */
  size?: 16 | 20 | 24;
  /** Icon color. Default: 'currentColor' */
  color?: string;
  /** Additional CSS class name */
  className?: string;
  /** aria-label for accessible icons */
  'aria-label'?: string;
  /** data-testid for testing */
  'data-testid'?: string;
}

export function Icon({
  name,
  size = 20,
  color = 'currentColor',
  className,
  ...rest
}: IconProps) {
  const IconComponent = iconRegistry[name];
  if (!IconComponent) {
    console.warn(`Icon: unknown icon name "${name}"`);
    return null;
  }

  const sizeClass = iconSizes[size];
  const mergedClassName = [iconBase, sizeClass, className].filter(Boolean).join(' ');

  const hasAriaLabel = rest['aria-label'] != null;

  return (
    <span
      className={mergedClassName}
      style={{ color }}
      aria-hidden={hasAriaLabel ? undefined : true}
      role={hasAriaLabel ? 'img' : undefined}
      aria-label={rest['aria-label']}
      data-testid={rest['data-testid']}
    >
      <IconComponent aria-hidden="true" />
    </span>
  );
}
