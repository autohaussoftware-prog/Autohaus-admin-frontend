export type LineSpec = {
  motor: string;
  fuel: string;
  transmission: string;
  traction: string;
  versions?: string[];
};

export type CarCatalog = Record<string, Record<string, LineSpec>>;

export const CAR_CATALOG: CarCatalog = {
  BMW: {
    "X1": { motor: "2.0L TwinPower Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["sDrive18i", "xDrive20i", "xDrive25i", "M35i"] },
    "X3": { motor: "2.0L TwinPower Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["xDrive20i", "xDrive30i", "M40i"] },
    "X4": { motor: "2.0L TwinPower Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["xDrive20i", "xDrive30i", "M40i"] },
    "X5": { motor: "3.0L TwinPower Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["xDrive40i", "xDrive45e", "M50i"] },
    "X6": { motor: "3.0L TwinPower Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["xDrive40i", "M50i"] },
    "X7": { motor: "3.0L TwinPower Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["xDrive40i", "xDrive50i", "M50i"] },
    "Serie 3": { motor: "2.0L TwinPower Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD", versions: ["320i", "330i", "340i", "M340i"] },
    "Serie 4": { motor: "2.0L TwinPower Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD", versions: ["420i", "430i", "440i", "M440i"] },
    "Serie 5": { motor: "2.0L TwinPower Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD", versions: ["520i", "530i", "540i", "M550i"] },
    "Serie 7": { motor: "3.0L TwinPower Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD", versions: ["740i", "750i", "760i"] },
    "M3": { motor: "3.0L M TwinPower Turbo", fuel: "Gasolina", transmission: "Manual / Automática 8AT", traction: "RWD / xDrive AWD", versions: ["M3", "M3 Competition", "M3 CS"] },
    "M4": { motor: "3.0L M TwinPower Turbo", fuel: "Gasolina", transmission: "Manual / Automática 8AT", traction: "RWD / xDrive AWD", versions: ["M4", "M4 Competition", "M4 CS"] },
    "M5": { motor: "4.4L M TwinPower Turbo V8", fuel: "Gasolina", transmission: "Automática 8AT", traction: "xDrive AWD", versions: ["M5", "M5 Competition"] },
    "i4": { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática", traction: "RWD / AWD", versions: ["eDrive40", "M50"] },
    "iX": { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática", traction: "AWD", versions: ["xDrive40", "xDrive50", "M60"] },
  },

  "Mercedes-Benz": {
    "GLA": { motor: "1.3L Turbo", fuel: "Gasolina", transmission: "Automática 7DCT", traction: "FWD / 4MATIC", versions: ["GLA 200", "GLA 250", "AMG GLA 35", "AMG GLA 45 S"] },
    "GLC": { motor: "2.0L Turbo", fuel: "Gasolina", transmission: "Automática 9AT", traction: "4MATIC AWD", versions: ["GLC 200", "GLC 300", "GLC 350e", "AMG GLC 43", "AMG GLC 63"] },
    "GLE": { motor: "2.0L Turbo", fuel: "Gasolina", transmission: "Automática 9AT", traction: "4MATIC AWD", versions: ["GLE 350", "GLE 450", "GLE 580", "AMG GLE 53", "AMG GLE 63 S"] },
    "GLS": { motor: "3.0L Turbo", fuel: "Gasolina", transmission: "Automática 9AT", traction: "4MATIC AWD", versions: ["GLS 450", "GLS 580", "AMG GLS 63"] },
    "G 63": { motor: "4.0L Biturbo V8", fuel: "Gasolina", transmission: "Automática 9AT", traction: "4MATIC AWD" },
    "Clase C": { motor: "1.5L / 2.0L Turbo", fuel: "Gasolina", transmission: "Automática 9AT", traction: "RWD / 4MATIC", versions: ["C 200", "C 300", "AMG C 43", "AMG C 63"] },
    "Clase E": { motor: "2.0L Turbo", fuel: "Gasolina", transmission: "Automática 9AT", traction: "RWD / 4MATIC", versions: ["E 200", "E 300", "E 350", "AMG E 53"] },
    "Clase S": { motor: "3.0L Turbo", fuel: "Gasolina", transmission: "Automática 9AT", traction: "4MATIC AWD", versions: ["S 450", "S 580", "AMG S 63"] },
    "Clase A": { motor: "1.3L Turbo", fuel: "Gasolina", transmission: "Automática 7DCT", traction: "FWD", versions: ["A 200", "A 250", "AMG A 35", "AMG A 45 S"] },
    "Sprinter": { motor: "2.1L CDI Diésel", fuel: "Diésel", transmission: "Manual / Automática", traction: "RWD" },
    "Vito": { motor: "2.1L CDI Diésel", fuel: "Diésel", transmission: "Manual / Automática 7AT", traction: "RWD / 4MATIC" },
  },

  Audi: {
    "Q3": { motor: "1.4L TFSI", fuel: "Gasolina", transmission: "DSG 7AT", traction: "FWD / quattro AWD", versions: ["Q3 35 TFSI", "Q3 40 TFSI", "Q3 Sportback 45 TFSI"] },
    "Q5": { motor: "2.0L TFSI", fuel: "Gasolina", transmission: "tiptronic 7AT", traction: "quattro AWD", versions: ["Q5 40 TFSI", "Q5 45 TFSI", "SQ5", "Q5 Sportback"] },
    "Q7": { motor: "3.0L TFSI", fuel: "Gasolina", transmission: "tiptronic 8AT", traction: "quattro AWD", versions: ["Q7 55 TFSI", "Q7 60 TFSI", "SQ7"] },
    "Q8": { motor: "3.0L TFSI", fuel: "Gasolina", transmission: "tiptronic 8AT", traction: "quattro AWD", versions: ["Q8 55 TFSI", "SQ8", "RSQ8"] },
    "A3": { motor: "1.4L TFSI", fuel: "Gasolina", transmission: "DSG 7AT", traction: "FWD", versions: ["A3 35 TFSI", "A3 40 TFSI", "S3"] },
    "A4": { motor: "2.0L TFSI", fuel: "Gasolina", transmission: "DSG 7AT", traction: "FWD / quattro AWD", versions: ["A4 35 TFSI", "A4 40 TFSI", "A4 45 TFSI", "S4"] },
    "A5": { motor: "2.0L TFSI", fuel: "Gasolina", transmission: "DSG 7AT", traction: "FWD / quattro AWD", versions: ["A5 40 TFSI", "A5 45 TFSI", "S5", "RS5"] },
    "A6": { motor: "2.0L TFSI", fuel: "Gasolina", transmission: "tiptronic 8AT", traction: "FWD / quattro AWD", versions: ["A6 45 TFSI", "A6 55 TFSI", "S6"] },
    "A7": { motor: "3.0L TFSI", fuel: "Gasolina", transmission: "tiptronic 8AT", traction: "quattro AWD", versions: ["A7 55 TFSI", "S7", "RS7"] },
    "e-tron": { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática", traction: "quattro AWD", versions: ["e-tron 55", "e-tron GT", "RS e-tron GT"] },
  },

  Porsche: {
    "Macan": { motor: "2.0L Turbo / 2.9L Biturbo", fuel: "Gasolina", transmission: "PDK 7AT", traction: "AWD", versions: ["Macan", "Macan S", "Macan GTS", "Macan Turbo"] },
    "Cayenne": { motor: "3.0L Turbo / 4.0L Biturbo V8", fuel: "Gasolina", transmission: "tiptronic 8AT", traction: "AWD", versions: ["Cayenne", "Cayenne S", "Cayenne GTS", "Cayenne Turbo", "Cayenne Coupe"] },
    "Panamera": { motor: "2.9L Biturbo / 4.0L Biturbo V8", fuel: "Gasolina", transmission: "PDK 8AT", traction: "RWD / AWD", versions: ["Panamera 4", "Panamera GTS", "Panamera Turbo", "Panamera Turbo S"] },
    "911": { motor: "3.0L Boxer 6 cilindros", fuel: "Gasolina", transmission: "PDK 8AT / Manual 7MT", traction: "RWD / AWD", versions: ["911 Carrera", "911 Carrera S", "911 Carrera 4S", "911 GT3", "911 Turbo S"] },
    "Taycan": { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática 2 velocidades", traction: "RWD / AWD", versions: ["Taycan", "Taycan 4", "Taycan 4S", "Taycan GTS", "Taycan Turbo S"] },
  },

  "Land Rover": {
    "Defender": { motor: "2.0L / 3.0L Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "4WD AWD", versions: ["Defender 90", "Defender 110", "Defender 130", "Defender P400e"] },
    "Discovery": { motor: "2.0L / 3.0L Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "4WD AWD", versions: ["Discovery S", "Discovery SE", "Discovery HSE", "Discovery R-Dynamic"] },
    "Discovery Sport": { motor: "2.0L Turbo", fuel: "Gasolina", transmission: "Automática 9AT", traction: "AWD", versions: ["Discovery Sport S", "Discovery Sport SE", "Discovery Sport HSE"] },
    "Range Rover Sport": { motor: "3.0L Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "4WD AWD", versions: ["Range Rover Sport HSE", "Range Rover Sport Dynamic HSE", "Range Rover Sport SVR"] },
    "Range Rover": { motor: "3.0L Turbo / 4.4L V8", fuel: "Gasolina", transmission: "Automática 8AT", traction: "4WD AWD", versions: ["Range Rover SE", "Range Rover HSE", "Range Rover Autobiography", "Range Rover SV"] },
    "Range Rover Evoque": { motor: "2.0L Turbo", fuel: "Gasolina", transmission: "Automática 9AT", traction: "FWD / AWD", versions: ["Evoque SE", "Evoque HSE", "Evoque R-Dynamic"] },
  },

  Volkswagen: {
    "Tiguan": { motor: "1.4L TSI / 2.0L TSI", fuel: "Gasolina", transmission: "DSG 7AT", traction: "FWD / 4MOTION AWD", versions: ["Tiguan Trendline", "Tiguan Comfortline", "Tiguan Highline", "Tiguan R-Line"] },
    "Tiguan Allspace": { motor: "2.0L TSI", fuel: "Gasolina", transmission: "DSG 7AT", traction: "4MOTION AWD", versions: ["Tiguan Allspace Comfortline", "Tiguan Allspace Highline", "Tiguan Allspace R-Line"] },
    "Touareg": { motor: "3.0L V6 TSI", fuel: "Gasolina", transmission: "tiptronic 8AT", traction: "4MOTION AWD", versions: ["Touareg SE", "Touareg Elegance", "Touareg R-Line"] },
    "Golf": { motor: "1.4L TSI / 2.0L TSI", fuel: "Gasolina", transmission: "DSG 7AT / Manual", traction: "FWD / 4MOTION AWD", versions: ["Golf Comfortline", "Golf Highline", "Golf R-Line", "Golf GTI", "Golf R"] },
    "Jetta": { motor: "1.4L TSI", fuel: "Gasolina", transmission: "DSG 7AT", traction: "FWD", versions: ["Jetta Trendline", "Jetta Comfortline", "Jetta Highline", "Jetta GLI"] },
    "Polo": { motor: "1.6L / 1.4L TSI", fuel: "Gasolina", transmission: "Automática / Manual", traction: "FWD", versions: ["Polo Trendline", "Polo Comfortline", "Polo Highline"] },
    "Amarok": { motor: "2.0L TDI / 3.0L TDI", fuel: "Diésel", transmission: "Automática 8AT / Manual", traction: "4MOTION AWD", versions: ["Amarok Trendline", "Amarok Comfortline", "Amarok Highline", "Amarok V6"] },
  },

  Toyota: {
    "RAV4": { motor: "2.5L 4 cilindros", fuel: "Gasolina", transmission: "Automática CVT", traction: "FWD / AWD", versions: ["RAV4 LE", "RAV4 XLE", "RAV4 XSE", "RAV4 TRD", "RAV4 Prime"] },
    "Corolla": { motor: "1.8L / 2.0L 4 cilindros", fuel: "Gasolina", transmission: "Automática CVT", traction: "FWD", versions: ["Corolla LE", "Corolla SE", "Corolla XSE", "Corolla XLE"] },
    "Camry": { motor: "2.5L 4 cilindros / 3.5L V6", fuel: "Gasolina", transmission: "Automática 8AT", traction: "FWD / AWD", versions: ["Camry LE", "Camry SE", "Camry XSE", "Camry XLE", "Camry TRD"] },
    "Land Cruiser": { motor: "4.6L V8 / 3.5L V6 Biturbo", fuel: "Gasolina", transmission: "Automática 10AT", traction: "4WD", versions: ["Land Cruiser GXR", "Land Cruiser GXR+", "Land Cruiser VXR"] },
    "Prado": { motor: "2.7L 4 cilindros / 4.0L V6", fuel: "Gasolina", transmission: "Automática 6AT", traction: "4WD", versions: ["Prado TXL", "Prado VXL", "Prado Grande"] },
    "Fortuner": { motor: "2.7L / 4.0L V6", fuel: "Gasolina", transmission: "Automática 6AT", traction: "4WD / RWD", versions: ["Fortuner 4x2", "Fortuner 4x4", "Fortuner Legender"] },
    "Hilux": { motor: "2.7L Gasolina / 2.4L Diésel", fuel: "Gasolina", transmission: "Automática 6AT / Manual 6MT", traction: "4WD / RWD", versions: ["Hilux SR", "Hilux SR5", "Hilux GR Sport", "Hilux 4x2", "Hilux 4x4"] },
    "Yaris": { motor: "1.5L 4 cilindros", fuel: "Gasolina", transmission: "Automática CVT / Manual", traction: "FWD", versions: ["Yaris Core", "Yaris S", "Yaris Cross"] },
    "C-HR": { motor: "2.0L Híbrido", fuel: "Híbrido", transmission: "Automática eCVT", traction: "FWD / AWD", versions: ["C-HR HV", "C-HR GR Sport"] },
    "Prius": { motor: "1.8L Híbrido", fuel: "Híbrido", transmission: "Automática eCVT", traction: "FWD / AWD", versions: ["Prius LE", "Prius XLE", "Prius Limited", "Prime"] },
  },

  Chevrolet: {
    "Tracker": { motor: "1.0L Turbo / 1.2L Turbo", fuel: "Gasolina", transmission: "Automática 6AT / Manual", traction: "FWD", versions: ["Tracker LT", "Tracker Premier", "Tracker LTZ"] },
    "Captiva": { motor: "1.5L Turbo", fuel: "Gasolina", transmission: "Automática 6AT", traction: "FWD", versions: ["Captiva LT", "Captiva Premier", "Captiva LTZ"] },
    "Trailblazer": { motor: "2.5L Turbo Diésel", fuel: "Diésel", transmission: "Automática 6AT", traction: "RWD / 4WD", versions: ["Trailblazer LT", "Trailblazer LTZ", "Trailblazer Z71"] },
    "Tahoe": { motor: "5.3L V8 / 6.2L V8", fuel: "Gasolina", transmission: "Automática 10AT", traction: "RWD / 4WD", versions: ["Tahoe LS", "Tahoe LT", "Tahoe RST", "Tahoe LTZ", "Tahoe High Country"] },
    "Suburban": { motor: "5.3L V8 / 6.2L V8", fuel: "Gasolina", transmission: "Automática 10AT", traction: "RWD / 4WD", versions: ["Suburban LS", "Suburban LT", "Suburban RST", "Suburban LTZ", "Suburban High Country"] },
    "Colorado": { motor: "2.8L Turbo Diésel", fuel: "Diésel", transmission: "Automática 6AT", traction: "RWD / 4WD", versions: ["Colorado LT", "Colorado LTZ", "Colorado Z71", "Colorado ZR2"] },
    "Onix": { motor: "1.0L Turbo / 1.4L", fuel: "Gasolina", transmission: "Automática / Manual", traction: "FWD", versions: ["Onix LS", "Onix LT", "Onix LTZ", "Onix RS"] },
    "Blazer": { motor: "2.0L Turbo / 3.6L V6", fuel: "Gasolina", transmission: "Automática 9AT", traction: "FWD / AWD", versions: ["Blazer LT", "Blazer RS", "Blazer Premier"] },
    "Camaro": { motor: "2.0L Turbo / 6.2L V8", fuel: "Gasolina", transmission: "Automática 8AT / Manual 6MT", traction: "RWD", versions: ["Camaro 1LS", "Camaro 1LT", "Camaro 2LT", "Camaro SS", "Camaro ZL1"] },
    "Corvette": { motor: "6.2L V8 LT2", fuel: "Gasolina", transmission: "Automática 8DCT", traction: "RWD / AWD", versions: ["Corvette Stingray", "Corvette Z06", "Corvette E-Ray"] },
  },

  Mazda: {
    "CX-3": { motor: "2.0L SKYACTIV", fuel: "Gasolina", transmission: "Automática 6AT / Manual 6MT", traction: "FWD / AWD", versions: ["CX-3 Sport", "CX-3 Grand Touring"] },
    "CX-5": { motor: "2.0L / 2.5L SKYACTIV", fuel: "Gasolina", transmission: "Automática 6AT", traction: "FWD / AWD", versions: ["CX-5 Sport", "CX-5 Touring", "CX-5 Grand Touring", "CX-5 Signature"] },
    "CX-9": { motor: "2.5L Turbo SKYACTIV", fuel: "Gasolina", transmission: "Automática 6AT", traction: "FWD / AWD", versions: ["CX-9 Sport", "CX-9 Touring", "CX-9 Grand Touring", "CX-9 Signature"] },
    "CX-50": { motor: "2.5L / 2.5L Turbo SKYACTIV", fuel: "Gasolina", transmission: "Automática 6AT", traction: "AWD", versions: ["CX-50 25S", "CX-50 Turbo", "CX-50 Meridian"] },
    "Mazda3": { motor: "2.0L / 2.5L SKYACTIV", fuel: "Gasolina", transmission: "Automática 6AT / Manual 6MT", traction: "FWD / AWD", versions: ["Mazda3 Sport", "Mazda3 Touring", "Mazda3 Grand Touring"] },
    "Mazda6": { motor: "2.5L SKYACTIV", fuel: "Gasolina", transmission: "Automática 6AT", traction: "FWD", versions: ["Mazda6 Sport", "Mazda6 Touring", "Mazda6 Grand Touring", "Mazda6 Signature"] },
    "BT-50": { motor: "3.2L / 2.2L Diésel", fuel: "Diésel", transmission: "Automática 6AT / Manual 6MT", traction: "RWD / 4WD", versions: ["BT-50 Professional", "BT-50 Professional Plus"] },
  },

  Kia: {
    "Sportage": { motor: "2.0L / 2.0L Turbo", fuel: "Gasolina", transmission: "Automática 6AT / Manual 6MT", traction: "FWD / AWD", versions: ["Sportage LX", "Sportage EX", "Sportage GT-Line", "Sportage SX"] },
    "Sorento": { motor: "2.5L Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "FWD / AWD", versions: ["Sorento LX", "Sorento EX", "Sorento SX", "Sorento X-Line"] },
    "Carnival": { motor: "3.5L V6 / 2.2L Diésel", fuel: "Gasolina", transmission: "Automática 8AT", traction: "FWD", versions: ["Carnival LX", "Carnival EX", "Carnival SX", "Carnival SX Prestige"] },
    "Seltos": { motor: "2.0L / 1.6L Turbo", fuel: "Gasolina", transmission: "Automática IVT / DCT 7AT / Manual", traction: "FWD / AWD", versions: ["Seltos LX", "Seltos EX", "Seltos SX", "Seltos X-Line"] },
    "Rio": { motor: "1.6L", fuel: "Gasolina", transmission: "Automática 6AT / Manual 6MT", traction: "FWD", versions: ["Rio LX", "Rio EX", "Rio GT-Line"] },
    "Stinger": { motor: "2.0L Turbo / 3.3L Biturbo V6", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD / AWD", versions: ["Stinger GT", "Stinger GT Line", "Stinger GT2"] },
    "Telluride": { motor: "3.8L V6", fuel: "Gasolina", transmission: "Automática 8AT", traction: "FWD / AWD", versions: ["Telluride LX", "Telluride EX", "Telluride SX", "Telluride X-Line"] },
    "EV6": { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática 1AT", traction: "RWD / AWD", versions: ["EV6 Air", "EV6 Wind", "EV6 GT-Line", "EV6 GT"] },
  },

  Hyundai: {
    "Tucson": { motor: "2.0L / 1.6L Turbo", fuel: "Gasolina", transmission: "Automática 6AT / DCT 7AT", traction: "FWD / AWD", versions: ["Tucson GL", "Tucson GLS", "Tucson Limited", "Tucson N-Line"] },
    "Santa Fe": { motor: "2.5L Turbo", fuel: "Gasolina", transmission: "Automática 8AT", traction: "FWD / AWD", versions: ["Santa Fe GL", "Santa Fe GLS", "Santa Fe Limited", "Santa Fe XRT"] },
    "Creta": { motor: "1.6L / 2.0L", fuel: "Gasolina", transmission: "Automática 6AT / Manual 6MT", traction: "FWD", versions: ["Creta GL", "Creta GLS", "Creta Limited"] },
    "Palisade": { motor: "3.8L V6", fuel: "Gasolina", transmission: "Automática 8AT", traction: "FWD / AWD", versions: ["Palisade GL", "Palisade GLS", "Palisade Limited", "Palisade Calligraphy"] },
    "IONIQ 5": { motor: "Motor eléctrico", fuel: "Eléctrico", transmission: "Automática 1AT", traction: "RWD / AWD", versions: ["IONIQ 5 Standard Range", "IONIQ 5 Long Range", "IONIQ 5 N"] },
    "Accent": { motor: "1.4L / 1.6L", fuel: "Gasolina", transmission: "Automática 6AT / Manual 6MT", traction: "FWD", versions: ["Accent GL", "Accent GLS", "Accent Limited"] },
    "Elantra": { motor: "2.0L / 1.6L Turbo", fuel: "Gasolina", transmission: "Automática IVT / DCT 7AT", traction: "FWD", versions: ["Elantra GLS", "Elantra Limited", "Elantra N-Line", "Elantra N"] },
  },

  Nissan: {
    "X-Trail": { motor: "2.5L 4 cilindros", fuel: "Gasolina", transmission: "Automática CVT", traction: "FWD / AWD", versions: ["X-Trail Sense", "X-Trail Advance", "X-Trail Exclusive"] },
    "Kicks": { motor: "1.6L / 1.2L DIG-T", fuel: "Gasolina", transmission: "Automática CVT / Manual", traction: "FWD", versions: ["Kicks Sense", "Kicks Advance", "Kicks Exclusive"] },
    "Frontier": { motor: "2.3L Biturbo Diésel / 3.8L V6", fuel: "Diésel", transmission: "Automática 7AT / Manual 6MT", traction: "RWD / 4WD", versions: ["Frontier XE", "Frontier XL", "Frontier LE", "Frontier PRO-4X"] },
    "Murano": { motor: "3.5L V6", fuel: "Gasolina", transmission: "Automática CVT", traction: "FWD / AWD", versions: ["Murano S", "Murano SV", "Murano SL", "Murano Platinum"] },
    "Armada": { motor: "5.6L V8", fuel: "Gasolina", transmission: "Automática 7AT", traction: "RWD / 4WD", versions: ["Armada S", "Armada SV", "Armada SL", "Armada Platinum"] },
    "Pathfinder": { motor: "3.5L V6", fuel: "Gasolina", transmission: "Automática 9AT", traction: "FWD / 4WD", versions: ["Pathfinder S", "Pathfinder SV", "Pathfinder SL", "Pathfinder Rock Creek"] },
    "Versa": { motor: "1.6L", fuel: "Gasolina", transmission: "Automática CVT / Manual", traction: "FWD", versions: ["Versa Sense", "Versa Advance", "Versa Exclusive"] },
    "Qashqai": { motor: "1.3L DIG-T", fuel: "Gasolina", transmission: "Automática CVT", traction: "FWD / AWD", versions: ["Qashqai Sense", "Qashqai Advance", "Qashqai Exclusive"] },
  },

  Ford: {
    "Explorer": { motor: "2.3L Turbo / 3.0L Turbo", fuel: "Gasolina", transmission: "Automática 10AT", traction: "RWD / AWD", versions: ["Explorer XLT", "Explorer Limited", "Explorer ST", "Explorer Platinum", "Explorer Timberline"] },
    "Ranger": { motor: "2.0L Biturbo Diésel / 2.7L EcoBoost", fuel: "Diésel", transmission: "Automática 10AT / Manual 6MT", traction: "RWD / 4WD", versions: ["Ranger XL", "Ranger XLT", "Ranger Lariat", "Ranger Raptor"] },
    "F-150": { motor: "2.7L / 3.5L EcoBoost / 5.0L V8", fuel: "Gasolina", transmission: "Automática 10AT", traction: "RWD / 4WD", versions: ["F-150 XL", "F-150 XLT", "F-150 Lariat", "F-150 Raptor", "F-150 Tremor"] },
    "Expedition": { motor: "3.5L EcoBoost V6", fuel: "Gasolina", transmission: "Automática 10AT", traction: "RWD / 4WD", versions: ["Expedition XLT", "Expedition Limited", "Expedition Platinum", "Expedition Timberline"] },
    "Escape": { motor: "1.5L EcoBoost / 2.0L EcoBoost", fuel: "Gasolina", transmission: "Automática 8AT", traction: "FWD / AWD", versions: ["Escape S", "Escape SE", "Escape Titanium", "Escape Plug-in Hybrid"] },
    "Bronco": { motor: "2.3L EcoBoost / 2.7L EcoBoost", fuel: "Gasolina", transmission: "Manual 7MT / Automática 10AT", traction: "4WD", versions: ["Bronco Base", "Bronco Big Bend", "Bronco Black Diamond", "Bronco Wildtrak", "Bronco Raptor"] },
    "Mustang": { motor: "2.3L EcoBoost / 5.0L V8", fuel: "Gasolina", transmission: "Automática 10AT / Manual 6MT", traction: "RWD", versions: ["Mustang EcoBoost", "Mustang GT", "Mustang GT500", "Mustang Dark Horse"] },
  },

  Jeep: {
    "Wrangler": { motor: "2.0L Turbo / 3.6L V6 / 4.0L V6 Híbrido", fuel: "Gasolina", transmission: "Automática 8AT / Manual 6MT", traction: "4WD", versions: ["Wrangler Sport", "Wrangler Sahara", "Wrangler Rubicon", "Wrangler 4xe"] },
    "Grand Cherokee": { motor: "3.6L V6 / 5.7L V8 / 4.0L 4xe", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD / 4WD", versions: ["Grand Cherokee Laredo", "Grand Cherokee Limited", "Grand Cherokee Overland", "Grand Cherokee Trailhawk", "Grand Cherokee Summit", "Grand Cherokee 4xe"] },
    "Cherokee": { motor: "2.0L Turbo / 3.2L V6", fuel: "Gasolina", transmission: "Automática 9AT", traction: "FWD / 4WD", versions: ["Cherokee Latitude", "Cherokee Altitude", "Cherokee Limited", "Cherokee Trailhawk"] },
    "Compass": { motor: "1.3L Turbo / 2.4L", fuel: "Gasolina", transmission: "Automática 6AT / DCT 7AT", traction: "FWD / AWD", versions: ["Compass Sport", "Compass Latitude", "Compass Limited", "Compass Trailhawk"] },
    "Renegade": { motor: "1.3L Turbo / 2.4L", fuel: "Gasolina", transmission: "Automática 9AT", traction: "FWD / 4WD", versions: ["Renegade Sport", "Renegade Latitude", "Renegade Limited", "Renegade Trailhawk"] },
    "Gladiator": { motor: "3.6L V6 / 3.0L Diésel EcoDiesel", fuel: "Gasolina", transmission: "Automática 8AT / Manual 6MT", traction: "4WD", versions: ["Gladiator Sport", "Gladiator Overland", "Gladiator Rubicon"] },
  },

  Renault: {
    "Duster": { motor: "1.6L / 2.0L", fuel: "Gasolina", transmission: "Automática / Manual 6MT", traction: "FWD / AWD", versions: ["Duster Intens", "Duster Iconic", "Duster Zen", "Duster Oroch"] },
    "Kwid": { motor: "1.0L", fuel: "Gasolina", transmission: "Automática / Manual 5MT", traction: "FWD", versions: ["Kwid Zen", "Kwid Intens", "Kwid Iconic"] },
    "Sandero": { motor: "1.6L", fuel: "Gasolina", transmission: "Automática / Manual", traction: "FWD", versions: ["Sandero Access", "Sandero Life", "Sandero Stepway"] },
    "Koleos": { motor: "2.5L", fuel: "Gasolina", transmission: "Automática CVT", traction: "FWD / AWD", versions: ["Koleos Zen", "Koleos Bose", "Koleos Iconic"] },
    "Captur": { motor: "1.3L Turbo / 1.6L Híbrido", fuel: "Gasolina", transmission: "Automática DCT / CVT", traction: "FWD", versions: ["Captur Zen", "Captur Intens", "Captur Iconic", "Captur E-Tech"] },
    "Logan": { motor: "1.6L", fuel: "Gasolina", transmission: "Automática / Manual", traction: "FWD", versions: ["Logan Access", "Logan Life", "Logan Zen"] },
  },

  Dodge: {
    "Ram 1500": { motor: "3.6L V6 / 5.7L HEMI V8 / 3.0L EcoDiesel", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD / 4WD", versions: ["Ram 1500 Tradesman", "Ram 1500 Big Horn", "Ram 1500 Rebel", "Ram 1500 Laramie", "Ram 1500 TRX"] },
    "Ram 2500": { motor: "6.4L HEMI V8 / 6.7L Cummins Diésel", fuel: "Gasolina", transmission: "Automática 8AT / Manual 6MT", traction: "RWD / 4WD", versions: ["Ram 2500 Tradesman", "Ram 2500 Big Horn", "Ram 2500 Power Wagon", "Ram 2500 Laramie"] },
    "Durango": { motor: "3.6L V6 / 5.7L HEMI V8", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD / AWD", versions: ["Durango SXT", "Durango GT", "Durango R/T", "Durango SRT 392", "Durango Hellcat"] },
    "Challenger": { motor: "3.6L V6 / 5.7L HEMI V8 / 6.4L SRT V8", fuel: "Gasolina", transmission: "Automática 8AT / Manual 6MT", traction: "RWD", versions: ["Challenger SXT", "Challenger GT", "Challenger R/T", "Challenger Scat Pack", "Challenger Hellcat"] },
    "Charger": { motor: "3.6L V6 / 5.7L HEMI V8 / 6.4L SRT V8", fuel: "Gasolina", transmission: "Automática 8AT", traction: "RWD / AWD", versions: ["Charger SXT", "Charger GT", "Charger R/T", "Charger Scat Pack", "Charger Hellcat"] },
  },

  Honda: {
    "HR-V": { motor: "1.8L / 1.5L Turbo", fuel: "Gasolina", transmission: "Automática CVT / Manual", traction: "FWD / AWD", versions: ["HR-V LX", "HR-V Sport", "HR-V EX", "HR-V EX-L", "HR-V Touring"] },
    "CR-V": { motor: "1.5L Turbo / 2.0L Híbrido", fuel: "Gasolina", transmission: "Automática CVT", traction: "FWD / AWD", versions: ["CR-V LX", "CR-V Sport", "CR-V EX", "CR-V EX-L", "CR-V Touring"] },
    "Pilot": { motor: "3.5L V6", fuel: "Gasolina", transmission: "Automática 9AT", traction: "FWD / AWD", versions: ["Pilot Sport", "Pilot EX-L", "Pilot TrailSport", "Pilot Elite"] },
    "Civic": { motor: "1.5L Turbo / 2.0L", fuel: "Gasolina", transmission: "Automática CVT / Manual 6MT", traction: "FWD", versions: ["Civic LX", "Civic Sport", "Civic EX", "Civic EX-L", "Civic Si", "Civic Type R"] },
    "Accord": { motor: "1.5L Turbo / 2.0L Turbo / 2.0L Híbrido", fuel: "Gasolina", transmission: "Automática CVT / 10AT", traction: "FWD", versions: ["Accord LX", "Accord Sport", "Accord EX-L", "Accord Touring"] },
    "Ridgeline": { motor: "3.5L V6", fuel: "Gasolina", transmission: "Automática 9AT", traction: "FWD / AWD", versions: ["Ridgeline Sport", "Ridgeline RTL", "Ridgeline RTL-E", "Ridgeline Black Edition"] },
  },

  Mitsubishi: {
    "Outlander": { motor: "2.5L / 2.4L PHEV", fuel: "Gasolina", transmission: "Automática CVT / Automática", traction: "FWD / S-AWC AWD", versions: ["Outlander ES", "Outlander SE", "Outlander SEL", "Outlander PHEV"] },
    "Eclipse Cross": { motor: "1.5L Turbo / 2.4L PHEV", fuel: "Gasolina", transmission: "Automática CVT / Automática", traction: "FWD / S-AWC AWD", versions: ["Eclipse Cross ES", "Eclipse Cross SE", "Eclipse Cross SEL", "Eclipse Cross PHEV"] },
    "Montero Sport": { motor: "3.0L V6 / 2.4L Diésel", fuel: "Gasolina", transmission: "Automática 5AT / Manual", traction: "4WD", versions: ["Montero Sport GLX", "Montero Sport GLS", "Montero Sport GT"] },
    "L200 Triton": { motor: "2.4L MIVEC Diésel / 2.5L Diésel", fuel: "Diésel", transmission: "Automática 6AT / Manual 6MT", traction: "RWD / 4WD", versions: ["L200 Triton GLX", "L200 Triton GLS", "L200 Triton GL"] },
  },

  Subaru: {
    "Forester": { motor: "2.5L Boxer / 2.0L Boxer Turbo", fuel: "Gasolina", transmission: "Automática Lineartronic CVT", traction: "Symmetrical AWD", versions: ["Forester Base", "Forester Premium", "Forester Sport", "Forester Limited", "Forester Touring"] },
    "Outback": { motor: "2.5L Boxer / 2.4L Boxer Turbo", fuel: "Gasolina", transmission: "Automática Lineartronic CVT", traction: "Symmetrical AWD", versions: ["Outback Base", "Outback Premium", "Outback Onyx XT", "Outback Touring XT"] },
    "Crosstrek": { motor: "2.0L / 2.5L Boxer / PHEV", fuel: "Gasolina", transmission: "Automática Lineartronic CVT / Manual 6MT", traction: "Symmetrical AWD", versions: ["Crosstrek Base", "Crosstrek Premium", "Crosstrek Sport", "Crosstrek Limited"] },
    "Impreza": { motor: "2.0L Boxer", fuel: "Gasolina", transmission: "Automática Lineartronic CVT / Manual", traction: "Symmetrical AWD", versions: ["Impreza Base", "Impreza Premium", "Impreza Sport", "Impreza Limited"] },
    "WRX": { motor: "2.4L Boxer Turbo", fuel: "Gasolina", transmission: "Manual 6MT / Automática CVT", traction: "Symmetrical AWD", versions: ["WRX Base", "WRX Premium", "WRX TR", "WRX GT"] },
    "BRZ": { motor: "2.4L Boxer", fuel: "Gasolina", transmission: "Manual 6MT / Automática 6AT", traction: "RWD", versions: ["BRZ Premium", "BRZ Limited"] },
  },
};

export const BRAND_NAMES = Object.keys(CAR_CATALOG).sort();

export function getLinesForBrand(brand: string): string[] {
  return Object.keys(CAR_CATALOG[brand] ?? {}).sort();
}

export function getSpecsForLine(brand: string, line: string): LineSpec | null {
  return CAR_CATALOG[brand]?.[line] ?? null;
}

export function getVersionsForLine(brand: string, line: string): string[] {
  return CAR_CATALOG[brand]?.[line]?.versions ?? [];
}
