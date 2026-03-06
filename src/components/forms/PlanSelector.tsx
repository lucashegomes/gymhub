import type { Plan } from "@/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlanSelectorProps {
  value?: string;
  plans: Plan[];
  onChange: (value: string) => void;
}

export function PlanSelector({ value, plans, onChange }: PlanSelectorProps) {
  return (
    <div>
      <Label>Plano</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um plano ativo" />
        </SelectTrigger>
        <SelectContent>
          {plans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              {plan.name} - R$ {Number(plan.price).toFixed(2)} ({plan.monthlyCheckinLimit} check-ins/mês)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

