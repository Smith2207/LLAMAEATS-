"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function DateFilterInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();

  return (
    <Input
      type="date"
      defaultValue={defaultValue}
      className="w-fit"
      onChange={(e) => router.push(`/restaurante/reservas?date=${e.target.value}`)}
    />
  );
}
