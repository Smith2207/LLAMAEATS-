"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Building2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { completeOnboardingAction } from "@/actions/users/complete-onboarding";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";

export function OnboardingForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { role: "cliente", phone: "" },
  });

  const { execute, isExecuting } = useAction(completeOnboardingAction, {
    onSuccess({ data }) {
      toast.success("¡Cuenta lista!");
      router.push(data?.redirectTo ?? "/dashboard");
      router.refresh();
    },
    onError({ error }) {
      toast.error(error.serverError ?? "No se pudo completar el registro.");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => execute(values))}
      className="glass rounded-2xl p-6"
    >
      <FieldGroup>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Field>
              <FieldLabel>Quiero usar LlamaEats como</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <RoleOption
                  label="Cliente"
                  description="Buscar y reservar mesa"
                  icon={UtensilsCrossed}
                  selected={field.value === "cliente"}
                  onSelect={() => field.onChange("cliente")}
                />
                <RoleOption
                  label="Restaurante"
                  description="Gestionar mi local"
                  icon={Building2}
                  selected={field.value === "restaurante"}
                  onSelect={() => field.onChange("restaurante")}
                />
              </div>
              <FieldError errors={[errors.role]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
              <Input
                id="phone"
                type="tel"
                placeholder="+51 9XX XXX XXX"
                {...field}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
          )}
        />

        <Button type="submit" disabled={isExecuting} className="w-full" size="lg">
          {isExecuting ? "Guardando..." : "Continuar"}
        </Button>
      </FieldGroup>
    </form>
  );
}

function RoleOption({
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-transparent hover:border-primary/50",
      )}
    >
      <Icon className={cn("size-5", selected ? "text-primary" : "text-muted-foreground")} />
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}
