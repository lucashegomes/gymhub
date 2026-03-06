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
  token: z.string().min(10),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { token: "", password: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      const response = await authService.resetPassword(values.token, values.password);
      alert(response.message);
      navigate('/auth/login');
    } catch (error) {
      console.error(error);
      alert('Erro ao redefinir senha');
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label>Token</Label>
              <Input {...form.register("token")} />
            </div>
            <div>
              <Label>Nova senha</Label>
              <Input type="password" {...form.register("password")} />
            </div>
            <Button type="submit" className="w-full">Salvar nova senha</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
