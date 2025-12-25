import React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
        type={type}
        className={cn(
            'flex h-10 w-full rounded-xl border border-[color:var(--ft-border)] bg-[color:var(--ft-surface-2)] px-3 py-2 text-sm text-[color:var(--ft-text)] placeholder:text-[color:var(--ft-muted-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ft-ring)] disabled:cursor-not-allowed disabled:opacity-50',
            className
        )}
        ref={ref}
        {...props}
        />
    );
});

Input.displayName = 'Input';

export { Input };
