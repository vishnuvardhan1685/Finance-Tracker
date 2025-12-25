import React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  default: 'text-white shadow-sm bg-[linear-gradient(135deg,var(--ft-accent),var(--ft-accent-2))] hover:opacity-95',
  ghost: 'bg-transparent hover:bg-white/5 text-[color:var(--ft-text)]',
  destructive: 'text-white bg-[color:var(--ft-danger)] hover:brightness-95',
};

const buttonSizes = {
  default: 'h-10 py-2 px-4',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-8 text-base',
};

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ft-ring)] disabled:opacity-50 disabled:pointer-events-none border border-white/10',
        buttonVariants[variant] || buttonVariants.default,
        buttonSizes[size] || buttonSizes.default,
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button };
