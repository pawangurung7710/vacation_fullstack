/**
 * Catalog used by the bulk seeder: category tree, geography and text banks.
 * `tags` link activities to destinations (a sub-category only runs where the
 * destination has at least one matching tag) and to image pools.
 */

export const CATEGORIES = [
  {
    slug: 'treks-hikes',
    label: 'Treks & Hikes',
    tagline: 'On foot, from one day to one month',
    subs: [
      { slug: 'alpine-treks', label: 'Alpine Treks', tagline: 'High passes and glacier views', tags: ['mountain'], img: ['mountain'], days: [5, 7, 8, 10, 12, 14], perDay: 210, patterns: ['{R} High Route', 'Tour of {R}', '{R} Alpine Circuit', '{R} Peaks Traverse', 'Classic {R} Trek'] },
      { slug: 'hut-to-hut', label: 'Hut to Hut', tagline: 'Sleep in mountain refuges', tags: ['mountain'], img: ['mountain'], days: [4, 5, 6, 7, 9], perDay: 190, patterns: ['{R} Hut to Hut', '{R} Refuge Trail', 'Hut Hopping in {R}', '{R} Ridge Walk'] },
      { slug: 'volcano-hikes', label: 'Volcano Hikes', tagline: 'Craters, lava fields and sunrise summits', tags: ['mountain', 'forest'], img: ['mountain', 'forest'], days: [1, 2, 3, 4, 6], perDay: 170, patterns: ['{R} Volcano Ascent', 'Crater Trek in {R}', '{R} Summit Sunrise', 'Fire Mountains of {R}'] },
      { slug: 'coastal-walks', label: 'Coastal Walks', tagline: 'Cliff paths and quiet beaches', tags: ['coast'], img: ['coast'], days: [3, 4, 5, 6, 7, 8], perDay: 160, patterns: ['{R} Coast Path', '{R} Cliff Walk', 'Shoreline of {R}', '{R} Sea to Summit'] },
      { slug: 'desert-treks', label: 'Desert Treks', tagline: 'Dunes, canyons and big skies', tags: ['desert'], img: ['desert'], days: [3, 4, 5, 7, 9], perDay: 195, patterns: ['{R} Desert Crossing', 'Dunes of {R}', '{R} Canyon Trek', 'Sand & Stars in {R}'] },
      { slug: 'jungle-treks', label: 'Jungle Treks', tagline: 'Rainforest trails and river crossings', tags: ['forest'], img: ['forest'], days: [3, 4, 5, 6, 8], perDay: 180, patterns: ['{R} Rainforest Trek', 'Jungle Trails of {R}', '{R} Canopy Route', 'Into the Green: {R}'] },
      { slug: 'glacier-walks', label: 'Glacier Walks', tagline: 'Crampons, ice caves and blue light', tags: ['snow'], img: ['snow'], days: [1, 2, 3, 4, 5], perDay: 230, patterns: ['{R} Glacier Walk', 'Ice Cave Day in {R}', '{R} Glacier Traverse', 'Blue Ice of {R}'] },
      { slug: 'day-hikes', label: 'Day Hikes', tagline: 'Big views, back for dinner', tags: ['mountain', 'forest', 'coast'], img: ['mountain', 'forest', 'coast'], days: [1], perDay: 120, patterns: ['{R} Day Hike', '{R} Viewpoint Loop', 'Waterfall Walk in {R}', '{R} Summit Day'] },
    ],
  },
  {
    slug: 'expeditions',
    label: 'Expeditions',
    tagline: 'Serious objectives with expert leaders',
    subs: [
      { slug: 'peak-climbing', label: 'Peak Climbing', tagline: 'Your first 5,000 and 6,000 metre peaks', tags: ['mountain'], img: ['mountain', 'snow'], days: [8, 10, 12, 14, 16, 21], perDay: 290, patterns: ['{R} Peak Ascent', 'Summit {R}', '{R} First Big Peak', '{R} Peak Push'] },
      { slug: 'mountaineering', label: 'Mountaineering', tagline: 'Technical routes and glaciated terrain', tags: ['mountain', 'snow'], img: ['snow', 'mountain'], days: [10, 12, 14, 18, 21, 28], perDay: 340, patterns: ['{R} Expedition', '{R} North Face', '{R} Alpine Skills Climb', 'Technical {R}'] },
      { slug: 'ski-touring', label: 'Ski Touring', tagline: 'Skins up, powder down', tags: ['snow'], img: ['snow'], days: [4, 5, 6, 7], perDay: 330, patterns: ['{R} Ski Traverse', '{R} Backcountry Ski Week', 'Powder Tour: {R}', '{R} High Route on Skis'] },
      { slug: 'polar-voyages', label: 'Polar Voyages', tagline: 'Expedition ships and icebound coasts', tags: ['snow'], img: ['snow', 'coast'], days: [8, 10, 12, 14, 18], perDay: 520, patterns: ['{R} Polar Voyage', 'Ice Edge: {R}', '{R} Expedition Cruise', 'Wild Coast of {R}'] },
      { slug: 'canyoneering', label: 'Canyoneering', tagline: 'Abseil, swim and scramble', tags: ['desert', 'water'], img: ['desert', 'water'], days: [1, 2, 3, 4], perDay: 210, patterns: ['{R} Canyon Descent', 'Slots & Falls of {R}', '{R} Rope & River Day', 'Hidden Canyons of {R}'] },
      { slug: 'via-ferrata', label: 'Via Ferrata', tagline: 'Iron paths on vertical rock', tags: ['mountain'], img: ['mountain'], days: [1, 2, 3, 4], perDay: 200, patterns: ['{R} Via Ferrata', 'Iron Ways of {R}', '{R} Cable Route Weekend', 'Vertical {R}'] },
      { slug: 'ice-climbing', label: 'Ice Climbing', tagline: 'Frozen waterfalls and alpine ice', tags: ['snow'], img: ['snow'], days: [2, 3, 4, 5], perDay: 270, patterns: ['{R} Ice Climbing Week', 'Frozen Falls of {R}', '{R} Ice Skills Course', 'Winter Climbing in {R}'] },
      { slug: 'backcountry-camping', label: 'Backcountry Camping', tagline: 'Carry it in, leave no trace', tags: ['forest', 'mountain'], img: ['camping'], days: [2, 3, 4, 5, 7], perDay: 150, patterns: ['{R} Wild Camp', 'Backcountry {R}', '{R} Lakes Circuit', 'Off-grid in {R}'] },
    ],
  },
  {
    slug: 'cycling-rides',
    label: 'Cycling & Rides',
    tagline: 'Two wheels, four hooves, one engine',
    subs: [
      { slug: 'gravel-tours', label: 'Gravel Tours', tagline: 'Quiet tracks and big days', tags: ['mountain', 'culture', 'coast'], img: ['cycling'], days: [4, 5, 6, 7, 8], perDay: 215, patterns: ['{R} Gravel Tour', '{R} Gravel Grinder', 'Back Roads of {R}', '{R} Gravel Traverse'] },
      { slug: 'mountain-biking', label: 'Mountain Biking', tagline: 'Singletrack and lift-assisted descents', tags: ['mountain', 'forest'], img: ['cycling', 'forest'], days: [3, 4, 5, 6, 7], perDay: 225, patterns: ['{R} Trail Week', '{R} Enduro Camp', 'Singletrack of {R}', '{R} Bike Park & Backcountry'] },
      { slug: 'road-cycling', label: 'Road Cycling', tagline: 'Classic climbs and coastal roads', tags: ['coast', 'mountain'], img: ['cycling', 'coast'], days: [4, 5, 6, 7, 9], perDay: 205, patterns: ['{R} Road Classic', '{R} Climbs Tour', 'Grand Loop of {R}', '{R} Coast to Col'] },
      { slug: 'e-bike-tours', label: 'E-Bike Tours', tagline: 'Hills made easy, views made big', tags: ['culture', 'coast'], img: ['cycling', 'culture'], days: [2, 3, 4, 5, 6], perDay: 190, patterns: ['{R} E-Bike Escape', 'Easy Rider: {R}', '{R} Villages by E-Bike', '{R} Wine & Wheels'] },
      { slug: 'motorbike-overland', label: 'Motorbike Overland', tagline: 'Adventure bikes on epic roads', tags: ['desert', 'mountain'], img: ['desert', 'mountain'], days: [6, 8, 10, 12, 14], perDay: 295, patterns: ['{R} Overland Ride', 'High Passes of {R} by Motorbike', '{R} Adventure Loop', 'Dust & Altitude: {R}'] },
      { slug: 'horseback-trails', label: 'Horseback Trails', tagline: 'Ride through open country', tags: ['mountain', 'desert'], img: ['mountain', 'desert'], days: [3, 4, 5, 7, 9], perDay: 240, patterns: ['{R} Trail Ride', 'Horse Trek in {R}', '{R} Saddle Safari', '{R} High Valley Ride'] },
      { slug: 'camel-treks', label: 'Camel Treks', tagline: 'Slow travel across the sands', tags: ['desert'], img: ['desert'], days: [2, 3, 4, 5, 6], perDay: 185, patterns: ['{R} Camel Trek', 'Caravan of {R}', '{R} Desert Camp by Camel', 'Dune Sea of {R}'] },
      { slug: 'self-drive-safaris', label: 'Self-Drive Safaris', tagline: 'Your own 4x4, our route book', tags: ['wildlife'], img: ['wildlife'], days: [6, 8, 10, 12, 14], perDay: 255, patterns: ['{R} Self-Drive Safari', '{R} 4x4 Adventure', 'Wild Roads of {R}', '{R} Park-to-Park Drive'] },
    ],
  },
  {
    slug: 'water-snow',
    label: 'Water & Snow',
    tagline: 'Rivers, reefs, powder and ice',
    subs: [
      { slug: 'whitewater-rafting', label: 'Whitewater Rafting', tagline: 'Grade III to V rivers', tags: ['water', 'mountain'], img: ['water'], days: [1, 2, 3, 4, 5, 7], perDay: 195, patterns: ['{R} River Run', '{R} Rapids Expedition', 'Wild Water of {R}', '{R} Gorge Rafting'] },
      { slug: 'kayak-expeditions', label: 'Kayak Expeditions', tagline: 'Paddle to wild campsites', tags: ['water', 'coast'], img: ['water', 'coast'], days: [3, 4, 5, 6, 8], perDay: 200, patterns: ['{R} Sea Kayak Trip', 'Paddle {R}', '{R} Island Hopping by Kayak', '{R} Fjord Paddle'] },
      { slug: 'sailing', label: 'Sailing', tagline: 'Skippered yachts and small flotillas', tags: ['coast'], img: ['coast', 'water'], days: [5, 7, 8, 10, 14], perDay: 255, patterns: ['{R} Sailing Week', '{R} Island Sail', 'Blue Water {R}', '{R} Coastal Flotilla'] },
      { slug: 'scuba-snorkel', label: 'Scuba & Snorkel', tagline: 'Reefs, wrecks and warm seas', tags: ['coast'], img: ['water', 'coast'], days: [4, 5, 6, 7, 10], perDay: 235, patterns: ['{R} Dive Week', '{R} Reef Explorer', 'Under the Surface: {R}', '{R} Liveaboard'] },
      { slug: 'surf-camps', label: 'Surf Camps', tagline: 'Coaching, boards and good waves', tags: ['coast'], img: ['water', 'coast'], days: [5, 7, 10, 14], perDay: 165, patterns: ['{R} Surf Camp', 'Ride the Swell: {R}', '{R} Beginner Surf Week', '{R} Surf & Stay'] },
      { slug: 'heli-skiing', label: 'Heli-Skiing', tagline: 'Untracked lines by helicopter', tags: ['snow'], img: ['snow'], days: [3, 4, 5, 6, 7], perDay: 640, patterns: ['{R} Heli-Ski Week', 'First Tracks in {R}', '{R} Powder Pursuit', 'Heli Lines of {R}'] },
      { slug: 'snowshoe-trails', label: 'Snowshoe Trails', tagline: 'Quiet winter forests and lakes', tags: ['snow', 'forest'], img: ['snow', 'forest'], days: [1, 2, 3, 4, 5], perDay: 150, patterns: ['{R} Snowshoe Weekend', 'Winter Woods of {R}', '{R} Snowshoe Traverse', 'Frozen Lakes of {R}'] },
      { slug: 'husky-sledding', label: 'Husky Sledding', tagline: 'Drive your own dog team', tags: ['snow'], img: ['snow'], days: [3, 4, 5, 6, 7], perDay: 330, patterns: ['{R} Husky Safari', 'Dog Sledding in {R}', '{R} Arctic Mushing', 'Sled Dogs of {R}'] },
    ],
  },
  {
    slug: 'culture-wildlife',
    label: 'Culture & Wildlife',
    tagline: 'People, food and the animals we share the planet with',
    subs: [
      { slug: 'wildlife-safari', label: 'Wildlife Safari', tagline: 'Big five and beyond', tags: ['wildlife'], img: ['wildlife'], days: [4, 5, 6, 8, 10, 12], perDay: 330, patterns: ['{R} Wildlife Safari', 'Wild {R}', '{R} Game Drive Week', 'Tracking in {R}'] },
      { slug: 'birdwatching', label: 'Birdwatching', tagline: 'Expert-led lists and early mornings', tags: ['wildlife', 'forest'], img: ['wildlife', 'forest'], days: [3, 4, 5, 7, 9], perDay: 215, patterns: ['{R} Birding Trip', 'Wings over {R}', '{R} Birder\'s Week', 'Dawn Chorus: {R}'] },
      { slug: 'food-wine', label: 'Food & Wine', tagline: 'Markets, kitchens and long tables', tags: ['culture'], img: ['culture'], days: [3, 4, 5, 6, 7], perDay: 245, patterns: ['{R} Food Trail', 'Tastes of {R}', '{R} Cooking & Wine Week', '{R} Market to Table'] },
      { slug: 'village-homestays', label: 'Village Homestays', tagline: 'Stay with local families', tags: ['culture'], img: ['culture'], days: [2, 3, 4, 5, 7], perDay: 130, patterns: ['{R} Homestay Journey', 'Village Life in {R}', '{R} Family Stay', 'Slow Days in {R}'] },
      { slug: 'pilgrimage-routes', label: 'Pilgrimage Routes', tagline: 'Ancient paths, modern walkers', tags: ['culture', 'mountain'], img: ['culture', 'mountain'], days: [5, 7, 9, 12, 15], perDay: 155, patterns: ['{R} Pilgrim Way', 'Sacred Route of {R}', '{R} Camino Stage Walk', 'Footsteps of {R}'] },
      { slug: 'photography-tours', label: 'Photography Tours', tagline: 'Golden hours with a pro', tags: ['mountain', 'coast', 'culture', 'wildlife'], img: ['mountain', 'coast', 'culture', 'wildlife'], days: [4, 5, 6, 8, 10], perDay: 265, patterns: ['{R} Photo Tour', 'Light of {R}', '{R} Landscape Photography Week', 'Frame {R}'] },
      { slug: 'heritage-walks', label: 'Heritage Walks', tagline: 'Old towns, castles and ruins', tags: ['culture'], img: ['culture'], days: [1, 2, 3, 4, 5], perDay: 140, patterns: ['{R} Heritage Walk', 'Old Town of {R}', '{R} History on Foot', 'Stones & Stories: {R}'] },
      { slug: 'northern-lights', label: 'Northern Lights', tagline: 'Chase the aurora in small groups', tags: ['snow'], img: ['snow'], days: [3, 4, 5, 6], perDay: 285, patterns: ['{R} Aurora Trip', 'Northern Lights in {R}', '{R} Winter Sky Week', 'Under the Green Sky: {R}'] },
    ],
  },
  {
    slug: 'retreats-training',
    label: 'Retreats & Training',
    tagline: 'Slow down, get fitter, learn new skills',
    subs: [
      { slug: 'yoga-retreats', label: 'Yoga Retreats', tagline: 'Practice with a view', tags: ['forest', 'coast', 'mountain'], img: ['yoga'], days: [5, 6, 7, 10, 14], perDay: 175, patterns: ['{R} Yoga Retreat', 'Breathe in {R}', '{R} Yoga & Hiking Week', '{R} Sunrise Practice'] },
      { slug: 'wellness-escapes', label: 'Wellness Escapes', tagline: 'Spa, sauna and quiet walks', tags: ['coast', 'forest'], img: ['yoga', 'coast'], days: [3, 4, 5, 7], perDay: 235, patterns: ['{R} Wellness Escape', 'Restore in {R}', '{R} Sauna & Trails', '{R} Reset Weekend'] },
      { slug: 'fitness-bootcamps', label: 'Fitness Bootcamps', tagline: 'Train hard in beautiful places', tags: ['mountain', 'coast'], img: ['mountain', 'coast'], days: [4, 5, 6, 7], perDay: 185, patterns: ['{R} Outdoor Bootcamp', 'Train in {R}', '{R} Fit Week', '{R} Strength & Trails'] },
      { slug: 'altitude-training', label: 'Altitude Training', tagline: 'Coach-led camps above 2,000 m', tags: ['mountain'], img: ['mountain'], days: [7, 10, 14, 21], perDay: 205, patterns: ['{R} Altitude Camp', 'High Performance {R}', '{R} Endurance Block', '{R} Altitude Prep'] },
      { slug: 'navigation-skills', label: 'Navigation Skills', tagline: 'Map, compass and confidence', tags: ['mountain', 'forest'], img: ['mountain', 'forest'], days: [1, 2, 3, 4], perDay: 130, patterns: ['{R} Navigation Course', 'Find Your Way in {R}', '{R} Map & Compass Weekend', 'Lost & Found: {R}'] },
      { slug: 'survival-courses', label: 'Survival Courses', tagline: 'Shelter, fire, water, first aid', tags: ['forest', 'desert'], img: ['camping', 'forest'], days: [2, 3, 4, 5, 7], perDay: 170, patterns: ['{R} Survival Course', 'Bushcraft in {R}', '{R} Wilderness Skills', '{R} Field Craft Week'] },
      { slug: 'photography-workshops', label: 'Photography Workshops', tagline: 'Hands-on with working photographers', tags: ['mountain', 'coast', 'culture'], img: ['mountain', 'coast', 'culture'], days: [2, 3, 4, 5, 6], perDay: 225, patterns: ['{R} Photo Workshop', 'Learn Light in {R}', '{R} Editing & Shooting Retreat', '{R} Storytelling Workshop'] },
      { slug: 'digital-detox', label: 'Digital Detox', tagline: 'Phones off, boots on', tags: ['forest', 'mountain'], img: ['forest', 'camping'], days: [3, 4, 5, 7], perDay: 160, patterns: ['{R} Digital Detox', 'Unplug in {R}', '{R} Offline Week', '{R} Quiet Trails'] },
    ],
  },
];

/** country -> { tags, regions } */
export const GEOGRAPHY = {
  Nepal: { tags: ['mountain', 'culture', 'forest', 'wildlife'], regions: ['Everest Region', 'Annapurna', 'Langtang', 'Manaslu', 'Upper Mustang'] },
  Switzerland: { tags: ['mountain', 'snow', 'culture'], regions: ['Bernese Oberland', 'Valais', 'Graubünden', 'Ticino', 'Engadin'] },
  France: { tags: ['mountain', 'snow', 'coast', 'culture'], regions: ['Chamonix', 'Provence', 'Corsica', 'Brittany', 'French Pyrenees'] },
  Italy: { tags: ['mountain', 'coast', 'culture'], regions: ['Dolomites', 'Amalfi Coast', 'Tuscany', 'Aosta Valley', 'Sicily'] },
  Austria: { tags: ['mountain', 'snow', 'culture'], regions: ['Tyrol', 'Salzkammergut', 'Hohe Tauern', 'Vorarlberg', 'Styria'] },
  Slovenia: { tags: ['mountain', 'water', 'forest'], regions: ['Julian Alps', 'Soča Valley', 'Lake Bled', 'Triglav', 'Karst'] },
  Norway: { tags: ['mountain', 'snow', 'coast', 'water'], regions: ['Lofoten', 'Jotunheimen', 'Tromsø', 'Svalbard', 'Hardangervidda'] },
  Iceland: { tags: ['snow', 'mountain', 'coast', 'water'], regions: ['Highlands', 'Westfjords', 'Snæfellsnes', 'Landmannalaugar', 'Vatnajökull'] },
  'United Kingdom': { tags: ['mountain', 'coast', 'culture'], regions: ['Scottish Highlands', 'Isle of Skye', 'Cairngorms', 'Snowdonia', 'Lake District'] },
  Spain: { tags: ['mountain', 'coast', 'culture'], regions: ['Spanish Pyrenees', 'Picos de Europa', 'Sierra Nevada', 'Camino de Santiago', 'Mallorca'] },
  Greece: { tags: ['coast', 'culture', 'mountain'], regions: ['Crete', 'Meteora', 'Cyclades', 'Peloponnese', 'Mount Olympus'] },
  Croatia: { tags: ['coast', 'water', 'culture'], regions: ['Dalmatia', 'Istria', 'Plitvice', 'Dubrovnik Coast', 'Vis Island'] },
  Turkey: { tags: ['culture', 'coast', 'mountain'], regions: ['Cappadocia', 'Lycian Way', 'Kaçkar Mountains', 'Aegean Coast', 'Pamukkale'] },
  Georgia: { tags: ['mountain', 'culture'], regions: ['Svaneti', 'Kazbegi', 'Tusheti', 'Tbilisi Highlands', 'Kakheti'] },
  Morocco: { tags: ['desert', 'mountain', 'culture'], regions: ['High Atlas', 'Sahara Dunes', 'Fes & Middle Atlas', 'Atlantic Coast', 'Rif Mountains'] },
  Jordan: { tags: ['desert', 'culture'], regions: ['Wadi Rum', 'Petra', 'Dana Reserve', 'Dead Sea', 'Aqaba'] },
  Tanzania: { tags: ['wildlife', 'mountain', 'coast', 'culture'], regions: ['Kilimanjaro', 'Serengeti', 'Ngorongoro', 'Zanzibar', 'Usambara Mountains'] },
  Kenya: { tags: ['wildlife', 'culture', 'mountain'], regions: ['Maasai Mara', 'Mount Kenya', 'Laikipia', 'Lamu', 'Amboseli'] },
  'South Africa': { tags: ['wildlife', 'coast', 'mountain', 'culture'], regions: ['Drakensberg', 'Garden Route', 'Kruger', 'Cape Winelands', 'Cederberg'] },
  Namibia: { tags: ['desert', 'wildlife'], regions: ['Sossusvlei', 'Etosha', 'Skeleton Coast', 'Fish River Canyon', 'Damaraland'] },
  Peru: { tags: ['mountain', 'culture', 'forest'], regions: ['Sacred Valley', 'Cusco', 'Cordillera Blanca', 'Amazon Basin', 'Arequipa'] },
  Chile: { tags: ['mountain', 'desert', 'snow', 'coast'], regions: ['Torres del Paine', 'Atacama', 'Lakes District', 'Aysén', 'Chilean Patagonia'] },
  Argentina: { tags: ['mountain', 'snow', 'culture', 'water'], regions: ['Argentine Patagonia', 'Mendoza', 'El Chaltén', 'Salta', 'Ushuaia'] },
  Bolivia: { tags: ['mountain', 'desert', 'culture'], regions: ['Cordillera Real', 'Salar de Uyuni', 'Sajama', 'Yungas', 'Tarija'] },
  Ecuador: { tags: ['mountain', 'forest', 'coast', 'wildlife'], regions: ['Cotopaxi', 'Galápagos', 'Quilotoa Loop', 'Ecuadorian Amazon', 'Baños'] },
  Colombia: { tags: ['mountain', 'forest', 'coast', 'culture'], regions: ['Sierra Nevada', 'Coffee Region', 'Tayrona', 'Cocora Valley', 'Colombian Amazon'] },
  'Costa Rica': { tags: ['forest', 'coast', 'wildlife', 'water'], regions: ['Arenal', 'Osa Peninsula', 'Monteverde', 'Guanacaste', 'Corcovado'] },
  Canada: { tags: ['mountain', 'snow', 'water', 'wildlife'], regions: ['Banff & Jasper', 'Yukon', 'Whistler', 'Nova Scotia', 'Canadian Rockies'] },
  'United States': { tags: ['mountain', 'desert', 'coast', 'water', 'snow'], regions: ['Yosemite', 'Utah Canyons', 'Alaska', 'Colorado Rockies', 'Hawaii', 'Grand Canyon'] },
  Mexico: { tags: ['culture', 'coast', 'desert', 'forest'], regions: ['Oaxaca', 'Yucatán', 'Baja California', 'Copper Canyon', 'Chiapas'] },
  'New Zealand': { tags: ['mountain', 'water', 'coast', 'snow'], regions: ['Fiordland', 'Queenstown', 'Abel Tasman', 'Tongariro', 'Canterbury High Country'] },
  Australia: { tags: ['desert', 'coast', 'wildlife', 'mountain'], regions: ['Tasmania', 'Red Centre', 'Great Barrier Reef', 'Kimberley', 'Blue Mountains'] },
  Japan: { tags: ['mountain', 'culture', 'snow', 'coast'], regions: ['Japan Alps', 'Kumano Kodo', 'Hokkaido', 'Kyoto Hills', 'Nakasendo'] },
  India: { tags: ['mountain', 'culture', 'desert', 'wildlife'], regions: ['Ladakh', 'Himachal Pradesh', 'Rajasthan', 'Sikkim', 'Kerala Backwaters'] },
  Bhutan: { tags: ['mountain', 'culture', 'forest'], regions: ['Paro Valley', 'Bumthang', 'Haa Valley', 'Punakha', 'Eastern Bhutan'] },
  Pakistan: { tags: ['mountain', 'culture'], regions: ['Karakoram', 'Hunza Valley', 'Fairy Meadows', 'Skardu', 'Chitral'] },
  Indonesia: { tags: ['forest', 'coast', 'water', 'wildlife', 'mountain'], regions: ['Bali', 'Komodo', 'Java Volcanoes', 'Lombok', 'Sumatra'] },
  Vietnam: { tags: ['forest', 'culture', 'coast', 'mountain'], regions: ['Sapa', 'Ha Giang Loop', 'Phong Nha', 'Ha Long Bay', 'Da Lat'] },
  Thailand: { tags: ['coast', 'forest', 'culture', 'water'], regions: ['Chiang Mai', 'Krabi', 'Khao Sok', 'Pai', 'Koh Samui'] },
  Antarctica: { tags: ['snow', 'coast', 'wildlife'], regions: ['Antarctic Peninsula', 'South Shetlands', 'Ross Sea'] },
  Greenland: { tags: ['snow', 'coast', 'water'], regions: ['Disko Bay', 'Kulusuk', 'Ilulissat Fjord'] },
};

export const DIFFICULTIES = ['easy', 'moderate', 'challenging', 'expert'];
export const DIFFICULTY_PRICE = { easy: 0.9, moderate: 1, challenging: 1.15, expert: 1.35 };

export const TRIP_TAGS = [
  'Small group',
  'Guide led',
  'Gear included',
  'Best seller',
  'Family friendly',
  'Photography',
  'Beginner friendly',
  'New for this year',
  'Flexible dates',
  'Free cancellation',
];

export const SEASONS = [
  'March – May',
  'June – September',
  'September – November',
  'December – February',
  'Year-round',
  'May – October',
  'April – June, September – October',
  'November – March',
];

export const HIGHLIGHT_TEMPLATES = [
  'Sunrise views over {R}',
  'Expert local guide throughout',
  'Small groups of {N} people at most',
  'Hand-picked stays in and around {R}',
  'A rest day to explore at your own pace',
  'Farewell dinner with the whole squad',
  'Quiet routes away from the busiest viewpoints',
  'Photo stops chosen for the best light',
  'Local snacks and lunches on the trail',
  'Gear check and briefing before day one',
  'Transfers included from {C} arrival point',
  'Flexible option for a shorter day on the hardest stage',
];

export const INCLUSIONS = [
  'Experienced, certified guide',
  'Accommodation as described in the itinerary',
  'Meals listed in the day-by-day plan',
  'Ground transport during the trip',
  'Permits and entrance fees',
  'Safety kit and first aid',
  'Group equipment (tents, ropes, stoves)',
  'Pre-trip briefing and packing list',
];

export const EXCLUSIONS = [
  'International flights',
  'Travel insurance (required)',
  'Visa fees where applicable',
  'Personal gear and clothing',
  'Drinks and snacks beyond those listed',
  'Tips for guides and drivers',
];

export const DAY_TITLES = [
  'Arrival and welcome briefing',
  'Easy warm-up walk',
  'Into the heart of {R}',
  'The big day',
  'Rest, laundry and local life',
  'High viewpoint morning',
  'Scenic transfer and a long lunch',
  'Quiet trails and hidden corners',
  'Final push',
  'Celebration dinner',
];

export const DAY_DESCRIPTIONS = [
  'A relaxed start with plenty of time for photos, snacks and conversation. Your guide sets the pace and adjusts the day to the group.',
  'A longer day with a steady climb rewarded by wide views. Lunch is on the trail and we are back at camp or the lodge by late afternoon.',
  'A mix of walking and local stops. We meet the people who run the places we stay and eat, then settle in for a good dinner.',
  'Today is the highlight of the trip. We start early, take plenty of breaks, and finish with a hot meal and an early night.',
  'A lighter day for recovery. Optional short outings are available, or stay put and enjoy the setting.',
];

export const BLOG_CATEGORIES = [
  { key: 'destinations', label: 'Destinations' },
  { key: 'gear', label: 'Gear & Kit' },
  { key: 'training', label: 'Training' },
  { key: 'stories', label: 'Trail Stories' },
  { key: 'safety', label: 'Safety' },
  { key: 'guides', label: 'Guide Notes' },
];

export const BLOG_TITLES = {
  destinations: [
    'The best time to visit {R}',
    'Three days in {R}: what to see and skip',
    'Why {R} should be on your list this year',
    'First time in {C}? Start here',
    'Eating well on the trail in {R}',
  ],
  gear: [
    'How to pack for a week in {R}',
    'Boots, shoes or sandals? A guide to footwear',
    'The layering system explained',
    'Our favourite ultralight kit under 8 kg',
    'Rent or buy: smart choices for first-timers',
  ],
  training: [
    'Get trail-fit in eight weeks',
    'Stair workouts that actually help your hiking',
    'Training for altitude when you live at sea level',
    'Simple mobility routine for tired legs',
    'How to recover between big days',
  ],
  stories: [
    'A week of storms in {R}',
    'The day our group changed the route',
    'What a first summit feels like',
    'Notes from the back of the group',
    'The campfire that never quite lit',
  ],
  safety: [
    'Reading the weather before you set off',
    'First aid basics for the trail',
    'How guides make go and no-go calls',
    'Understanding altitude sickness',
    'What to do if you get lost',
  ],
  guides: [
    'A day in the life of a mountain guide',
    'How we plan a new route',
    'Questions guides hear every week',
    'Why we keep groups small',
    'What makes a great trail cook',
  ],
};

export const BLOG_PARAGRAPHS = [
  'Good trips start long before the trailhead. We spend weeks checking routes, talking to local hosts and testing the logistics, so that on the day everything feels easy.',
  'The best advice we can give is to start slowly. Most people go out too fast on day one, then pay for it on day three. A steady pace keeps the whole group happy.',
  'Weather changes quickly in the mountains and on the coast. We carry a buffer day on many itineraries, and we are not shy about changing plans when the forecast turns.',
  'Pack less than you think you need. Layers, a good waterproof and well-worn footwear matter far more than any gadget. Your guide will help you check your bag before you leave.',
  'Travelling in small groups changes the experience. You get time with your guide, the pace is flexible, and you are welcome in places that do not suit big coaches.',
  'Eat what the locals eat. Trail food is simple, hot and filling, and a shared meal at the end of the day is often the best part of the trip.',
];

export const REVIEW_SNIPPETS = [
  'Brilliant trip from start to finish. Our guide knew the route inside out and the group size made it feel personal.',
  'Well organised without feeling over-planned. Great food, comfortable stays and just the right amount of challenge.',
  'I was nervous as a first-timer but the team made it easy. The pace was steady and everyone looked out for each other.',
  'The views were unreal and the itinerary had plenty of time to enjoy them. Would book again in a heartbeat.',
  'Clear communication before the trip and excellent support on the ground. Gear list was spot on.',
  'Perfect mix of hard days and rest. Our guide shared so much local knowledge that I learned as much as I walked.',
  'Small group, great people, fantastic scenery. The best week I have had in years.',
  'Everything ran smoothly even when the weather turned. That tells you a lot about the crew.',
  'Fair price for what you get. Accommodation was simple but spotless and the meals were generous.',
  'We did this as a family and the guides were wonderful with the kids. Highly recommended.',
];

export const FIRST_NAMES = ['Ava', 'Liam', 'Noah', 'Mia', 'Ethan', 'Zoe', 'Lucas', 'Isla', 'Oliver', 'Maya', 'Leo', 'Nora', 'Arjun', 'Sofia', 'Kai', 'Elena', 'Omar', 'Hana', 'Mateo', 'Freya', 'Ravi', 'Chloe', 'Tomas', 'Yuki', 'Amara', 'Jonas', 'Layla', 'Felix', 'Ines', 'Dev'];
export const LAST_NAMES = ['Walker', 'Nguyen', 'Silva', 'Kowalski', 'Haddad', 'Moreau', 'Ito', 'Larsen', 'Okafor', 'Patel', 'Rossi', 'Fischer', 'Alvarez', 'Berg', 'Khan', 'Murphy', 'Costa', 'Lindqvist', 'Tanaka', 'Novak', 'Reyes', 'Adeyemi', 'Hughes', 'Dubois', 'Park'];
export const HOME_CITIES = ['London, UK', 'Toronto, Canada', 'Sydney, Australia', 'Berlin, Germany', 'Austin, USA', 'Amsterdam, Netherlands', 'Singapore', 'Dublin, Ireland', 'Cape Town, South Africa', 'Wellington, New Zealand', 'Stockholm, Sweden', 'Denver, USA', 'Vancouver, Canada', 'Madrid, Spain', 'Mumbai, India', 'Tokyo, Japan'];
