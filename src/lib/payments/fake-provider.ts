import type { ChargeInput, ChargeResult, PaymentProvider } from "./provider";

// Driver simulado: siempre aprueba (sin credenciales reales), pero respeta
// la misma interfaz que usarían Culqi o Mercado Pago en producción.
export class FakeProvider implements PaymentProvider {
  readonly id = "fake";

  async charge(input: ChargeInput): Promise<ChargeResult> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      success: true,
      reference: `FAKE-${input.reservationCode}-${Date.now()}`,
    };
  }

  async refund(reference: string): Promise<ChargeResult> {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true, reference: `REFUND-${reference}` };
  }
}
