import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Student } from "@/types";

interface GuardianSelectorProps {
  value: string[];
  options: Student[];
  onChange: (value: string[]) => void;
}

export function GuardianSelector({ value, options, onChange }: GuardianSelectorProps) {
  const toggle = (studentId: string) => {
    if (value.includes(studentId)) {
      onChange(value.filter((id) => id !== studentId));
      return;
    }
    onChange([...value, studentId]);
  };

  return (
    <div className="space-y-2">
      <Label>Responsáveis (maiores de 18 anos)</Label>
      <div className="max-h-40 overflow-auto rounded-md border p-3 space-y-2">
        {options.map((student) => (
          <label key={student.id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={value.includes(student.id)} onCheckedChange={() => toggle(student.id)} />
            <span>{student.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

