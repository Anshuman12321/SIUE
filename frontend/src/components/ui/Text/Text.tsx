import type { ElementType } from 'react'
import { cn } from '@/lib/cn'
import styles from './Text.module.css'

export type TextAs = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type TextColor = 'default' | 'muted' | 'primary' | 'white'

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: TextAs
  size?: TextSize
  weight?: TextWeight
  color?: TextColor
  className?: string
  children?: React.ReactNode
}

const defaultTag: Record<TextAs, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'p',
  span: 'span',
}

const sizeClass: Record<TextSize, string> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  '2xl': 'twoXl',
  '3xl': 'threeXl',
  '4xl': 'fourXl',
}

export const Text = ({
  as = 'p',
  size = 'md',
  weight = 'normal',
  color = 'default',
  className,
  children,
  ...rest
}: TextProps) => {
  const Tag = defaultTag[as]
  return (
    <Tag
      className={cn(styles.text, styles[sizeClass[size]], styles[weight], styles[color], className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}
