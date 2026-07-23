// Drizzle envuelve el error real del driver dentro de `.cause` (confirmado
// empíricamente: `db.insert(...)` fuera Y dentro de `db.transaction()`
// arma su propio `.code`/`.constraint` como `undefined` en el nivel
// superior). Sin este helper, el catch de "23505" nunca disparaba en
// producción — la protección contra doble reserva en la base de datos
// siempre funcionó, pero el mensaje amigable al usuario nunca se activaba.
export function getPgErrorCode(error: unknown): string | undefined {
  const err = error as { code?: string; cause?: { code?: string } };
  return err?.code ?? err?.cause?.code;
}

export function getPgErrorConstraint(error: unknown): string | undefined {
  const err = error as { constraint?: string; cause?: { constraint?: string } };
  return err?.constraint ?? err?.cause?.constraint;
}
