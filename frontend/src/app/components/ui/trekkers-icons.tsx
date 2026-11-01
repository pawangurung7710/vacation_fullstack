/**
 * TREKKERS SQUAD ICON LIBRARY
 * Consistent line icons with 20/24px sizes, 1.5px stroke, rounded caps
 * Nature-inspired iconography reflecting responsible travel
 */

import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: 20 | 24;
  className?: string;
}

const createIcon = (paths: React.ReactNode) => {
  return React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, className = "", ...props }, ref) => (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {paths}
      </svg>
    )
  );
};

// Water Bottle - Zero Waste
export const WaterBottleIcon = createIcon(
  <>
    <path d="M9 2h6" />
    <path d="M10 2v2.5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2" />
    <path d="M8 6h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
    <path d="M10 12h4" />
  </>
);

// Leaf - Sustainability
export const LeafIcon = createIcon(
  <>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </>
);

// Mountain - Adventure
export const MountainIcon = createIcon(
  <>
    <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
  </>
);

// Handshake - Community Partnership
export const HandshakeIcon = createIcon(
  <>
    <path d="m11 17 2 2a1 1 0 1 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
    <path d="m21 3 1 11h-2" />
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
    <path d="M3 4h8" />
  </>
);

// Shield - Safety
export const ShieldIcon = createIcon(
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </>
);

// Calendar - Planning
export const CalendarIcon = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>
);

// Map Pin - Location
export const MapPinIcon = createIcon(
  <>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </>
);

// Tree - Reforestation
export const TreeIcon = createIcon(
  <>
    <path d="M12 13v8" />
    <path d="m8 21 4-10 4 10" />
    <path d="M12 3v5" />
    <path d="m6 8 2.5-2.5L12 3l3.5 2.5L18 8" />
    <path d="M12 8v5" />
  </>
);

// Heart - Community Care
export const HeartIcon = createIcon(
  <>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </>
);

// Users - Group/Community
export const UsersIcon = createIcon(
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

// Recycle - Zero Waste
export const RecycleIcon = createIcon(
  <>
    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
    <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
    <path d="m14 16-3 3 3 3" />
    <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
    <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
    <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
  </>
);

// Sun - Climate/Solar
export const SunIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </>
);

// Backpack - Trekking
export const BackpackIcon = createIcon(
  <>
    <path d="M4 10h16" />
    <path d="M6 14h2" />
    <path d="M6 18h2" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <rect x="4" y="6" width="16" height="16" rx="2" />
  </>
);

// Compass - Navigation/Exploration
export const CompassIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </>
);

// Tent - Camping
export const TentIcon = createIcon(
  <>
    <path d="M3.5 21 14 3" />
    <path d="M20.5 21 10 3" />
    <path d="M15.5 21 12 15l-3.5 6" />
    <path d="M2 21h20" />
  </>
);

// Icon Set Object for easy imports
export const TrekkersIcons = {
  WaterBottle: WaterBottleIcon,
  Leaf: LeafIcon,
  Mountain: MountainIcon,
  Handshake: HandshakeIcon,
  Shield: ShieldIcon,
  Calendar: CalendarIcon,
  MapPin: MapPinIcon,
  Tree: TreeIcon,
  Heart: HeartIcon,
  Users: UsersIcon,
  Recycle: RecycleIcon,
  Sun: SunIcon,
  Backpack: BackpackIcon,
  Compass: CompassIcon,
  Tent: TentIcon,
};

export default TrekkersIcons;
