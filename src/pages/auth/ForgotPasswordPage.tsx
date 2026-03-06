import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  identifier: z.string().min(3),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [generatedToken, setGeneratedToken] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      const response = await authService.requestPasswordReset(values.identifier);
      if (response.resetToken) {
        setGeneratedToken(response.resetToken);
      }
      alert(response.message);
    } catch (error) {
      console.error(error);
      alert("Erro ao solicitar reset");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label>Email ou CPF</Label>
              <Input {...form.register("identifier")} />
            </div>

            <Button type="submit" className="w-full">Gerar token</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/auth/reset-password')}>
              Ir para redefinição
            </Button>

            {generatedToken ? (
              <div className="rounded border p-3 text-xs">
                <p className="font-semibold">Token gerado (ambiente dev):</p>
                <p className="break-all">{generatedToken}</p>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
