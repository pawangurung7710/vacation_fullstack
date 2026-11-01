import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

/**
 * TREKKERS SQUAD BUTTON COMPONENT
 * Variants: primary, secondary, ghost, outline
 * Sizes: sm (S), md (M), lg (L)
 * Icons: left/right positioning
 * WCAG AA compliant with visible focus rings
 */

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    "outline-none",
    // WCAG Focus Ring
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-[var(--color-navy-500)]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary - Forest Green (Main CTAs)
        primary: [
          "bg-[var(--color-forest-600)] text-white",
          "hover:bg-[var(--color-forest-700)]",
          "active:bg-[var(--color-forest-800)]",
          "shadow-sm hover:shadow-md",
        ].join(" "),
        
        // Secondary - Glacier Blue
        secondary: [
          "bg-[var(--color-navy-500)] text-white",
          "hover:bg-[var(--color-navy-600)]",
          "active:bg-[var(--color-navy-700)]",
          "shadow-sm hover:shadow-md",
        ].join(" "),
        
        // Ghost - Minimal (Navigation, Tertiary)
        ghost: [
          "bg-transparent text-[var(--color-ink-700)]",
          "hover:bg-[var(--color-stone-100)]",
          "active:bg-[var(--color-stone-200)]",
        ].join(" "),
        
        // Outline - Border only
        outline: [
          "border-2 border-[var(--color-forest-600)]",
          "bg-transparent text-[var(--color-forest-600)]",
          "hover:bg-[var(--color-forest-50)]",
          "active:bg-[var(--color-forest-100)]",
        ].join(" "),
        
        // Destructive
        destructive: [
          "bg-[var(--color-error)] text-white",
          "hover:bg-red-700",
          "active:bg-red-800",
        ].join(" "),
        
        // Link style
        link: [
          "text-[var(--color-navy-500)] underline-offset-4",
          "hover:underline",
          "p-0 h-auto",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-full", // Small - 36px height
        md: "h-11 px-6 text-base rounded-full", // Medium (default) - 44px height
        lg: "h-12 px-8 text-lg rounded-full", // Large - 48px height
        icon: "size-11 rounded-full", // Icon button - 44x44px
      },
      iconPosition: {
        left: "flex-row",
        right: "flex-row-reverse",
        none: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      iconPosition: "none",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconPosition, icon, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Auto-detect icon position if icon is provided but position isn't
    const effectiveIconPosition = icon && !iconPosition ? "left" : iconPosition;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, iconPosition: effectiveIconPosition, className }))}
        ref={ref}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {icon && effectiveIconPosition === "left" && (
              <span className="[&>svg]:size-5">{icon}</span>
            )}
            {children}
            {icon && effectiveIconPosition === "right" && (
              <span className="[&>svg]:size-5">{icon}</span>
            )}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
