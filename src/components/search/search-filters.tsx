"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PUNO_DISTRICTS,
  RESTAURANT_CATEGORIES,
  TIME_SLOT_OPTIONS,
} from "@/lib/constants";

const ANY = "cualquiera";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") ?? ANY);
  const [district, setDistrict] = useState(searchParams.get("district") ?? ANY);
  const [date, setDate] = useState(searchParams.get("date") ?? "");
  const [timeSlot, setTimeSlot] = useState(searchParams.get("timeSlot") ?? ANY);
  const [guests, setGuests] = useState(searchParams.get("guests") ?? "2");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category !== ANY) params.set("category", category);
    if (district !== ANY) params.set("district", district);
    if (date) params.set("date", date);
    if (timeSlot !== ANY) params.set("timeSlot", timeSlot);
    if (guests) params.set("guests", guests);
    router.push(`/buscar?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass grid grid-cols-2 gap-3 rounded-2xl p-4 sm:grid-cols-3 lg:grid-cols-6 lg:items-end"
    >
      <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
        <label className="text-xs font-medium text-muted-foreground">Categoría</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Todas</SelectItem>
            {RESTAURANT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Distrito</label>
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Todos</SelectItem>
            {PUNO_DISTRICTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Fecha</label>
        <Input
          type="date"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Hora</label>
        <Select value={timeSlot} onValueChange={setTimeSlot}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Cualquiera</SelectItem>
            {TIME_SLOT_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Personas</label>
        <Input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
        />
      </div>

      <Button type="submit" className="col-span-2 gap-2 sm:col-span-1">
        <Search className="size-4" />
        Buscar
      </Button>
    </form>
  );
}
