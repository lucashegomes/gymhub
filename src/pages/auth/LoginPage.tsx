import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  identifier: z.string().min(3, "Informe e-mail ou CPF"),
  password: z.string().min(1, "Informe a senha"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await login(values.identifier, values.password);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Falha no login. Verifique credenciais.");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar no GymHub</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label>Email ou CPF</Label>
              <Input {...form.register("identifier")} />
              <p className="text-xs text-destructive">{form.formState.errors.identifier?.message}</p>
            </div>

            <div>
              <Label>Senha</Label>
              <Input type="password" {...form.register("password")} />
              <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
            </div>

            <Button type="submit" className="w-full">Entrar</Button>
            <Button type="button" variant="link" className="w-full" onClick={() => navigate('/auth/forgot-password')}>
              Esqueci minha senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
