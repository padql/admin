import * as React from "react"
import { cn } from "@/lib/utils"

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variant === "default" && "bg-indigo-600 text-white hover:bg-indigo-700",
          variant === "outline" && "border border-gray-300 hover:bg-gray-100",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-8 px-3",
          size === "lg" && "h-12 px-6",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
