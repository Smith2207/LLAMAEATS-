import Link from "next/link";

const LINK_COLUMNS = [
  {
    heading: "Plataforma",
    links: [
      { href: "/buscar", label: "Buscar restaurantes" },
      { href: "/para-restaurantes", label: "Soy un restaurante" },
    ],
  },
  {
    heading: "Ayuda",
    links: [
      { href: "/nosotros", label: "Quiénes somos" },
      { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terminos", label: "Términos de servicio" },
      { href: "/privacidad", label: "Privacidad" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-display font-semibold text-foreground">LlamaEats</span>
          <br />
          Reservas de mesa en Puno, Perú.
        </p>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {LINK_COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                {column.heading}
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
