import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

/**
 * TREKKERS SQUAD BADGE COMPONENT
 * Sustainability badges: Zero Waste, Low-carbon, Local hire, Inclusive growth
 * Variants: default, sustainability, meta, category
 * Sizes: sm, md, lg
 */

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 rounded-full",
    "font-medium whitespace-nowrap",
    "transition-colors duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default - Neutral
        default: [
          "bg-[var(--color-stone-200)] text-[var(--color-ink-700)]",
          "border border-[var(--color-stone-300)]",
        ].join(" "),
        
        // Sustainability - Green theme
        sustainability: [
          "bg-[var(--color-forest-100)] text-[var(--color-forest-800)]",
          "border border-[var(--color-forest-300)]",
        ].join(" "),
        
        // Zero Waste specific
        zeroWaste: [
          "bg-[var(--color-forest-100)] text-[var(--color-forest-800)]",
          "border border-[var(--color-forest-400)]",
        ].join(" "),
        
        // Low Carbon - Blue theme
        lowCarbon: [
          "bg-[var(--color-navy-100)] text-[var(--color-navy-800)]",
          "border border-[var(--color-navy-400)]",
        ].join(" "),
        
        // Local Hire - Saffron theme
        localHire: [
          "bg-[var(--color-sun-100)] text-[var(--color-sun-800)]",
          "border border-[var(--color-sun-400)]",
        ].join(" "),
        
        // Inclusive Growth - Purple theme
        inclusiveGrowth: [
          "bg-purple-100 text-purple-800",
          "border border-purple-400",
        ].join(" "),
        
        // Meta info (region, duration, difficulty)
        meta: [
          "bg-white text-[var(--color-ink-700)]",
          "border border-[var(--color-stone-300)]",
        ].join(" "),
        
        // Category tags
        category: [
          "bg-[var(--color-navy-50)] text-[var(--color-navy-700)]",
          "border border-[var(--color-navy-200)]",
        ].join(" "),
        
        // Outline
        outline: [
          "bg-transparent text-[var(--color-ink-700)]",
          "border-2 border-[var(--color-stone-400)]",
        ].join(" "),
      },
      size: {
        sm: "px-2 py-0.5 text-xs", // 12px text
        md: "px-3 py-1 text-sm",   // 14px text (default)
        lg: "px-4 py-1.5 text-base", // 16px text
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {icon && <span className="[&>svg]:size-3.5">{icon}</span>}
      {children}
    </div>
  );
}

// Pre-defined sustainability badges for easy use
const SustainabilityBadges = {
  ZeroWaste: ({ ...props }) => (
    <Badge {...props} variant="zeroWaste">
      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Zero Waste
    </Badge>
  ),
  
  LowCarbon: ({ ...props }) => (
    <Badge {...props} variant="lowCarbon">
      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
      Low-carbon
    </Badge>
  ),
  
  LocalHire: ({ ...props }) => (
    <Badge {...props} variant="localHire">
      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      Local Hire
    </Badge>
  ),
  
  InclusiveGrowth: ({ ...props }) => (
    <Badge {...props} variant="inclusiveGrowth">
      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      Inclusive Growth
    </Badge>
  ),
};

function normalizeSustainabilityLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z]/g, "");
}

type SustainabilityBadgeProps = Omit<BadgeProps, "children" | "variant"> & {
  label: string;
};

function SustainabilityBadge({ label, icon, ...props }: SustainabilityBadgeProps) {
  switch (normalizeSustainabilityLabel(label)) {
    case "zerowaste":
      return <SustainabilityBadges.ZeroWaste {...props} />;
    case "lowcarbon":
      return <SustainabilityBadges.LowCarbon {...props} />;
    case "localhire":
      return <SustainabilityBadges.LocalHire {...props} />;
    case "inclusivegrowth":
      return <SustainabilityBadges.InclusiveGrowth {...props} />;
    default:
      return (
        <Badge {...props} variant="outline" icon={icon}>
          {label}
        </Badge>
      );
  }
}

export { Badge, badgeVariants, SustainabilityBadges, SustainabilityBadge };
