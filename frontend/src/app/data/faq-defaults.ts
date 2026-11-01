export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  title: string;
  icon: string;
  faqs: FAQItem[];
  order?: number;
}

export const defaultFaqCategories: FAQCategory[] = [
  {
    "title": "Trip Planning",
    "icon": "🗺️",
    "order": 1,
    "faqs": [
      {
        "question": "How do I choose the right trip?",
        "answer": "Start with the difficulty rating and daily distance on each trip page, then check the season. If you are unsure, use the trek finder on the homepage or message us and we will suggest two or three options."
      },
      {
        "question": "How far in advance should I book?",
        "answer": "Popular departures fill 3 to 6 months ahead, especially in peak season. Many trips still have space closer to the date, and the departures list on each trip page shows live availability."
      },
      {
        "question": "What fitness level do I need?",
        "answer": "Each trip is rated easy, moderate, challenging or expert. Easy trips suit anyone who can walk for a few hours. Challenging and expert trips need regular training for several weeks beforehand."
      },
      {
        "question": "What size are your groups?",
        "answer": "Most trips run with 6 to 16 people, never more. Small groups mean more time with your guide and a more flexible pace."
      },
      {
        "question": "Can I travel solo?",
        "answer": "Yes. Many guests join on their own. Rooms are shared by default and a single supplement is available on most trips."
      },
      {
        "question": "Do you run private or custom trips?",
        "answer": "Yes. Tell us your dates, group size and interests and we will price a private departure or adapt an existing itinerary."
      }
    ]
  },
  {
    "title": "Booking & Payments",
    "icon": "💳",
    "order": 2,
    "faqs": [
      {
        "question": "How do I book?",
        "answer": "Pick a departure on the trip page, add your details and pay the deposit online. You will get a confirmation email with your booking reference straight away."
      },
      {
        "question": "How much is the deposit?",
        "answer": "A deposit of 20% secures your place. The balance is due 60 days before departure for most trips."
      },
      {
        "question": "What is your cancellation policy?",
        "answer": "You can cancel free of charge up to 60 days before departure. After that, charges increase as the date gets closer. Full terms are in your booking confirmation."
      },
      {
        "question": "Which payment methods do you accept?",
        "answer": "All major credit and debit cards. Bank transfer is available for private groups."
      },
      {
        "question": "Can I change my dates?",
        "answer": "Yes, subject to availability. Changes made more than 60 days before departure are free."
      },
      {
        "question": "Is travel insurance included?",
        "answer": "No. Insurance that covers medical care, evacuation and cancellation is required on every trip."
      }
    ]
  },
  {
    "title": "Safety & Health",
    "icon": "🩺",
    "order": 3,
    "faqs": [
      {
        "question": "How do you keep groups safe?",
        "answer": "Every trip has a qualified lead guide, a first-aid kit and a communication plan. We brief the group daily, monitor the weather and change plans when conditions call for it."
      },
      {
        "question": "Are your guides trained in first aid?",
        "answer": "Yes. Lead guides hold current wilderness first-aid certification, and expedition trips include a medic or a second certified guide."
      },
      {
        "question": "What if the weather turns bad?",
        "answer": "Your guide makes the call. We build buffer days into many itineraries and may reroute or shorten a day. Safety always comes before the schedule."
      },
      {
        "question": "Do I need any vaccinations?",
        "answer": "It depends on your destination. Check official travel health guidance for your country at least 8 weeks before you travel and speak to a doctor."
      },
      {
        "question": "What about altitude?",
        "answer": "Trips above 2,500 m include gradual acclimatisation and daily health checks. Tell your guide straight away if you feel unwell."
      }
    ]
  },
  {
    "title": "Gear & Preparation",
    "icon": "🎒",
    "order": 4,
    "faqs": [
      {
        "question": "What should I pack?",
        "answer": "You will get a trip-specific packing list after booking. In general: layers, a waterproof jacket, broken-in footwear, a day pack and a refillable bottle."
      },
      {
        "question": "Can I rent gear?",
        "answer": "Yes. Boots, poles, sleeping bags, helmets, bikes and more are available through our rentals page and can be delivered to your first night."
      },
      {
        "question": "Do you provide group equipment?",
        "answer": "Tents, stoves, ropes and safety gear are provided where the itinerary needs them. Personal clothing and footwear are up to you."
      },
      {
        "question": "Can I leave extra luggage somewhere?",
        "answer": "Most trips have a secure storage option at the start and end point. Your guide will explain where on the pre-trip call."
      }
    ]
  },
  {
    "title": "Travel & Logistics",
    "icon": "✈️",
    "order": 5,
    "faqs": [
      {
        "question": "Do I need a visa?",
        "answer": "Visa rules depend on your passport and the destination. Each trip page lists the country, and we send entry guidance with your confirmation."
      },
      {
        "question": "Are flights included?",
        "answer": "International flights are not included. Where a trip includes a domestic or charter flight, it is listed under inclusions."
      },
      {
        "question": "How do I get to the start point?",
        "answer": "Meeting points and arrival times are in your trip documents. We can arrange airport transfers for most destinations."
      },
      {
        "question": "Will I have phone signal or wifi?",
        "answer": "Expect patchy coverage on remote days. Guides carry a satellite or radio device for emergencies, and most lodges in towns have wifi."
      },
      {
        "question": "What currency should I bring?",
        "answer": "Bring a card plus a small amount of local cash for snacks and tips. Your trip notes list typical costs on the ground."
      }
    ]
  }
];
