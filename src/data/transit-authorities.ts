export type TransitAuthority = {
  name: string;
  department: string;
};

export const TRANSIT_AUTHORITIES: TransitAuthority[] = [
  // Antioquia
  { name: "Medellin", department: "Antioquia" },
  { name: "Bello", department: "Antioquia" },
  { name: "Itagui", department: "Antioquia" },
  { name: "Envigado", department: "Antioquia" },
  { name: "Sabaneta", department: "Antioquia" },
  { name: "La Estrella", department: "Antioquia" },
  { name: "Caldas", department: "Antioquia" },
  { name: "Copacabana", department: "Antioquia" },
  { name: "Girardota", department: "Antioquia" },
  { name: "Barbosa", department: "Antioquia" },
  { name: "Rionegro", department: "Antioquia" },
  { name: "Marinilla", department: "Antioquia" },
  { name: "El Carmen de Viboral", department: "Antioquia" },
  { name: "La Ceja", department: "Antioquia" },
  { name: "Guarne", department: "Antioquia" },
  { name: "El Retiro", department: "Antioquia" },
  { name: "Caucasia", department: "Antioquia" },
  { name: "Turbo", department: "Antioquia" },
  { name: "Yarumal", department: "Antioquia" },
  { name: "Santa Rosa de Osos", department: "Antioquia" },
  { name: "Apartado", department: "Antioquia" },
  { name: "Chigorodo", department: "Antioquia" },
  { name: "Andes", department: "Antioquia" },
  { name: "Jerico", department: "Antioquia" },
  { name: "Puerto Berrio", department: "Antioquia" },
  // Bogota D.C.
  { name: "Bogota", department: "Bogota D.C." },
  // Valle del Cauca
  { name: "Cali", department: "Valle del Cauca" },
  { name: "Palmira", department: "Valle del Cauca" },
  { name: "Buenaventura", department: "Valle del Cauca" },
  { name: "Tulua", department: "Valle del Cauca" },
  { name: "Cartago", department: "Valle del Cauca" },
  { name: "Buga", department: "Valle del Cauca" },
  { name: "Jamundi", department: "Valle del Cauca" },
  { name: "Yumbo", department: "Valle del Cauca" },
  { name: "Candelaria", department: "Valle del Cauca" },
  { name: "Caicedonia", department: "Valle del Cauca" },
  // Atlantico
  { name: "Barranquilla", department: "Atlantico" },
  { name: "Soledad", department: "Atlantico" },
  { name: "Malambo", department: "Atlantico" },
  { name: "Sabanalarga", department: "Atlantico" },
  { name: "Baranoa", department: "Atlantico" },
  // Bolivar
  { name: "Cartagena", department: "Bolivar" },
  { name: "Magangue", department: "Bolivar" },
  { name: "El Carmen de Bolivar", department: "Bolivar" },
  { name: "Mompos", department: "Bolivar" },
  // Santander
  { name: "Bucaramanga", department: "Santander" },
  { name: "Floridablanca", department: "Santander" },
  { name: "Giron", department: "Santander" },
  { name: "Piedecuesta", department: "Santander" },
  { name: "Barrancabermeja", department: "Santander" },
  { name: "Socorro", department: "Santander" },
  { name: "San Gil", department: "Santander" },
  // Cundinamarca
  { name: "Soacha", department: "Cundinamarca" },
  { name: "Fusagasuga", department: "Cundinamarca" },
  { name: "Facatativa", department: "Cundinamarca" },
  { name: "Zipaquira", department: "Cundinamarca" },
  { name: "Chia", department: "Cundinamarca" },
  { name: "Cajica", department: "Cundinamarca" },
  { name: "Mosquera", department: "Cundinamarca" },
  { name: "Madrid", department: "Cundinamarca" },
  { name: "Funza", department: "Cundinamarca" },
  { name: "Girardot", department: "Cundinamarca" },
  { name: "Villeta", department: "Cundinamarca" },
  { name: "La Mesa", department: "Cundinamarca" },
  // Caldas
  { name: "Manizales", department: "Caldas" },
  { name: "Chinchina", department: "Caldas" },
  { name: "Riosucio", department: "Caldas" },
  { name: "Villamaria", department: "Caldas" },
  { name: "La Dorada", department: "Caldas" },
  // Risaralda
  { name: "Pereira", department: "Risaralda" },
  { name: "Dosquebradas", department: "Risaralda" },
  { name: "Santa Rosa de Cabal", department: "Risaralda" },
  { name: "La Virginia", department: "Risaralda" },
  // Quindio
  { name: "Armenia", department: "Quindio" },
  { name: "Montenegro", department: "Quindio" },
  { name: "Calarca", department: "Quindio" },
  { name: "Quimbaya", department: "Quindio" },
  // Huila
  { name: "Neiva", department: "Huila" },
  { name: "Pitalito", department: "Huila" },
  { name: "Garzon", department: "Huila" },
  { name: "La Plata", department: "Huila" },
  // Tolima
  { name: "Ibague", department: "Tolima" },
  { name: "Espinal", department: "Tolima" },
  { name: "Honda", department: "Tolima" },
  { name: "Libano", department: "Tolima" },
  { name: "Chaparral", department: "Tolima" },
  // Narino
  { name: "Pasto", department: "Narino" },
  { name: "Tumaco", department: "Narino" },
  { name: "Ipiales", department: "Narino" },
  { name: "Tuquerres", department: "Narino" },
  // Cordoba
  { name: "Monteria", department: "Cordoba" },
  { name: "Cerete", department: "Cordoba" },
  { name: "Lorica", department: "Cordoba" },
  { name: "Sahagún", department: "Cordoba" },
  // Cauca
  { name: "Popayan", department: "Cauca" },
  { name: "Santander de Quilichao", department: "Cauca" },
  { name: "Puerto Tejada", department: "Cauca" },
  // Boyaca
  { name: "Tunja", department: "Boyaca" },
  { name: "Duitama", department: "Boyaca" },
  { name: "Sogamoso", department: "Boyaca" },
  { name: "Chiquinquira", department: "Boyaca" },
  // Norte de Santander
  { name: "Cucuta", department: "Norte de Santander" },
  { name: "Ocana", department: "Norte de Santander" },
  { name: "Pamplona", department: "Norte de Santander" },
  { name: "Villa del Rosario", department: "Norte de Santander" },
  // Meta
  { name: "Villavicencio", department: "Meta" },
  { name: "Acacias", department: "Meta" },
  { name: "Granada", department: "Meta" },
  // Cesar
  { name: "Valledupar", department: "Cesar" },
  { name: "Aguachica", department: "Cesar" },
  { name: "Bosconia", department: "Cesar" },
  // Sucre
  { name: "Sincelejo", department: "Sucre" },
  { name: "Corozal", department: "Sucre" },
  // Magdalena
  { name: "Santa Marta", department: "Magdalena" },
  { name: "Cienaga", department: "Magdalena" },
  { name: "Fundacion", department: "Magdalena" },
  // La Guajira
  { name: "Riohacha", department: "La Guajira" },
  { name: "Maicao", department: "La Guajira" },
  // Choco
  { name: "Quibdo", department: "Choco" },
  // Arauca
  { name: "Arauca", department: "Arauca" },
  // Casanare
  { name: "Yopal", department: "Casanare" },
  // Caqueta
  { name: "Florencia", department: "Caqueta" },
  // Putumayo
  { name: "Mocoa", department: "Putumayo" },
  // Amazonas
  { name: "Leticia", department: "Amazonas" },
  // Vichada
  { name: "Puerto Carreno", department: "Vichada" },
  // Guainia
  { name: "Inirida", department: "Guainia" },
  // Vaupes
  { name: "Mitu", department: "Vaupes" },
  // Guaviare
  { name: "San Jose del Guaviare", department: "Guaviare" },
];

const STRIP_DIACRITICS = /[̀-ͯ]/g;

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(STRIP_DIACRITICS, "");
}

export function searchTransitAuthorities(query: string): TransitAuthority[] {
  if (!query.trim()) return TRANSIT_AUTHORITIES.slice(0, 12);
  const q = norm(query);
  return TRANSIT_AUTHORITIES
    .filter((a) => norm(a.name).includes(q) || norm(a.department).includes(q))
    .slice(0, 12);
}
