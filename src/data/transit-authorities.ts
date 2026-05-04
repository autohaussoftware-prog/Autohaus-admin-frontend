export type TransitAuthority = {
  name: string;
  city: string;
  department: string;
};

export const TRANSIT_AUTHORITIES: TransitAuthority[] = [
  // ── Antioquia ──────────────────────────────────────────────────
  { name: "Secretaría de Movilidad de Medellín", city: "Medellín", department: "Antioquia" },
  { name: "Secretaría de Tránsito y Transporte de Envigado", city: "Envigado", department: "Antioquia" },
  { name: "Secretaría de Movilidad de Itagüí", city: "Itagüí", department: "Antioquia" },
  { name: "Secretaría de Movilidad de Bello", city: "Bello", department: "Antioquia" },
  { name: "Secretaría de Movilidad de Sabaneta", city: "Sabaneta", department: "Antioquia" },
  { name: "Secretaría de Tránsito de Caldas", city: "Caldas", department: "Antioquia" },
  { name: "Secretaría de Tránsito de La Estrella", city: "La Estrella", department: "Antioquia" },
  { name: "Secretaría de Movilidad de Copacabana", city: "Copacabana", department: "Antioquia" },
  { name: "Secretaría de Movilidad de Girardota", city: "Girardota", department: "Antioquia" },
  { name: "Secretaría de Movilidad de Barbosa", city: "Barbosa", department: "Antioquia" },
  { name: "INTT Rionegro", city: "Rionegro", department: "Antioquia" },
  { name: "Secretaría de Tránsito de Marinilla", city: "Marinilla", department: "Antioquia" },
  { name: "Secretaría de Tránsito de El Carmen de Viboral", city: "El Carmen de Viboral", department: "Antioquia" },
  { name: "Secretaría de Tránsito de Apartadó", city: "Apartadó", department: "Antioquia" },
  { name: "Secretaría de Tránsito de Turbo", city: "Turbo", department: "Antioquia" },
  { name: "Secretaría de Tránsito de Caucasia", city: "Caucasia", department: "Antioquia" },
  // ── Bogotá D.C. ────────────────────────────────────────────────
  { name: "Secretaría Distrital de Movilidad de Bogotá", city: "Bogotá", department: "Bogotá D.C." },
  // ── Valle del Cauca ────────────────────────────────────────────
  { name: "Secretaría de Movilidad de Cali", city: "Cali", department: "Valle del Cauca" },
  { name: "Secretaría de Tránsito de Buenaventura", city: "Buenaventura", department: "Valle del Cauca" },
  { name: "Secretaría de Tránsito de Tuluá", city: "Tuluá", department: "Valle del Cauca" },
  { name: "Secretaría de Tránsito de Palmira", city: "Palmira", department: "Valle del Cauca" },
  { name: "Secretaría de Tránsito de Buga", city: "Buga", department: "Valle del Cauca" },
  { name: "Secretaría de Tránsito de Cartago", city: "Cartago", department: "Valle del Cauca" },
  { name: "Secretaría de Tránsito de Jamundí", city: "Jamundí", department: "Valle del Cauca" },
  { name: "Secretaría de Tránsito de Yumbo", city: "Yumbo", department: "Valle del Cauca" },
  { name: "Secretaría de Tránsito de Candelaria", city: "Candelaria", department: "Valle del Cauca" },
  // ── Atlántico ──────────────────────────────────────────────────
  { name: "Instituto de Tránsito del Atlántico (INTRA)", city: "Barranquilla", department: "Atlántico" },
  { name: "Secretaría de Tránsito de Soledad", city: "Soledad", department: "Atlántico" },
  { name: "Secretaría de Tránsito de Malambo", city: "Malambo", department: "Atlántico" },
  // ── Bolívar ────────────────────────────────────────────────────
  { name: "SETRAN Cartagena", city: "Cartagena", department: "Bolívar" },
  { name: "Secretaría de Tránsito de Turbaco", city: "Turbaco", department: "Bolívar" },
  // ── Santander ──────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Bucaramanga", city: "Bucaramanga", department: "Santander" },
  { name: "Secretaría de Tránsito de Girón", city: "Girón", department: "Santander" },
  { name: "Secretaría de Tránsito de Floridablanca", city: "Floridablanca", department: "Santander" },
  { name: "Secretaría de Tránsito de Piedecuesta", city: "Piedecuesta", department: "Santander" },
  { name: "Secretaría de Tránsito de Barrancabermeja", city: "Barrancabermeja", department: "Santander" },
  // ── Cundinamarca ───────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Soacha", city: "Soacha", department: "Cundinamarca" },
  { name: "Secretaría de Tránsito de Facatativá", city: "Facatativá", department: "Cundinamarca" },
  { name: "Secretaría de Tránsito de Zipaquirá", city: "Zipaquirá", department: "Cundinamarca" },
  { name: "Secretaría de Tránsito de Chía", city: "Chía", department: "Cundinamarca" },
  { name: "Secretaría de Tránsito de Cajicá", city: "Cajicá", department: "Cundinamarca" },
  { name: "Secretaría de Tránsito de Mosquera", city: "Mosquera", department: "Cundinamarca" },
  { name: "Secretaría de Tránsito de Madrid", city: "Madrid", department: "Cundinamarca" },
  { name: "Secretaría de Tránsito de Funza", city: "Funza", department: "Cundinamarca" },
  { name: "Secretaría de Tránsito de Fusagasugá", city: "Fusagasugá", department: "Cundinamarca" },
  { name: "Secretaría de Tránsito de Girardot", city: "Girardot", department: "Cundinamarca" },
  // ── Caldas ─────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Manizales", city: "Manizales", department: "Caldas" },
  // ── Risaralda ──────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Pereira", city: "Pereira", department: "Risaralda" },
  { name: "Secretaría de Tránsito de Dosquebradas", city: "Dosquebradas", department: "Risaralda" },
  // ── Quindío ────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Armenia", city: "Armenia", department: "Quindío" },
  // ── Huila ──────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Neiva", city: "Neiva", department: "Huila" },
  // ── Tolima ─────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Ibagué", city: "Ibagué", department: "Tolima" },
  // ── Nariño ─────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Pasto", city: "Pasto", department: "Nariño" },
  // ── Córdoba ────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Montería", city: "Montería", department: "Córdoba" },
  // ── Cauca ──────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Popayán", city: "Popayán", department: "Cauca" },
  // ── Boyacá ─────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Tunja", city: "Tunja", department: "Boyacá" },
  { name: "Secretaría de Tránsito de Duitama", city: "Duitama", department: "Boyacá" },
  { name: "Secretaría de Tránsito de Sogamoso", city: "Sogamoso", department: "Boyacá" },
  // ── Norte de Santander ─────────────────────────────────────────
  { name: "Secretaría de Tránsito de Cúcuta", city: "Cúcuta", department: "Norte de Santander" },
  { name: "Secretaría de Tránsito de Ocaña", city: "Ocaña", department: "Norte de Santander" },
  // ── Meta ───────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Villavicencio", city: "Villavicencio", department: "Meta" },
  // ── César ──────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Valledupar", city: "Valledupar", department: "César" },
  // ── Sucre ──────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Sincelejo", city: "Sincelejo", department: "Sucre" },
  // ── Magdalena ──────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Santa Marta", city: "Santa Marta", department: "Magdalena" },
  // ── La Guajira ─────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Riohacha", city: "Riohacha", department: "La Guajira" },
  // ── Chocó ──────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Quibdó", city: "Quibdó", department: "Chocó" },
  // ── Arauca ─────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Arauca", city: "Arauca", department: "Arauca" },
  // ── Casanare ───────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Yopal", city: "Yopal", department: "Casanare" },
  // ── Caquetá ────────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Florencia", city: "Florencia", department: "Caquetá" },
  // ── Putumayo ───────────────────────────────────────────────────
  { name: "Secretaría de Tránsito de Mocoa", city: "Mocoa", department: "Putumayo" },
];

export function searchTransitAuthorities(query: string): TransitAuthority[] {
  if (!query.trim()) return TRANSIT_AUTHORITIES;
  const q = query.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return TRANSIT_AUTHORITIES.filter((a) => {
    const haystack = `${a.name} ${a.city} ${a.department}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
    return haystack.includes(q);
  });
}
