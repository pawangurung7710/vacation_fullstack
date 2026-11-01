/**
 * Default per-trip "Trip Notes" content — mirror of
 * `backend/src/data/tripNotes.defaults.js`. Keep the two in sync.
 *
 * Used as the public-page fallback for trips with no saved notes and as the
 * "reset to defaults" source in the CMS editor.
 */

export type TripNoteBlockType =
  | 'paragraph'
  | 'subheading'
  | 'bullets'
  | 'numbered'
  | 'tip'
  | 'warning'
  | 'note'
  | 'contact'
  | 'pricegrid';

export interface TripNoteBlock {
  type: TripNoteBlockType;
  text?: string;
  items?: string[];
  rows?: Array<{ label?: string; value?: string }>;
  tone?: 'default' | 'danger';
}

export interface TripNoteSection {
  key: string;
  title: string;
  icon: string;
  enabled: boolean;
  blocks: TripNoteBlock[];
}

export interface TripNotesOverview {
  tripStyle?: string;
  accommodationSummary?: string;
  mealsSummary?: string;
  bestSeason?: string;
  tripCode?: string;
}

export interface TripNotes {
  enabled: boolean;
  overview: TripNotesOverview;
  sections: TripNoteSection[];
}

export const TRIP_NOTE_ICON_KEYS = [
  'info',
  'heart',
  'phone',
  'file-text',
  'shield',
  'utensils',
  'bed',
  'bus',
  'wallet',
  'backpack',
  'wifi',
  'cloud-sun',
  'users',
  'leaf',
  'star',
  'globe',
  'mountain',
] as const;

export const DEFAULT_TRIP_NOTES_OVERVIEW: TripNotesOverview = {
  tripStyle: 'Responsible trekking',
  accommodationSummary: 'Eco-lodges & homestays',
  mealsSummary: 'Most meals included',
  bestSeason: 'Mar – May, Sep – Nov',
  tripCode: '',
};

export const DEFAULT_TRIP_NOTE_SECTIONS: TripNoteSection[] = [
  {
    key: 'right-for-you',
    title: 'Is this trip right for you?',
    icon: 'heart',
    enabled: true,
    blocks: [
      {
        type: 'paragraph',
        text: 'Read this before you book — it will help you decide whether this journey is the right match for your fitness, interests, and travel style.',
      },
      {
        type: 'bullets',
        items: [
          'You should be comfortable walking 5–8 hours a day on uneven mountain terrain carrying a daypack.',
          'Cardiovascular fitness is essential. We recommend training with hill walks for 6–8 weeks before departure.',
          'Temperatures vary dramatically: warm valleys by day, near-freezing at high camps at night. Layering is key.',
          'Accommodation is intentionally simple — cosy teahouses and family homestays rather than hotels. Expect shared bathrooms at some stops.',
          'Some days involve very early starts (5–6 am) to make the most of daylight and stable weather windows.',
          'Hot showers and charging points are available most nights, but not always guaranteed at the highest elevations.',
          'This trip is designed for travellers who value authentic cultural depth over fast-paced sightseeing.',
        ],
      },
      {
        type: 'tip',
        text: "Not sure if you're ready? Email us — our team is happy to talk through your fitness level and experience before you commit.",
      },
    ],
  },
  {
    key: 'emergency',
    title: 'Emergency contact information',
    icon: 'phone',
    enabled: true,
    blocks: [
      { type: 'subheading', text: '24-hour emergency line' },
      {
        type: 'paragraph',
        text: 'If you experience a problem on your trip, contact your group leader immediately. If the issue cannot be resolved, contact our operations team using the details below. We would always rather fix things on the spot.',
      },
      {
        type: 'contact',
        tone: 'danger',
        text: 'Trekkers Squad Operations',
        items: ['+977 1 4479 488 (24 hours)', 'WhatsApp: +977 98 0000 1234', 'emergency@trekkerssquad.example'],
      },
      { type: 'subheading', text: 'Escalation process' },
      {
        type: 'numbered',
        items: [
          'Raise the concern with your group leader first — most issues are resolved on the ground.',
          'If unresolved within 24 hours, contact the operations line above.',
          'For post-trip feedback or complaints, write to us within 30 days of your return so we can respond fully.',
        ],
      },
    ],
  },
  {
    key: 'visas',
    title: 'Passports, visas & entry requirements',
    icon: 'file-text',
    enabled: true,
    blocks: [
      { type: 'subheading', text: 'Entry requirements' },
      {
        type: 'paragraph',
        text: 'Entry rules depend on your passport and destination. Check official government guidance and confirm your visa needs before you book.',
      },
      {
        type: 'pricegrid',
        rows: [
          { label: 'Visa fee (if required)', value: 'Varies by destination' },
        ],
      },
      { type: 'subheading', text: 'Passport requirements' },
      {
        type: 'bullets',
        items: [
          'Your passport must be valid for at least 6 months beyond your return date.',
          'The name on your booking must exactly match the name in your passport.',
          'Bring 2 passport-size photos for the visa application form at the airport.',
        ],
      },
      {
        type: 'note',
        text: "Visa regulations change — always verify requirements with your country's embassy or a trusted visa service before travel.",
      },
    ],
  },
  {
    key: 'health',
    title: 'Health & vaccinations',
    icon: 'shield',
    enabled: true,
    blocks: [
      { type: 'subheading', text: 'Recommended vaccinations' },
      {
        type: 'paragraph',
        text: 'Vaccination requirements depend on your destination. We recommend consulting a travel health clinic 6–8 weeks before departure and checking official travel health guidance.',
      },
      {
        type: 'bullets',
        items: [
          'Hepatitis A & B',
          'Typhoid',
          'Tetanus / Diphtheria',
          'Rabies (if planning extensive rural time)',
          'Japanese Encephalitis (for longer stays May–October)',
        ],
      },
      { type: 'subheading', text: 'Altitude sickness' },
      {
        type: 'paragraph',
        text: 'Acute Mountain Sickness (AMS) is a real risk above 3,500 m. Our itinerary builds in dedicated acclimatisation days and your guide monitors the group twice daily using pulse oximeters. Key rules: ascend slowly, hydrate well, and never ignore symptoms.',
      },
      {
        type: 'paragraph',
        text: 'Altitude medication such as acetazolamide can help prevent and treat altitude sickness — discuss this with your doctor well before departure.',
      },
      {
        type: 'warning',
        text: 'If any member of the group shows severe AMS symptoms — confusion, inability to walk, or extreme breathlessness at rest — descent is immediate and non-negotiable, regardless of itinerary.',
      },
      { type: 'subheading', text: 'Medical kit' },
      {
        type: 'paragraph',
        text: 'Your guide carries a comprehensive wilderness first-aid kit including blister care, wound dressings, altitude medications, and an SAT phone. We maintain 24/7 contact with helicopter evacuation services.',
      },
    ],
  },
  {
    key: 'food',
    title: 'Food & dietary requirements',
    icon: 'utensils',
    enabled: true,
    blocks: [
      { type: 'subheading', text: 'What to expect' },
      {
        type: 'paragraph',
        text: 'Meals are prepared by local hosts, lodge cooks and our own trip crew using seasonal, locally sourced ingredients where possible. Expect hearty, simple food that suits long days outdoors. Menus are shorter in remote areas.',
      },
      { type: 'subheading', text: 'Dietary needs' },
      {
        type: 'paragraph',
        text: 'We accommodate vegetarian, vegan, and most common allergies with advance notice. Please declare all dietary requirements at the time of booking. Gluten-free options are limited at high-altitude teahouses — bring supplementary snacks if needed.',
      },
      { type: 'subheading', text: 'Drinking water' },
      {
        type: 'paragraph',
        text: 'Tap water is not safe to drink. Your guide carries a group water filter and iodine tablets. Please bring a reusable 1-litre bottle — single-use plastic bottles are not permitted on Trekkers Squad trips.',
      },
      {
        type: 'tip',
        text: 'Pack a small supply of your favourite energy bars or snacks for big trekking days. Local trail snacks (samosas, biscuits, dried fruit) are also widely available.',
      },
    ],
  },
  {
    key: 'accommodation',
    title: 'Accommodation',
    icon: 'bed',
    enabled: true,
    blocks: [
      { type: 'subheading', text: 'Types of accommodation' },
      {
        type: 'paragraph',
        text: 'You will stay in a mix of eco-lodges and community homestays, all carefully selected for their sustainability credentials, family ownership, and authentic character.',
      },
      { type: 'subheading', text: 'Eco-lodges' },
      {
        type: 'bullets',
        items: [
          'Solar-powered lighting and hot water where available.',
          'Composting waste systems and filtered water on tap.',
          'Twin or double rooms, all en-suite or with shared bathroom.',
          'Wi-Fi available in common areas at most lodges.',
        ],
      },
      { type: 'subheading', text: 'Homestays' },
      {
        type: 'bullets',
        items: [
          'Rooms in family homes — expect modest furnishings and a warm welcome.',
          'Shared bathroom facilities are common.',
          'Meals cooked by host families using their own garden produce.',
          'A genuine cultural exchange; families often join for evening storytelling.',
        ],
      },
      {
        type: 'note',
        text: 'Room allocation is managed by your guide. Single travellers will share with a same-gender group member unless a single supplement has been purchased in advance.',
      },
    ],
  },
  {
    key: 'transport',
    title: 'Transport',
    icon: 'bus',
    enabled: true,
    blocks: [
      { type: 'subheading', text: 'Airport transfers' },
      {
        type: 'paragraph',
        text: 'A private vehicle transfer from the designated arrival point to your first stay is included. Your trip documents list the pickup details.',
      },
      { type: 'subheading', text: 'During the trek' },
      {
        type: 'bullets',
        items: [
          'Private EV vans for inter-city road transfers where the itinerary requires.',
          'Shared jeeps on mountain roads — seats are allocated by your guide.',
          'All trekking sections are on foot; no animals or motorised transport on trail.',
          'Internal flights (where applicable) are included in your trip price.',
        ],
      },
      { type: 'subheading', text: 'Road conditions' },
      {
        type: 'paragraph',
        text: 'Mountain and rural roads can be narrow, unpaved and subject to closures in bad weather. Journey times are estimates — factor in flexibility. Your guide will keep you informed of any changes.',
      },
    ],
  },
  {
    key: 'money',
    title: 'Money matters',
    icon: 'wallet',
    enabled: true,
    blocks: [
      { type: 'subheading', text: 'Currency' },
      {
        type: 'paragraph',
        text: 'Check the local currency for your destination. Bring a card and a small amount of cash for snacks, tips and shops. ATMs are available in larger towns but rare in remote areas.',
      },
      { type: 'subheading', text: 'Spending money' },
      {
        type: 'paragraph',
        text: 'Budget a modest amount for personal expenses such as snacks, drinks and souvenirs. Your trip notes list typical costs for your destination.',
      },
      { type: 'subheading', text: 'Tipping' },
      {
        type: 'paragraph',
        text: 'Tips are not included in your trip price and are warmly appreciated by guides, drivers and lodge staff. Your guide will share suggested amounts at the pre-trip briefing.',
      },
      { type: 'subheading', text: 'Group kitty' },
      {
        type: 'paragraph',
        text: 'Some trips use a small group kitty for shared extras. If yours does, your guide will explain how it works at the start of the trip and give you a receipt at the end.',
      },
      {
        type: 'warning',
        text: 'Independent shops in tourist areas may offer commissions to guides or drivers. Your guide will not receive commissions from our recommended suppliers, but independent shops may differ. Shop where you feel comfortable.',
      },
    ],
  },
  {
    key: 'packing',
    title: 'Packing',
    icon: 'backpack',
    enabled: true,
    blocks: [
      { type: 'subheading', text: 'Essentials' },
      {
        type: 'bullets',
        items: [
          'Broken-in, waterproof trekking boots with ankle support',
          'Moisture-wicking base layers (2–3 sets)',
          'Insulating mid-layer (fleece or down jacket)',
          'Waterproof outer shell jacket and trousers',
          'Warm hat, sun hat, UV-protection sunglasses',
          'Reusable 1-litre water bottle',
          'Biodegradable sunscreen (SPF 50+) and lip balm',
          'Personal first-aid kit and any prescription medications',
          'Headlamp with spare batteries',
          'Passport, visa documents, and travel insurance details',
        ],
      },
      { type: 'subheading', text: 'Recommended' },
      {
        type: 'bullets',
        items: [
          'Lightweight trekking poles (also available to rent)',
          'Sleeping bag liner (lodges provide blankets)',
          'Gaiters for muddy or snowy trail sections',
          'Camera and spare memory cards',
          'Portable power bank (charging is limited on trail)',
          'Small daypack (20–25 litres)',
        ],
      },
      { type: 'subheading', text: 'Leave at home' },
      {
        type: 'bullets',
        items: [
          'Single-use plastic bottles — Trekkers Squad has a zero-plastic policy',
          'Heavy toiletries — biodegradable travel-size only please',
          'Valuables you cannot afford to lose or damage',
          'Anything you would not want to carry uphill for 8 hours',
        ],
      },
      {
        type: 'tip',
        text: 'Porters carry up to 10 kg of your main bag. Pack a separate small daypack with what you need on trail each day — snacks, layers, camera, water, sunscreen.',
      },
    ],
  },
  {
    key: 'connectivity',
    title: 'Phone & internet access',
    icon: 'wifi',
    enabled: true,
    blocks: [
      { type: 'subheading', text: 'Wi-Fi' },
      {
        type: 'paragraph',
        text: 'Wi-Fi is available in common areas at many lodges and in towns. Expect slow speeds and occasional outages. In remote areas and at high elevations there may be no signal at all.',
      },
      { type: 'subheading', text: 'SIM cards' },
      {
        type: 'paragraph',
        text: 'A local SIM or eSIM is usually the cheapest way to stay connected in towns. Coverage on the trail varies, so download maps and documents before you leave.',
      },
      { type: 'subheading', text: 'The Trekkers Squad app' },
      {
        type: 'paragraph',
        text: 'Download the Trekkers Squad app before you travel — it works offline and contains your full trip notes, day-by-day itinerary, cultural guides, emergency contacts, and trail maps.',
      },
    ],
  },
  {
    key: 'climate',
    title: 'Climate & seasonal information',
    icon: 'cloud-sun',
    enabled: true,
    blocks: [
      { type: 'subheading', text: 'Spring (March – May)' },
      {
        type: 'paragraph',
        text: 'The most popular trekking season. Rhododendrons bloom, skies are clear, and temperatures are pleasant at altitude (5–15°C). Pre-monsoon humidity builds in late May.',
      },
      { type: 'subheading', text: 'Monsoon (June – August)' },
      {
        type: 'paragraph',
        text: 'Heavy rainfall and limited visibility are likely. Many trips do not run in this period — check the departures list or contact us for alternatives.',
      },
      { type: 'subheading', text: 'Autumn (September – November)' },
      {
        type: 'paragraph',
        text: 'Crisp post-monsoon skies offer the clearest mountain views of the year. October is peak season — book well in advance. Temperatures drop sharply from November.',
      },
      { type: 'subheading', text: 'Winter (December – February)' },
      {
        type: 'paragraph',
        text: 'Cold and quiet. High passes may be snow-covered, but lower altitude routes remain accessible. Expect 0–10°C in the valleys and below -10°C at camp.',
      },
      { type: 'subheading', text: 'Notable festivals' },
      {
        type: 'bullets',
        items: [
          'Check local festival dates before you travel',
          'Peak holiday weeks can mean busier trails',
          'Local public holidays (some lodges and shops close)',
          'Book popular holiday weeks early',
        ],
      },
    ],
  },
  {
    key: 'group-leader',
    title: 'Your group leader',
    icon: 'users',
    enabled: true,
    blocks: [
      {
        type: 'paragraph',
        text: 'Your group leader is a licensed, locally based guide with deep knowledge of the region\'s culture, ecology and mountain safety. They are your first point of contact on the trip.',
      },
      { type: 'subheading', text: 'What to expect' },
      {
        type: 'bullets',
        items: [
          'Wilderness First Responder certified with 10+ years of high-altitude experience.',
          'Fluent in English and at least one local language.',
          "Daily morning briefings covering the day's plan, weather, and safety considerations.",
          'Evening storytelling sessions on local history, culture, and ecology.',
          'Pulse oximeter readings and altitude wellness checks at each camp.',
        ],
      },
      {
        type: 'note',
        text: 'Specific guide assignments are confirmed 2 weeks before departure. If you have a language preference or accessibility need, let us know at the time of booking.',
      },
    ],
  },
  {
    key: 'safety',
    title: 'Safety',
    icon: 'shield',
    enabled: true,
    blocks: [
      { type: 'subheading', text: 'Travel advisories' },
      {
        type: 'paragraph',
        text: 'Check your government\'s current travel advisory for your destination before booking. We monitor conditions on the ground and will tell you promptly if anything affects your trip.',
      },
      { type: 'subheading', text: 'Personal safety' },
      {
        type: 'bullets',
        items: [
          'Keep a photocopy of your passport and insurance details separate from the originals.',
          'Do not trek alone — always stay with the group or inform your guide before deviating.',
          'Avoid displaying expensive items (cameras, jewellery) in busy market areas.',
          "Use your guide's recommended money-changing services — street changers are often fraudulent.",
        ],
      },
      { type: 'subheading', text: 'LGBTQIA+ travellers' },
      {
        type: 'paragraph',
        text: 'We welcome travellers of all backgrounds. Local attitudes vary by destination, so ask us for specific guidance before you travel.',
      },
      { type: 'subheading', text: "Women's safety" },
      {
        type: 'bullets',
        items: [
          'Dress modestly in villages and religious sites — cover shoulders and knees.',
          'Walk confidently and avoid isolated areas after dark.',
          'Trust your instincts — your guide is always available if you feel uncomfortable.',
          'Solo female travellers are common on Trekkers Squad trips; our guides are briefed on ensuring inclusive group dynamics.',
        ],
      },
    ],
  },
  {
    key: 'responsible',
    title: 'Responsible travel',
    icon: 'leaf',
    enabled: true,
    blocks: [
      {
        type: 'paragraph',
        text: 'Responsible travel means leaving places better than you found them. On a Trekkers Squad trip, that is not just philosophy — it is built into every decision, from who cooks your meals to how your porters are paid.',
      },
      { type: 'subheading', text: 'Our commitments' },
      {
        type: 'bullets',
        items: [
          'Zero single-use plastic — we provide refillable bottles and group water filters.',
          'Fair wages — all guides and porters are paid 40–60% above industry standard.',
          'Porter welfare — including appropriate clothing, load limits, and insurance.',
          'Community contributions — 5% of your trip fee goes directly to local development projects.',
          'Minimal-trace trekking — we follow Leave No Trace principles on all trails.',
        ],
      },
      { type: 'subheading', text: 'Local customs' },
      {
        type: 'bullets',
        items: [
          'Remove shoes before entering homes and temples.',
          'Ask before photographing people — respect a "no".',
          'Use your right hand for eating, giving, and receiving.',
          'Walk clockwise around religious monuments (stupas, mani walls).',
          'Learn a few words of the local language — a simple greeting goes a very long way.',
        ],
      },
    ],
  },
  {
    key: 'insurance',
    title: 'Travel insurance',
    icon: 'file-text',
    enabled: true,
    blocks: [
      {
        type: 'paragraph',
        text: 'Comprehensive travel insurance is compulsory on all Trekkers Squad trips. Your policy must include:',
      },
      {
        type: 'bullets',
        items: [
          'Emergency medical evacuation by helicopter (minimum USD 100,000 cover)',
          'High-altitude trekking activity cover (up to at least 5,000 m)',
          'Trip cancellation and curtailment',
          'Medical expenses and hospitalisation',
          'Personal liability',
        ],
      },
      {
        type: 'paragraph',
        text: 'You will be asked to provide your insurance provider name and policy number before departure. Travellers without valid insurance cannot join the trip — no exceptions.',
      },
      {
        type: 'warning',
        text: 'Standard travel insurance policies often exclude high-altitude activities. Always read the small print and call your insurer to confirm altitude coverage before purchasing.',
      },
    ],
  },
  {
    key: 'foundation',
    title: 'Giving back',
    icon: 'heart',
    enabled: true,
    blocks: [
      {
        type: 'paragraph',
        text: 'A small share of every booking supports local trail maintenance and community projects in the places we visit, including:',
      },
      { type: 'subheading', text: 'Trail care' },
      {
        type: 'paragraph',
        text: 'We work with local partners to repair paths, bridges and signage so popular routes stay open and safe.',
      },
      { type: 'subheading', text: 'Local business support' },
      {
        type: 'paragraph',
        text: 'We buy from local lodges, cooks and suppliers wherever we can, and pay fair prices.',
      },
      {
        type: 'tip',
        text: 'Want to give more? Ask us about adding a donation to local projects at the time of booking.',
      },
    ],
  },
];

export const DEFAULT_TRIP_NOTES: TripNotes = {
  enabled: true,
  overview: DEFAULT_TRIP_NOTES_OVERVIEW,
  sections: DEFAULT_TRIP_NOTE_SECTIONS,
};
