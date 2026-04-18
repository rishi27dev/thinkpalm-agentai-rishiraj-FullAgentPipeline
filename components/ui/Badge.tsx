import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Badge({ className, children, ...props }: BadgeProps) {
    return (
        <div
            className={`inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
