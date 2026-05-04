export type LineSpec = {
  motor: string;
  fuel: string;
  transmission: string;
  traction: string;
  versions?: string[];
};

export type CarCatalog = Record<string, Record<string, LineSpec>>;

export const CAR_CATALOG: CarCatalog = {
  // ── Chevrolet ──────────────────────────────────────────────────────────
  Chevrolet: {
    Spark: { motor: "1.0L", fuel: "Gasolina", transmission: "Manual", traction: "FWD", versions: ["Lite", "LS", "LT", "LTZ", "Premier"] },
    Aveo: { motor: "1.4L / 1.6L", fuel: "Gasolina", transmission: "Manual", traction: "FWD", versions: ["LS", "LT"] },
    Onix: { motor: "1.0T / 1.2L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["LS", "LT", "LTZ", "Premier", "RS"] },
    Sail: { motor: "1.4L / 1.6L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["LS", "LT", "LTZ"] },
    Cruze: { motor: "1.4T / 1.5T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["LS", "LT", "LTZ", "Premier"] },
    Tracker: { motor: "1.0T / 1.2T", fuel: "Gasolina", transmission: "Automática", traction: "FWD / AWD", versions: ["LS", "LT", "LTZ", "Premier", "Midnight"] },
    Trax: { motor: "1.4T / 1.8L", fuel: "Gasolina", transmission: "Automática", traction: "FWD / AWD", versions: ["LS", "LT", "LTZ"] },
    Equinox: { motor: "1.5T / 2.0T", fuel: "Gasolina", transmission: "Automática", traction: "FWD / AWD", versions: ["LS", "LT", "LTZ", "Premier"] },
    Captiva: { motor: "2.4L / 2.0T", fuel: "Gasolina", transmission: "Automática", traction: "FWD / AWD", versions: ["LS", "LT", "LTZ"] },
    Traverse: { motor: "3.6L V6", fuel: "Gasolina", transmission: "Automática", traction: "FWD / AWD", versions: ["LS", "LT", "LTZ", "Premier"] },
    Orlando: { motor: "1.8L / 1.4T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["LS", "LT"] },
    Montana: { motor: "1.4T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "RWD", versions: ["Work", "LS", "LT"] },
    Colorado: { motor: "2.5L / 2.8L", fuel: "Gasolina / Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["WT", "LT", "Z71"] },
    Camaro: { motor: "2.0T / 3.6L V6 / 6.2L V8", fuel: "Gasolina", transmission: "Manual / Automática", traction: "RWD", versions: ["1LS", "1LT", "2LT", "2SS", "ZL1"] },
  },

  // ── Renault ────────────────────────────────────────────────────────────
  Renault: {
    Kwid: { motor: "1.0L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Life", "Zen", "Intens", "Outsider"] },
    Sandero: { motor: "1.0L / 1.6L", fuel: "Gasolina", transmission: "Manual", traction: "FWD", versions: ["Life", "Zen", "Stepway", "Stepway Outsider"] },
    Logan: { motor: "1.6L", fuel: "Gasolina", transmission: "Manual", traction: "FWD", versions: ["Life", "Zen", "Intens"] },
    Stepway: { motor: "1.6L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["Life", "Zen", "Intens", "Outsider"] },
    Duster: { motor: "1.3T / 1.6L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD / AWD", versions: ["Life", "Zen", "Intens", "Iconic"] },
    Koleos: { motor: "2.5L", fuel: "Gasolina", transmission: "CVT", traction: "FWD / AWD", versions: ["Zen", "Intens", "Iconic"] },
    Oroch: { motor: "1.3T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD / 4WD", versions: ["Life", "Zen", "Outsider"] },
    Kardian: { motor: "1.0T", fuel: "Gasolina", transmission: "CVT", traction: "FWD", versions: ["Life", "Zen", "Intens", "Iconic"] },
    Symbol: { motor: "1.6L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Expression", "Dynamique", "Privilege"] },
    Fluence: { motor: "2.0L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Expression", "Dynamique"] },
  },

  // ── Toyota ─────────────────────────────────────────────────────────────
  Toyota: {
    Yaris: { motor: "1.3L / 1.5L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["XS", "XLS", "S", "SE", "Sport"] },
    Corolla: { motor: "1.6L / 1.8L / 2.0L", fuel: "Gasolina / Híbrido", transmission: "Manual / CVT / Automática", traction: "FWD", versions: ["LE", "XLE", "XSE", "SE", "GR Sport"] },
    Camry: { motor: "2.5L / 3.5L V6", fuel: "Gasolina / Híbrido", transmission: "Automática 8AT", traction: "FWD / AWD", versions: ["LE", "XLE", "XSE", "TRD"] },
    Hilux: { motor: "2.4L / 2.8L", fuel: "Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["DX", "SR", "SR5", "GR Sport", "GR-S"] },
    "Land Cruiser": { motor: "4.5L V8 / 3.3L V6", fuel: "Diésel / Gasolina", transmission: "Automática", traction: "4WD", versions: ["GX", "VX", "VX-Limited", "Heritage"] },
    "Land Cruiser Prado": { motor: "2.7L / 4.0L V6 / 2.8L Diésel", fuel: "Gasolina / Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["GX", "TXL", "VX", "VXL"] },
    RAV4: { motor: "2.0L / 2.5L", fuel: "Gasolina / Híbrido", transmission: "Automática CVT", traction: "FWD / AWD", versions: ["LE", "XLE", "Adventure", "TRD Off Road", "Limited"] },
    Fortuner: { motor: "2.7L / 2.8L Diésel", fuel: "Gasolina / Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["SR5", "SRX", "Legender"] },
    SW4: { motor: "2.8L Diésel / 3.5L V6", fuel: "Diésel / Gasolina", transmission: "Automática", traction: "4WD", versions: ["SR", "SRX", "Diamond"] },
    Rush: { motor: "1.5L", fuel: "Gasolina", transmission: "Automática", traction: "FWD / 4WD", versions: ["S", "SE", "G"] },
    Avanza: { motor: "1.3L / 1.5L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD / 4WD", versions: ["E", "G", "Veloz"] },
    Tacoma: { motor: "2.7L / 3.5L V6", fuel: "Gasolina", transmission: "Manual / Automática", traction: "4WD", versions: ["SR", "SR5", "TRD Sport", "TRD Off Road", "Limited"] },
  },

  // ── Kia ────────────────────────────────────────────────────────────────
  Kia: {
    Picanto: { motor: "1.0L / 1.2L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["LX", "EX", "GT Line", "X-Line"] },
    Rio: { motor: "1.4L / 1.0T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["LX", "EX", "EX Premium", "GT Line"] },
    Stonic: { motor: "1.0T / 1.4L", fuel: "Gasolina", transmission: "Manual / DCT", traction: "FWD", versions: ["LX", "EX", "EX Premium", "GT Line"] },
    Seltos: { motor: "1.4T / 2.0L", fuel: "Gasolina", transmission: "Manual / Automática / DCT", traction: "FWD / AWD", versions: ["LX", "EX", "GT Line", "SX"] },
    Sportage: { motor: "1.6T / 2.0L / 2.4L", fuel: "Gasolina / Híbrido", transmission: "Manual / Automática", traction: "FWD / AWD", versions: ["LX", "EX", "EX Premium", "GT Line", "SX"] },
    Soul: { motor: "1.6L / 2.0L / 1.0T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["LX", "EX", "EX Premium", "GT-Line"] },
    Sorento: { motor: "2.4L / 2.5T / 3.5L V6", fuel: "Gasolina / Híbrido", transmission: "Manual / Automática", traction: "FWD / AWD", versions: ["LX", "EX", "EX Premium", "SX", "SX Prestige"] },
    Carnival: { motor: "3.5L V6 / 2.2L Diésel", fuel: "Gasolina / Diésel", transmission: "Automática 8AT", traction: "FWD", versions: ["LX", "EX", "SX", "SX Prestige"] },
    Telluride: { motor: "3.8L V6", fuel: "Gasolina", transmission: "Automática 8AT", traction: "FWD / AWD", versions: ["LX", "S", "EX", "SX", "SX Prestige", "X-Line"] },
    EV6: { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática", traction: "RWD / AWD", versions: ["Light", "Standard Range", "Long Range", "GT-Line", "GT"] },
  },

  // ── Hyundai ────────────────────────────────────────────────────────────
  Hyundai: {
    "Grand i10": { motor: "1.0L / 1.2L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["GL", "GLS", "Prime"] },
    i20: { motor: "1.2L / 1.4L / 1.0T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["GL", "GLS", "N Line"] },
    Accent: { motor: "1.4L / 1.6L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["GL", "GLS", "GLS Sport"] },
    Elantra: { motor: "1.6L / 2.0L / 1.6T", fuel: "Gasolina", transmission: "Manual / Automática / DCT", traction: "FWD", versions: ["GL", "GLS", "Sport", "N Line"] },
    Venue: { motor: "1.0T / 1.6L", fuel: "Gasolina", transmission: "Manual / CVT / DCT", traction: "FWD", versions: ["Essential", "SEL", "Preferred", "Trend"] },
    Creta: { motor: "1.4T / 1.5L / 2.0L", fuel: "Gasolina", transmission: "Manual / Automática / CVT", traction: "FWD", versions: ["GL", "GLS", "GLS Premium", "Sport"] },
    Tucson: { motor: "1.6T / 2.0L / 2.4L", fuel: "Gasolina / Híbrido", transmission: "Manual / Automática", traction: "FWD / AWD", versions: ["GL", "GLS", "GLS Premium", "Sport", "N Line"] },
    "Santa Fe": { motor: "2.0T / 2.5T / 2.2L Diésel", fuel: "Gasolina / Diésel / Híbrido", transmission: "Automática", traction: "FWD / AWD", versions: ["GL", "GLS", "GLS Premium", "Sport"] },
    Ioniq5: { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática", traction: "RWD / AWD", versions: ["Standard Range", "Long Range", "N Line"] },
    "Starex H-1": { motor: "2.4L / 2.5L Diésel", fuel: "Gasolina / Diésel", transmission: "Manual / Automática", traction: "RWD", versions: ["GL", "GLS"] },
  },

  // ── Mazda ──────────────────────────────────────────────────────────────
  Mazda: {
    Mazda2: { motor: "1.5L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Prime", "Sport", "Gran Touring", "Gran Touring LX"] },
    Mazda3: { motor: "2.0L / 2.5L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD / AWD", versions: ["Prime", "Sport", "Carbon Edition", "Gran Touring", "Gran Touring LX", "Turbo"] },
    Mazda6: { motor: "2.0L / 2.5L / 2.5T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Sport", "Touring", "Grand Touring", "Signature", "Turbo"] },
    "CX-3": { motor: "2.0L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD / AWD", versions: ["Sport", "Touring", "Grand Touring"] },
    "CX-30": { motor: "2.0L / 2.5T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD / AWD", versions: ["Sport", "Carbon Edition", "Grand Touring", "Turbo"] },
    "CX-5": { motor: "2.0L / 2.5L / 2.5T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD / AWD", versions: ["Sport", "Touring", "Carbon Edition", "Grand Touring", "Signature"] },
    "CX-9": { motor: "2.5T", fuel: "Gasolina", transmission: "Automática", traction: "FWD / AWD", versions: ["Sport", "Touring", "Grand Touring", "Signature"] },
    "BT-50": { motor: "3.2L Diésel / 2.2L Diésel", fuel: "Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["Pro", "Thunder", "Wildtrak"] },
  },

  // ── Nissan ─────────────────────────────────────────────────────────────
  Nissan: {
    March: { motor: "1.2L / 1.6L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Active", "Sense", "Advance", "Exclusive"] },
    Versa: { motor: "1.6L / 1.4T", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["Sense", "Advance", "Exclusive", "SR"] },
    Sentra: { motor: "2.0L / 1.6T", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["Sense", "Advance", "Exclusive", "SR"] },
    Kicks: { motor: "1.6L", fuel: "Gasolina", transmission: "CVT", traction: "FWD", versions: ["Sense", "Advance", "Exclusive", "SR"] },
    "X-Trail": { motor: "2.0L / 2.5L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD / AWD", versions: ["Sense", "Advance", "Exclusive"] },
    Qashqai: { motor: "1.3T / 2.0L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD / AWD", versions: ["Sense", "Advance", "Exclusive"] },
    Frontier: { motor: "2.5L / 4.0L V6", fuel: "Gasolina / Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["S", "SV", "Pro-4X"] },
    Murano: { motor: "3.5L V6", fuel: "Gasolina", transmission: "CVT", traction: "FWD / AWD", versions: ["SV", "SL", "Platinum"] },
    Pathfinder: { motor: "3.5L V6", fuel: "Gasolina", transmission: "CVT / Automática", traction: "FWD / 4WD", versions: ["SV", "SL", "Platinum"] },
    Navara: { motor: "2.3L Diésel", fuel: "Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["SX", "EL", "ST", "Pro-4X"] },
  },

  // ── Ford ───────────────────────────────────────────────────────────────
  Ford: {
    EcoSport: { motor: "1.5L / 2.0L / 1.0T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD / 4WD", versions: ["Trend", "SE", "SEL", "Titanium", "Storm"] },
    Escape: { motor: "1.5T / 2.0T", fuel: "Gasolina / Híbrido", transmission: "Automática 8AT", traction: "FWD / AWD", versions: ["S", "SE", "SEL", "Titanium"] },
    Bronco: { motor: "2.3T / 2.7T V6", fuel: "Gasolina", transmission: "Manual / Automática", traction: "4WD", versions: ["Base", "Big Bend", "Black Diamond", "Outer Banks", "Badlands", "Wildtrak"] },
    Explorer: { motor: "2.3T / 3.0T V6", fuel: "Gasolina / Híbrido", transmission: "Automática 10AT", traction: "FWD / AWD / 4WD", versions: ["XLT", "ST-Line", "Limited", "Platinum"] },
    Expedition: { motor: "3.5T V6", fuel: "Gasolina", transmission: "Automática 10AT", traction: "RWD / 4WD", versions: ["XLT", "Limited", "King Ranch", "Platinum"] },
    Ranger: { motor: "2.3T / 2.0L Diésel", fuel: "Gasolina / Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["XL", "XLS", "XLT", "Limited", "Raptor"] },
    "F-150": { motor: "2.7T V6 / 3.5T V6 / 5.0L V8", fuel: "Gasolina", transmission: "Automática 10AT", traction: "4WD", versions: ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Raptor"] },
    Mustang: { motor: "2.3T / 5.0L V8", fuel: "Gasolina", transmission: "Manual / Automática", traction: "RWD", versions: ["EcoBoost", "GT", "GT500", "Dark Horse"] },
    Maverick: { motor: "2.5L Híbrido / 2.0T", fuel: "Gasolina / Híbrido", transmission: "CVT / Automática", traction: "FWD / AWD", versions: ["XL", "XLT", "Lariat"] },
  },

  // ── Volkswagen ─────────────────────────────────────────────────────────
  Volkswagen: {
    Polo: { motor: "1.0T / 1.6L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Trendline", "Comfortline", "Highline", "GTI"] },
    Vento: { motor: "1.6L / 1.4T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Startline", "Trendline", "Comfortline", "Highline"] },
    Virtus: { motor: "1.0T / 1.6L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Trendline", "Comfortline", "Highline", "GTS"] },
    Golf: { motor: "1.4T / 2.0T", fuel: "Gasolina", transmission: "Manual / DSG", traction: "FWD", versions: ["Trendline", "Comfortline", "Highline", "GTI", "R"] },
    Jetta: { motor: "1.4T / 1.8T / 2.0T", fuel: "Gasolina", transmission: "Manual / DSG", traction: "FWD", versions: ["Trendline", "Comfortline", "Highline", "GLI"] },
    "T-Cross": { motor: "1.0T / 1.6L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Trendline", "Comfortline", "Highline"] },
    Tiguan: { motor: "1.4T / 2.0T", fuel: "Gasolina", transmission: "DSG / Automática", traction: "FWD / 4MOTION AWD", versions: ["Trendline", "Comfortline", "Highline", "R-Line", "R"] },
    Teramont: { motor: "2.0T", fuel: "Gasolina", transmission: "DSG 7AT", traction: "FWD / 4MOTION AWD", versions: ["Comfortline", "Highline", "R-Line"] },
    Amarok: { motor: "2.0T / 3.0L V6 Diésel", fuel: "Gasolina / Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["Trendline", "Comfortline", "Highline", "V6 Extreme"] },
    Saveiro: { motor: "1.6L", fuel: "Gasolina", transmission: "Manual", traction: "RWD", versions: ["Startline", "Trendline", "Pepper"] },
  },

  // ── Honda ──────────────────────────────────────────────────────────────
  Honda: {
    Fit: { motor: "1.5L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["EX", "EX-L"] },
    City: { motor: "1.5L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["LX", "EX", "EX Premium", "Touring"] },
    Civic: { motor: "1.5T / 2.0L", fuel: "Gasolina", transmission: "Manual / CVT / Automática", traction: "FWD", versions: ["LX", "Sport", "EX", "EX-L", "Touring", "Si", "Type R"] },
    Accord: { motor: "1.5T / 2.0T", fuel: "Gasolina / Híbrido", transmission: "CVT / Automática 10AT", traction: "FWD", versions: ["Sport", "EX-L", "Touring"] },
    "HR-V": { motor: "1.5L / 1.8L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD / AWD", versions: ["LX", "Sport", "EX", "EX-L", "Touring"] },
    "CR-V": { motor: "1.5T / 2.0L Híbrido", fuel: "Gasolina / Híbrido", transmission: "CVT / Automática", traction: "FWD / AWD", versions: ["LX", "Sport", "EX", "EX-L", "Touring"] },
    Pilot: { motor: "3.5L V6", fuel: "Gasolina", transmission: "Automática 9AT", traction: "FWD / AWD", versions: ["Sport", "EX-L", "TrailSport", "Touring", "Elite"] },
  },

  // ── Mitsubishi ─────────────────────────────────────────────────────────
  Mitsubishi: {
    Mirage: { motor: "1.2L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["ES", "G4", "LE"] },
    Attrage: { motor: "1.2L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["ES", "SEL"] },
    ASX: { motor: "1.6L / 2.0L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD / AWD", versions: ["ES", "SE", "SEL"] },
    "Eclipse Cross": { motor: "1.5T / 2.4L Híbrido", fuel: "Gasolina / Híbrido", transmission: "CVT / Automática 8AT", traction: "FWD / AWD", versions: ["ES", "SE", "SEL", "SE Sport"] },
    Outlander: { motor: "2.4L / 2.5L / 2.4L Híbrido", fuel: "Gasolina / Híbrido", transmission: "CVT / Automática 8AT", traction: "FWD / AWD", versions: ["ES", "SE", "SEL", "SE Black Edition"] },
    "Montero Sport": { motor: "3.0L V6 / 2.4L Diésel", fuel: "Gasolina / Diésel", transmission: "Automática 5AT", traction: "4WD", versions: ["GLX", "GLS", "GT"] },
    Montero: { motor: "3.8L V6 / 3.2L Diésel", fuel: "Gasolina / Diésel", transmission: "Automática 5AT", traction: "4WD", versions: ["GLX", "GLS", "Limited"] },
    L200: { motor: "2.4L Diésel", fuel: "Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["GLX", "GLS", "Triton", "Dark Edition"] },
  },

  // ── Jeep ───────────────────────────────────────────────────────────────
  Jeep: {
    Renegade: { motor: "1.3T / 1.8L", fuel: "Gasolina", transmission: "Manual / Automática 6AT", traction: "FWD / 4WD", versions: ["Sport", "Longitude", "Latitude", "Limited", "Trailhawk", "Upland"] },
    Compass: { motor: "1.3T / 2.0L Diésel / 2.0T", fuel: "Gasolina / Diésel / Híbrido", transmission: "Manual / Automática 9AT", traction: "FWD / 4WD", versions: ["Sport", "Longitude", "Latitude", "Limited", "Trailhawk"] },
    Cherokee: { motor: "2.0T / 3.2L V6", fuel: "Gasolina", transmission: "Automática 9AT", traction: "FWD / 4WD", versions: ["Latitude", "Latitude Lux", "Limited", "Trailhawk", "Overland"] },
    "Grand Cherokee": { motor: "2.0T / 3.6L V6 / 5.7L V8", fuel: "Gasolina / Híbrido", transmission: "Automática 8AT", traction: "4WD", versions: ["Laredo", "Altitude", "Limited", "Overland", "Summit", "L", "4xe"] },
    Wrangler: { motor: "2.0T / 3.6L V6 / 3.0L Diésel", fuel: "Gasolina / Diésel / Híbrido", transmission: "Manual / Automática 8AT", traction: "4WD", versions: ["Sport", "Sport S", "Sahara", "Rubicon", "4xe"] },
    Gladiator: { motor: "3.6L V6 / 3.0L Diésel", fuel: "Gasolina / Diésel", transmission: "Manual / Automática 8AT", traction: "4WD", versions: ["Sport", "Sport S", "Overland", "Mojave", "Rubicon"] },
  },

  // ── Dodge / Ram ────────────────────────────────────────────────────────
  Dodge: {
    Journey: { motor: "2.4L / 3.6L V6", fuel: "Gasolina", transmission: "Automática 4AT / 6AT", traction: "FWD / AWD", versions: ["SE", "SXT", "GT", "Crossroad"] },
    Durango: { motor: "3.6L V6 / 5.7L V8", fuel: "Gasolina", transmission: "Automática 8AT", traction: "AWD", versions: ["SXT", "GT", "R/T", "Citadel", "SRT"] },
    Charger: { motor: "3.6L V6 / 5.7L V8 / 6.4L V8", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD / AWD", versions: ["SXT", "GT", "R/T", "Scat Pack", "Hellcat"] },
    Challenger: { motor: "3.6L V6 / 5.7L V8 / 6.4L V8", fuel: "Gasolina", transmission: "Manual / Automática 8AT", traction: "RWD", versions: ["SXT", "GT", "R/T", "Scat Pack", "Hellcat"] },
    "Ram 1500": { motor: "3.6L V6 / 5.7L V8", fuel: "Gasolina", transmission: "Automática 8AT", traction: "4WD", versions: ["Tradesman", "Express", "Big Horn", "Laramie", "Rebel", "TRX"] },
    "Ram 700": { motor: "1.4T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "RWD", versions: ["Work", "SXT", "Sport"] },
  },

  // ── BMW ────────────────────────────────────────────────────────────────
  BMW: {
    X1: { motor: "1.5T / 2.0T", fuel: "Gasolina", transmission: "Automática 7AT / 8AT", traction: "xDrive AWD", versions: ["sDrive18i", "xDrive20i", "xDrive25i", "M35i"] },
    X2: { motor: "2.0T", fuel: "Gasolina", transmission: "Automática 7AT", traction: "xDrive AWD", versions: ["sDrive20i", "xDrive20i", "M35i"] },
    X3: { motor: "2.0T / 3.0T", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["xDrive20i", "xDrive30i", "M40i"] },
    X4: { motor: "2.0T / 3.0T", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["xDrive20i", "xDrive30i", "M40i"] },
    X5: { motor: "3.0T / 4.4L V8", fuel: "Gasolina / Híbrido", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["xDrive40i", "xDrive45e", "M50i", "M Competition"] },
    X6: { motor: "3.0T / 4.4L V8", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["xDrive40i", "M50i", "M Competition"] },
    X7: { motor: "3.0T / 4.4L V8", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["xDrive40i", "xDrive50i", "M60i"] },
    "Serie 1": { motor: "1.5T / 2.0T", fuel: "Gasolina", transmission: "Automática 7AT", traction: "FWD / xDrive AWD", versions: ["118i", "120i", "M135i"] },
    "Serie 3": { motor: "2.0T / 3.0T", fuel: "Gasolina", transmission: "Manual / Automática 8AT", traction: "RWD / xDrive AWD", versions: ["320i", "330i", "340i", "M340i", "M3"] },
    "Serie 4": { motor: "2.0T / 3.0T", fuel: "Gasolina", transmission: "Manual / Automática 8AT", traction: "RWD / xDrive AWD", versions: ["420i", "430i", "440i", "M440i", "M4"] },
    "Serie 5": { motor: "2.0T / 3.0T / 4.4L V8", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD / xDrive AWD", versions: ["520i", "530i", "540i", "550i", "M5"] },
    "Serie 7": { motor: "3.0T / 4.4L V8", fuel: "Gasolina / Híbrido", transmission: "Automática 8AT", traction: "RWD / xDrive AWD", versions: ["740i", "745e", "750i", "760i"] },
    i4: { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática", traction: "RWD / AWD", versions: ["eDrive35", "eDrive40", "M50"] },
    iX: { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática", traction: "AWD", versions: ["xDrive40", "xDrive50", "M60"] },
  },

  // ── Mercedes-Benz ──────────────────────────────────────────────────────
  "Mercedes-Benz": {
    "Clase A": { motor: "1.3T / 2.0T", fuel: "Gasolina", transmission: "DCT 8AT", traction: "FWD / 4MATIC AWD", versions: ["200", "250", "A35 AMG", "A45 AMG"] },
    "Clase C": { motor: "1.5T / 2.0T", fuel: "Gasolina", transmission: "Automática 9AT", traction: "RWD / 4MATIC AWD", versions: ["200", "220d", "300", "43 AMG", "63 AMG"] },
    "Clase E": { motor: "2.0T / 3.0L", fuel: "Gasolina / Diésel", transmission: "Automática 9AT", traction: "RWD / 4MATIC AWD", versions: ["200", "220d", "300", "350", "43 AMG", "63 AMG S"] },
    "Clase S": { motor: "3.0L / 4.0L V8", fuel: "Gasolina / Híbrido", transmission: "Automática 9AT", traction: "RWD / 4MATIC AWD", versions: ["450", "500", "580", "63 AMG"] },
    CLA: { motor: "1.3T / 2.0T", fuel: "Gasolina", transmission: "DCT 8AT", traction: "FWD / 4MATIC AWD", versions: ["200", "250", "35 AMG", "45 AMG"] },
    GLA: { motor: "1.3T / 2.0T", fuel: "Gasolina", transmission: "DCT 8AT", traction: "FWD / 4MATIC AWD", versions: ["200", "250", "35 AMG", "45 AMG"] },
    GLB: { motor: "1.3T / 2.0T", fuel: "Gasolina", transmission: "DCT 8AT", traction: "FWD / 4MATIC AWD", versions: ["200", "250", "35 AMG"] },
    GLC: { motor: "2.0T / 3.0L Diésel", fuel: "Gasolina / Diésel / Híbrido", transmission: "Automática 9AT", traction: "4MATIC AWD", versions: ["200", "300", "300e", "43 AMG", "63 AMG S"] },
    GLE: { motor: "2.0T / 3.0L / 4.0L V8", fuel: "Gasolina / Diésel / Híbrido", transmission: "Automática 9AT", traction: "4MATIC AWD", versions: ["300d", "350", "450", "53 AMG", "63 AMG S"] },
    GLS: { motor: "3.0L / 4.0L V8", fuel: "Gasolina / Diésel", transmission: "Automática 9AT", traction: "4MATIC AWD", versions: ["450", "580", "63 AMG"] },
    "Clase G": { motor: "4.0L V8", fuel: "Gasolina", transmission: "Automática 9AT", traction: "4WD", versions: ["500", "63 AMG"] },
  },

  // ── Audi ───────────────────────────────────────────────────────────────
  Audi: {
    A1: { motor: "1.0T / 1.5T", fuel: "Gasolina", transmission: "DSG 7AT / S-Tronic", traction: "FWD", versions: ["25 TFSI", "30 TFSI", "35 TFSI"] },
    A3: { motor: "1.0T / 1.5T / 2.0T", fuel: "Gasolina", transmission: "Manual / S-Tronic", traction: "FWD / quattro AWD", versions: ["30 TFSI", "35 TFSI", "40 TFSI", "45 TFSI", "S3"] },
    A4: { motor: "1.4T / 2.0T / 3.0T", fuel: "Gasolina / Diésel", transmission: "S-Tronic / Tiptronic", traction: "FWD / quattro AWD", versions: ["35 TFSI", "40 TFSI", "45 TFSI", "S4", "RS4"] },
    A5: { motor: "2.0T", fuel: "Gasolina", transmission: "S-Tronic", traction: "FWD / quattro AWD", versions: ["35 TFSI", "40 TFSI", "45 TFSI", "S5", "RS5"] },
    A6: { motor: "2.0T / 3.0T", fuel: "Gasolina / Diésel", transmission: "S-Tronic / Tiptronic", traction: "FWD / quattro AWD", versions: ["40 TFSI", "45 TFSI", "55 TFSI", "S6", "RS6"] },
    A7: { motor: "3.0T", fuel: "Gasolina", transmission: "S-Tronic", traction: "quattro AWD", versions: ["55 TFSI", "S7", "RS7"] },
    Q3: { motor: "1.4T / 2.0T", fuel: "Gasolina", transmission: "S-Tronic", traction: "FWD / quattro AWD", versions: ["35 TFSI", "40 TFSI", "45 TFSI", "RS Q3"] },
    Q5: { motor: "2.0T / 3.0T", fuel: "Gasolina / Híbrido", transmission: "S-Tronic / Tiptronic", traction: "quattro AWD", versions: ["40 TFSI", "45 TFSI", "55 TFSI e", "SQ5"] },
    Q7: { motor: "2.0T / 3.0T / 3.0L Diésel", fuel: "Gasolina / Diésel / Híbrido", transmission: "Tiptronic 8AT", traction: "quattro AWD", versions: ["45 TFSI", "50 TDI", "55 TFSI", "SQ7"] },
    Q8: { motor: "3.0T", fuel: "Gasolina / Híbrido", transmission: "Tiptronic 8AT", traction: "quattro AWD", versions: ["55 TFSI", "SQ8", "RS Q8"] },
  },

  // ── Porsche ────────────────────────────────────────────────────────────
  Porsche: {
    "911": { motor: "3.0L / 3.8L / 4.0L Boxer", fuel: "Gasolina", transmission: "Manual / PDK", traction: "RWD / AWD", versions: ["Carrera", "Carrera S", "Carrera 4", "4S", "GTS", "Turbo", "Turbo S", "GT3", "GT3 RS"] },
    Cayenne: { motor: "2.9L V6 / 4.0L V8 / 3.0L Híbrido", fuel: "Gasolina / Híbrido", transmission: "Tiptronic 8AT", traction: "AWD", versions: ["Base", "S", "GTS", "Turbo", "Turbo S E-Hybrid", "Coupe"] },
    Macan: { motor: "2.0T / 2.9L V6", fuel: "Gasolina", transmission: "PDK 7AT", traction: "AWD", versions: ["Base", "S", "GTS", "Turbo"] },
    Panamera: { motor: "2.9L V6 / 4.0L V8", fuel: "Gasolina / Híbrido", transmission: "PDK 8AT", traction: "RWD / AWD", versions: ["Base", "4", "4S", "GTS", "Turbo", "Turbo S E-Hybrid"] },
    Taycan: { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática 2AT", traction: "RWD / AWD", versions: ["Base", "4", "4S", "GTS", "Turbo", "Turbo S", "Cross Turismo"] },
  },

  // ── Land Rover ─────────────────────────────────────────────────────────
  "Land Rover": {
    Defender: { motor: "2.0T / 3.0L Diésel / 5.0L V8", fuel: "Gasolina / Diésel / Híbrido", transmission: "Automática 8AT", traction: "4WD", versions: ["90 S", "90 SE", "90 HSE", "110 S", "110 SE", "110 HSE", "110 X", "V8"] },
    Discovery: { motor: "2.0T / 3.0L Diésel", fuel: "Gasolina / Diésel", transmission: "Automática 8AT", traction: "4WD", versions: ["S", "SE", "HSE", "HSE Luxury"] },
    "Discovery Sport": { motor: "1.5T / 2.0T / 2.0L Diésel", fuel: "Gasolina / Diésel / Híbrido", transmission: "Automática 9AT", traction: "AWD", versions: ["S", "SE", "HSE", "R-Dynamic SE"] },
    "Range Rover": { motor: "3.0L / 4.4L V8", fuel: "Gasolina / Diésel / Híbrido", transmission: "Automática 8AT", traction: "4WD", versions: ["SE", "HSE", "Autobiography", "SV"] },
    "Range Rover Sport": { motor: "2.0T / 3.0L / 4.4L V8", fuel: "Gasolina / Diésel / Híbrido", transmission: "Automática 8AT", traction: "4WD", versions: ["S", "SE", "HSE", "Autobiography", "SVR"] },
    "Range Rover Evoque": { motor: "1.5T / 2.0T", fuel: "Gasolina / Híbrido", transmission: "Automática 9AT", traction: "AWD", versions: ["S", "SE", "HSE", "R-Dynamic SE"] },
    "Range Rover Velar": { motor: "2.0T / 3.0L Diésel", fuel: "Gasolina / Diésel / Híbrido", transmission: "Automática 8AT", traction: "AWD", versions: ["S", "SE", "HSE", "R-Dynamic SE"] },
  },

  // ── Suzuki ─────────────────────────────────────────────────────────────
  Suzuki: {
    Swift: { motor: "1.2L / 1.4T", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["GA", "GL", "GLX", "Sport"] },
    Baleno: { motor: "1.4L / 1.2L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["GL", "GLX", "GLX Premium"] },
    Ciaz: { motor: "1.5L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["GL", "GLX"] },
    "S-Cross": { motor: "1.4T / 1.6L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD / AWD", versions: ["GL", "GLX", "GLX Premium"] },
    Vitara: { motor: "1.4T / 1.6L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD / AWD", versions: ["GL", "GLX", "GLX Premium", "S-Turbo"] },
    "Grand Vitara": { motor: "2.4L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "4WD", versions: ["JLX", "JLX-E"] },
    Jimny: { motor: "1.5L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "4WD", versions: ["GL", "GLX"] },
  },

  // ── JAC ────────────────────────────────────────────────────────────────
  JAC: {
    J2: { motor: "1.4L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Luxury"] },
    J3: { motor: "1.4L / 1.5L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Sprint", "Luxury", "Elite"] },
    J4: { motor: "1.5T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Luxury", "Elite"] },
    J5: { motor: "1.8L / 1.5T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Base", "Luxury", "Elite"] },
    S2: { motor: "1.5T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Comfort", "Premium"] },
    S3: { motor: "1.5T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Base", "Comfort", "Elite"] },
    S4: { motor: "1.5T / 1.6T", fuel: "Gasolina", transmission: "Manual / DCT", traction: "FWD / AWD", versions: ["Comfort", "Elite", "Pro"] },
    S5: { motor: "2.0T", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD / AWD", versions: ["Elite"] },
    T6: { motor: "2.0T", fuel: "Gasolina / Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["Pro", "Executive"] },
    T8: { motor: "2.0T / 2.4L Diésel", fuel: "Gasolina / Diésel", transmission: "Manual / Automática", traction: "4WD", versions: ["Pro", "Executive"] },
    E10X: { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática", traction: "FWD", versions: ["Base", "Comfort"] },
  },

  // ── Chery ──────────────────────────────────────────────────────────────
  Chery: {
    QQ: { motor: "1.0L / 1.1L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Activo", "Comfort", "Sport"] },
    "Tiggo 2": { motor: "1.5L / 1.5T", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["FL", "Comfort", "Premium"] },
    "Tiggo 3": { motor: "1.5L / 1.6L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["Base", "Luxury", "Super Luxury"] },
    "Tiggo 4": { motor: "1.5T", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["FL", "Comfort", "Premium"] },
    "Tiggo 5X": { motor: "1.5T", fuel: "Gasolina", transmission: "Manual / CVT / DCT", traction: "FWD", versions: ["Comfort", "Premium", "Pro"] },
    "Tiggo 7": { motor: "1.5T / 2.0T", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD / AWD", versions: ["Comfort", "Premium", "Pro"] },
    "Tiggo 7 Pro": { motor: "1.6T", fuel: "Gasolina", transmission: "CVT / DCT", traction: "FWD / AWD", versions: ["Comfort", "Premium", "Max"] },
    "Tiggo 8": { motor: "1.5T / 2.0T", fuel: "Gasolina", transmission: "CVT / DCT", traction: "FWD / AWD", versions: ["Comfort", "Premium", "Pro"] },
    "Tiggo 8 Pro": { motor: "2.0T", fuel: "Gasolina", transmission: "DCT", traction: "FWD / AWD", versions: ["Premium", "Max"] },
    "Arrizo 5": { motor: "1.5T", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["Comfort", "Premium"] },
    "Arrizo 6": { motor: "1.5T / 1.6T", fuel: "Gasolina", transmission: "Manual / CVT / DCT", traction: "FWD", versions: ["Comfort", "Premium", "GT"] },
  },

  // ── BAIC ───────────────────────────────────────────────────────────────
  BAIC: {
    D20: { motor: "1.3L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["Base", "GL", "GS"] },
    X25: { motor: "1.5L", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["Base", "GL", "GS", "Elegance"] },
    X35: { motor: "1.5T", fuel: "Gasolina", transmission: "Manual / CVT", traction: "FWD", versions: ["GL", "GS", "Elegance"] },
    X55: { motor: "1.8T", fuel: "Gasolina", transmission: "Automática 6AT", traction: "FWD / AWD", versions: ["GL", "GS", "Elegance"] },
    BJ40: { motor: "2.0T", fuel: "Gasolina", transmission: "Automática", traction: "4WD", versions: ["Plus", "Plus Lux"] },
  },

  // ── Haval ──────────────────────────────────────────────────────────────
  Haval: {
    H1: { motor: "1.5L", fuel: "Gasolina", transmission: "Manual / Automática", traction: "FWD", versions: ["Base", "Comfort"] },
    H6: { motor: "1.5T / 2.0T", fuel: "Gasolina", transmission: "DCT 7AT", traction: "FWD / AWD", versions: ["Comfort", "Premium", "Ultra"] },
    H7: { motor: "2.0T", fuel: "Gasolina", transmission: "Automática 6AT", traction: "FWD / AWD", versions: ["Comfort", "Premium"] },
    Jolion: { motor: "1.5T", fuel: "Gasolina / Híbrido", transmission: "DCT 7AT", traction: "FWD", versions: ["Comfort", "Premium", "Ultra"] },
  },

  // ── Subaru ─────────────────────────────────────────────────────────────
  Subaru: {
    Impreza: { motor: "2.0L", fuel: "Gasolina", transmission: "Manual / CVT Lineartronic", traction: "Symmetrical AWD", versions: ["GL", "GLS", "Sport", "RS"] },
    Legacy: { motor: "2.5L", fuel: "Gasolina", transmission: "CVT Lineartronic", traction: "Symmetrical AWD", versions: ["Premium", "Sport", "Limited"] },
    Outback: { motor: "2.5L / 2.4T", fuel: "Gasolina", transmission: "CVT Lineartronic", traction: "Symmetrical AWD", versions: ["Premium", "Outdoor XT", "Limited XT", "Wilderness"] },
    Forester: { motor: "2.0L / 2.5L", fuel: "Gasolina / Híbrido", transmission: "CVT Lineartronic", traction: "Symmetrical AWD", versions: ["Premium", "Sport", "Limited", "Wilderness"] },
    XV: { motor: "2.0L / 2.5L", fuel: "Gasolina / Híbrido", transmission: "CVT Lineartronic", traction: "Symmetrical AWD", versions: ["Premium", "Sport", "Limited"] },
    WRX: { motor: "2.4T", fuel: "Gasolina", transmission: "Manual / CVT Sport", traction: "Symmetrical AWD", versions: ["Base", "Premium", "Limited", "GT", "STI"] },
    BRZ: { motor: "2.4L", fuel: "Gasolina", transmission: "Manual / Automática 6AT", traction: "RWD", versions: ["Premium", "Limited"] },
  },
};

export const BRAND_NAMES: string[] = Object.keys(CAR_CATALOG).sort((a, b) =>
  a.localeCompare(b, "es")
);

export function getLinesForBrand(brand: string): string[] {
  return brand in CAR_CATALOG ? Object.keys(CAR_CATALOG[brand]) : [];
}

export function getSpecsForLine(brand: string, line: string): LineSpec | null {
  return CAR_CATALOG[brand]?.[line] ?? null;
}

export function getVersionsForLine(brand: string, line: string): string[] {
  return CAR_CATALOG[brand]?.[line]?.versions ?? [];
}

export function normalizeTransmission(raw: string): "Manual" | "Automática" | "" {
  const lower = raw.toLowerCase();
  if (lower.includes("manual")) return "Manual";
  if (
    lower.includes("auto") ||
    lower.includes("cvt") ||
    lower.includes("dct") ||
    lower.includes("dsg") ||
    lower.includes("pdk") ||
    lower.includes("s-tronic") ||
    lower.includes("tiptronic") ||
    lower.includes("lineartronic")
  )
    return "Automática";
  return "";
}
