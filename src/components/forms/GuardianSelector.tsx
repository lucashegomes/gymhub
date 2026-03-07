import { Label } from "@/components/ui/label";
import { AsyncMultiCombobox } from "@/components/forms/AsyncCombobox";

interface GuardianSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function GuardianSelector({ value, onChange }: GuardianSelectorProps) {
  return (
    <div>
      <Label>Responsáveis (maiores de 18 anos)</Label>
      <AsyncMultiCombobox
        endpoint="/students?adultOnly=1"
        value={value}
        onChange={onChange}
        placeholder="Pesquisar e selecionar responsáveis"
        searchPlaceholder="Pesquisar responsável por nome..."
        mapOption={(item) => ({
          value: String(item.id || ""),
          label: `${String(item.name || "")} (${String(item.cpf || "")})`,
          meta: item,
        })}
      />
    </div>
  );
}
