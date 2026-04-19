/** Demo listings keyed by HomeScreen category `id` */

const POSTED_DATE_ROLL = [
  '28 Mar 2026',
  '30 Mar 2026',
  '1 Apr 2026',
  '3 Apr 2026',
  '5 Apr 2026',
  '7 Apr 2026',
  '8 Apr 2026',
  '10 Apr 2026',
  '12 Apr 2026',
];

let _postedDateSeq = 0;

const IMG = {
  a: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
  b: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
  c: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80',
  d: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80',
  e: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80',
  f: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
  g: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80',
  h: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
};

function listing(partial) {
  const postedDate = partial.postedDate ?? POSTED_DATE_ROLL[_postedDateSeq++ % POSTED_DATE_ROLL.length];
  return {
    id: partial.id,
    title: partial.title,
    image: partial.image,
    carpetArea: partial.carpetArea,
    bhk: partial.bhk,
    bathrooms: partial.bathrooms,
    area: partial.area,
    price: partial.price,
    period: '/mo',
    postedDate,
  };
}

export const MOCK_PROPERTIES_BY_CATEGORY = {
  flat: [
    listing({
      id: 'f1',
      title: 'Sunlit 3BHK with city skyline views',
      image: IMG.a,
      carpetArea: '350 gaz carpet area',
      bhk: '3',
      bathrooms: '2',
      area: 'Al Olaya, Riyadh',
      price: '4,200',
    }),
    listing({
      id: 'f2',
      title: 'Modern flat near metro and parks',
      image: IMG.b,
      carpetArea: '280 gaz carpet area',
      bhk: '2',
      bathrooms: '2',
      area: 'Al Malaz, Riyadh',
      price: '3,100',
    }),
    listing({
      id: 'f3',
      title: 'Family apartment with maid room',
      image: IMG.c,
      carpetArea: '410 gaz carpet area',
      bhk: '4',
      bathrooms: '3',
      area: 'King Fahd District',
      price: '5,800',
    }),
    listing({
      id: 'f4',
      title: 'Cozy 1BR starter home',
      image: IMG.d,
      carpetArea: '120 gaz carpet area',
      bhk: '1',
      bathrooms: '1',
      area: 'Al Muruj',
      price: '1,950',
    }),
  ],
  shop: [
    listing({
      id: 's1',
      title: 'Corner retail with frontage',
      image: IMG.e,
      carpetArea: '180 gaz carpet area',
      bhk: '0',
      bathrooms: '1',
      area: 'Tahlia Street',
      price: '12,000',
    }),
    listing({
      id: 's2',
      title: 'High-footfall boutique space',
      image: IMG.f,
      carpetArea: '95 gaz carpet area',
      bhk: '0',
      bathrooms: '1',
      area: 'Al Urubah',
      price: '8,500',
    }),
  ],
  office: [
    listing({
      id: 'o1',
      title: 'Grade-A office suite',
      image: IMG.g,
      carpetArea: '320 gaz carpet area',
      bhk: '0',
      bathrooms: '2',
      area: 'King Abdullah Financial District',
      price: '18,000',
    }),
    listing({
      id: 'o2',
      title: 'Creative studio with breakout zones',
      image: IMG.h,
      carpetArea: '210 gaz carpet area',
      bhk: '0',
      bathrooms: '1',
      area: 'Digital City',
      price: '9,900',
    }),
  ],
  pg: [
    listing({
      id: 'p1',
      title: 'Premium PG — meals and Wi-Fi',
      image: IMG.c,
      carpetArea: '140 gaz carpet area',
      bhk: '1',
      bathrooms: '1',
      area: 'Near university gate',
      price: '850',
    }),
    listing({
      id: 'p2',
      title: 'Shared hostel bunk wing',
      image: IMG.a,
      carpetArea: '90 gaz carpet area',
      bhk: '1',
      bathrooms: '2',
      area: 'Student district',
      price: '520',
    }),
  ],
  parking: [
    listing({
      id: 'pk1',
      title: 'Covered parking bay — 24/7',
      image: IMG.f,
      carpetArea: '45 gaz carpet area',
      bhk: '0',
      bathrooms: '0',
      area: 'Tower basement B2',
      price: '400',
    }),
  ],
  warehouse: [
    listing({
      id: 'w1',
      title: 'Logistics warehouse with ramp',
      image: IMG.h,
      carpetArea: '1,200 gaz carpet area',
      bhk: '0',
      bathrooms: '2',
      area: 'Industrial strip south',
      price: '22,000',
    }),
  ],
  sharing: [
    listing({
      id: 'sh1',
      title: 'Room share — utilities included',
      image: IMG.d,
      carpetArea: '110 gaz carpet area',
      bhk: '1',
      bathrooms: '1',
      area: 'Al Naseem',
      price: '680',
    }),
    listing({
      id: 'sh2',
      title: 'Twin sharing near corniche',
      image: IMG.b,
      carpetArea: '85 gaz carpet area',
      bhk: '1',
      bathrooms: '1',
      area: 'Al Shati',
      price: '750',
    }),
  ],
  more: [
    listing({
      id: 'm1',
      title: 'Mixed-use podium unit',
      image: IMG.g,
      carpetArea: '260 gaz carpet area',
      bhk: '2',
      bathrooms: '2',
      area: 'Boulevard district',
      price: '6,200',
    }),
  ],
};

export function getPropertiesForCategory(categoryId) {
  return MOCK_PROPERTIES_BY_CATEGORY[categoryId] ?? MOCK_PROPERTIES_BY_CATEGORY.more;
}

/** Extra fields merged in property detail screen (overrides per id optional) */
const PROPERTY_DETAIL_OVERRIDES = {
  f1: {
    rating: '4.8',
    reviewsCount: '1,275',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    ownerName: 'Khalid Al-Mutairi',
    ownerPhone: '+966 55 102 0304',
    addressLine: 'Skyline Residences, Tower B',
    fullAddress: 'King Fahd Road, Al Olaya, Riyadh 12213',
    facing: 'Front face',
    floorDetails: '18th floor',
    furnishing: 'Fully furn.',
    balconies: '2 balcony',
    salePrice: '18,500,000',
    saleNegotiable: 'Yes',
    monthlyMaintenance: '₹ 580 / month',
    buildingAge: '4 year',
    bathBalconyLine: '3 bathrooms · 2 balconies',
    bathroomsDisplay: '3 bathroom',
    liftDetails: 'Lift',
    description:
      'Corner 3BHK with floor-to-ceiling glazing, separate maid room, and two parking slots. Community pool, gym, and 24×7 concierge. Ideal for executives; metro 6 minutes walk.',
    amenities: [
      'Car parking',
      'Bike parking',
      'Power backup',
      'CCTV',
      'Guard',
      'Fire safety',
      'Maintenance ₹580/mo',
      'Deposit ₹85,000',
    ],
  },
  f2: {
    ownerName: 'Sarah Al-Harbi',
    ownerPhone: '+966 55 998 8776',
    addressLine: 'Green Park Apartments, Block 2',
    fullAddress: 'Al Malaz, Riyadh 12629',
    facing: 'North-East face',
    floorDetails: '5th floor',
    furnishing: 'Semi-furn.',
    balconies: '1 balcony',
    bathBalconyLine: '2 bathrooms · 1 balcony + utility ledge',
    bathroomsDisplay: '2 bathroom',
    liftDetails: 'Lift',
    salePrice: 'On request',
    saleNegotiable: 'No',
    monthlyMaintenance: '₹ 310 / month',
    buildingAge: '11 year',
    description:
      'Quiet 2BHK facing the park, recently painted, new fittings in bathrooms. Walking distance to metro and schools.',
    amenities: [
      'Lift',
      'Car parking',
      'Bike parking',
      'Power backup',
      'CCTV',
      'Guard',
      'Fire safety',
      'Water storage',
      'Intercom',
      'Maintenance ₹310/mo',
      'Deposit ₹40,000',
    ],
  },
  f4: {
    floorDetails: 'Duplex 1–2',
    bathroomsDisplay: '1 bathroom',
    balconies: '1 balcony',
    liftDetails: 'Lift',
  },
};

const GALLERY_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&q=80',
];

const OWNER_AVATAR_DEFAULT =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80';

/** @param {object} d @param {object} p */
function enrichDetailMedia(d, p) {
  const gallery = [p.image, ...GALLERY_FALLBACK_IMAGES.filter((u) => u !== p.image)].slice(0, 4);
  const seed = (p.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const ratingNum = 4.5 + (seed % 45) / 100;
  const reviews = 600 + (seed % 1900);
  return {
    ...d,
    galleryImages: d.galleryImages ?? gallery,
    rating: d.rating ?? ratingNum.toFixed(1),
    reviewsCount: d.reviewsCount ?? reviews.toLocaleString('en-US'),
    ownerAvatar: d.ownerAvatar ?? OWNER_AVATAR_DEFAULT,
  };
}

const OFFICE_DETAIL_OVERRIDES = {
  o1: {
    ownerName: 'Riyadh Commercial Holdings LLC',
    ownerPhone: '+966 11 234 5678',
    addressLine: 'Icon Tower, Unit 1204–1206',
    fullAddress: 'KAFD, Riyadh 11564 · Gate B, Podium parking',
    pantryToilet: 'Executive pantry with servery · 3 WC (2 common + 1 accessible)',
    cabinsSeats: '14 glass cabins · 6 director rooms · 72 open-plan seats',
    salePrice: '42,000,000',
    saleNegotiable: 'Yes',
    monthlyMaintenance: '₹ 8,500 / month (CAM est.)',
    buildingAge: '3 years (2023 completion)',
    description:
      'Grade-A fitted office with raised floor, BMS, and dedicated IT room. KAFD views, tenant-controlled VRF, and reserved parking ratio 1:400 sq m. Ideal for fintech / regional HQ.',
    amenities: [
      'Lift',
      'Car parking',
      'Bike parking',
      'Power backup',
      'CCTV',
      'Guard',
      'Fire safety',
      'Maintenance (CAM est.)',
      'Deposit on request',
      'Raised access floor',
      'VRF climate zones',
      'BMS & access control',
      'Fiber backbone',
      'Meeting suites',
    ],
  },
  o2: {
    ownerName: 'Creative District REIT',
    ownerPhone: '+966 11 445 9900',
    addressLine: 'Studio Hub, Floor 3, East wing',
    fullAddress: 'Digital City, Riyadh 13316',
    pantryToilet: 'Open pantry (sink + fridge) · 2 toilets',
    cabinsSeats: '4 focus cabins · 28 hot desks · 2 meeting pods',
    salePrice: 'On request',
    saleNegotiable: 'No',
    monthlyMaintenance: '₹ 4,200 / month (CAM est.)',
    buildingAge: '7 years (refurbished 2025)',
    description:
      'Bright creative suite with breakout zones, writable walls, and acoustic ceiling. Short walk to food court; flexible lease for startups and agencies.',
    amenities: [
      'Lift',
      'Car parking',
      'Bike parking',
      'Power backup',
      'CCTV',
      'Guard',
      'Fire safety',
      'Maintenance (CAM est.)',
      'Deposit on request',
      'High-speed Wi‑Fi',
      'Sound-masked open area',
      'Bike storage',
      'Rooftop terrace access',
      'EV charging (shared)',
    ],
  },
};

/** @param {object} p — listing from `getPropertiesForCategory` @param {string} [categoryId] */
export function getPropertyDetail(p, categoryId = '') {
  if (categoryId === 'office') {
    const baseOffice = {
      ownerName: 'Verified commercial owner · Al-Bayt',
      ownerPhone: '+966 50 000 0000',
      addressLine: `Office suite · ${p.area}`,
      fullAddress: `${p.area}, Riyadh`,
      pantryToilet: 'Dry pantry · male/female WC as per floor core',
      cabinsSeats: 'Open layout · seat count as per fit-out handover',
      salePrice: 'On request',
      saleNegotiable: 'Yes',
      monthlyMaintenance: '₹ 500 / month (CAM est.)',
      buildingAge: '5–10 years',
      description: `${p.title}. Commercial space in ${p.area}. Request test fit, CAM schedule, and handover condition.`,
      amenities: [
        'Lift',
        'Car parking',
        'Bike parking',
        'Power backup',
        'CCTV',
        'Guard',
        'Fire safety',
        'Maintenance (CAM est.)',
        'Deposit on request',
        'HVAC business hours',
        'Building security',
      ],
    };
    return enrichDetailMedia({ ...p, ...baseOffice, ...(OFFICE_DETAIL_OVERRIDES[p.id] || {}) }, p);
  }

  const bhkN = p.bhk?.match(/\d+/)?.[0] ?? '—';
  const bathN = p.bathrooms?.match(/\d+/)?.[0] ?? '—';
  const defaults = {
    ownerName: 'Verified owner · Al-Bayt',
    ownerPhone: '+966 50 000 0000',
    addressLine: `Property near ${p.area}`,
    fullAddress: `${p.area}, Riyadh`,
    facing: 'East face',
    floorDetails: 'Mid floor',
    furnishing: p.bhk === '0' ? 'Shell' : 'Semi-furn.',
    balconies: p.bhk === '0' ? '—' : '1 balcony',
    bathroomsDisplay: bathN === '0' ? 'Shared WC' : `${bathN} bathroom`,
    liftDetails: 'Lift',
    salePrice: 'On request',
    saleNegotiable: 'Yes',
    monthlyMaintenance: '₹ 500 / month',
    buildingAge: '5 year',
    description: `${p.title}. Prime location in ${p.area}. Schedule a visit for exact unit number and documents.`,
    amenities: [
      'Lift',
      'Car parking',
      'Bike parking',
      'Power backup',
      'CCTV',
      'Guard',
      'Fire safety',
      'Maintenance ₹500/mo',
      'Deposit negotiable',
    ],
    bhkConfiguration: bhkN === '0' ? 'Studio' : `${bhkN}BHK`,
    bathBalconyLine: `${bathN} bathroom(s) · ${p.bhk === '0' ? '—' : 'Balcony as per layout'}`,
  };
  return enrichDetailMedia({ ...p, ...defaults, ...(PROPERTY_DETAIL_OVERRIDES[p.id] || {}) }, p);
}
