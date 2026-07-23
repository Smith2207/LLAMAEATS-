import { FakeProvider } from "./fake-provider";
import type { PaymentProvider } from "./provider";

const providers: Record<string, () => PaymentProvider> = {
  fake: () => new FakeProvider(),
  // culqi: () => new CulqiProvider(...),
  // mercadopago: () => new MercadoPagoProvider(...),
};

export function getPaymentProvider(): PaymentProvider {
  const id = process.env.PAYMENT_PROVIDER ?? "fake";
  const factory = providers[id];
  if (!factory) {
    throw new Error(`Proveedor de pago desconocido: ${id}`);
  }
  return factory();
}

export type { ChargeInput, ChargeResult, PaymentProvider } from "./provider";
