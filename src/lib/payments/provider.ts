export type ChargeInput = {
  amount: number;
  currency: "PEN";
  reservationCode: string;
  description: string;
};

export type ChargeResult =
  | { success: true; reference: string }
  | { success: false; errorMessage: string };

export interface PaymentProvider {
  readonly id: string;
  charge(input: ChargeInput): Promise<ChargeResult>;
  refund(reference: string): Promise<ChargeResult>;
}
