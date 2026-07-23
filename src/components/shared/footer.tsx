import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>
          <span className="font-display font-semibold text-foreground">LlamaEats</span> — reservas
          de mesa en Puno, Perú.
        </p>
        <div className="flex gap-4">
          <Link href="/buscar" className="hover:text-foreground">
            Buscar restaurantes
          </Link>
          <Link href="/iniciar-sesion" className="hover:text-foreground">
            Soy un restaurante
          </Link>
        </div>
      </div>
    </footer>
  );
}
