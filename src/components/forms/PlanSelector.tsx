import { Label } from "@/components/ui/label";
import { AsyncCombobox } from "@/components/forms/AsyncCombobox";

interface PlanSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function PlanSelector({ value, onChange }: PlanSelectorProps) {
  return (
    <div>
      <Label>Plano</Label>
      <AsyncCombobox
        endpoint="/plans"
        value={value}
        onChange={onChange}
        placeholder="Selecione um plano"
        searchPlaceholder="Pesquisar plano..."
        mapOption={(item) => ({
          value: String(item.id || ""),
          label: `${String(item.name || "")} - R$ ${Number(item.price || 0).toFixed(2)} (${Number(item.monthlyCheckinLimit || 0)} check-ins/mês)`,
          meta: item,
        })}
      />
    </div>
  );
}

