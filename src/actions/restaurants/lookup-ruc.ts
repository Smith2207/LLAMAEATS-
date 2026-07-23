"use server";

import { roleActionClient } from "@/lib/actions/safe-action";
import { rucLookupSchema } from "@/lib/validations/restaurant";
import { lookupRuc } from "@/lib/ruc/lookup";

export const lookupRucAction = roleActionClient("restaurante")
  .inputSchema(rucLookupSchema)
  .action(async ({ parsedInput }) => {
    const result = await lookupRuc(parsedInput.ruc);
    if (!result) {
      return { found: false as const };
    }
    return { found: true as const, ...result };
  });
