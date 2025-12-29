import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AuthPage() {
  const { user, isLoading, signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = useMemo(() => searchParams.get('redirect') || '/', [searchParams]);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error('Erro ao fazer login: ' + error.message);
    }
  };

  const handleEmailAuth = async () => {
    const cleanedEmail = email.trim();
    if (!cleanedEmail || !password) {
      toast.error('Informe email e senha.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      toast.error('As senhas não conferem.');
      return;
    }

    setIsSubmitting(true);
    const { error } =
      mode === 'signin'
        ? await signInWithEmailPassword(cleanedEmail, password)
        : await signUpWithEmailPassword(cleanedEmail, password, fullName.trim() || undefined);
    setIsSubmitting(false);

    if (error) {
      toast.error('Erro: ' + error.message);
      return;
    }

    if (mode === 'signup') {
      toast.success('Conta criada! Você já pode entrar.');
      setMode('signin');
      return;
    }

    toast.success('Login realizado!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src="https://www.balao.info/media/wysiwyg/balao500.png"
            alt="Balão da Informática"
            className="h-16 mx-auto mb-4"
          />
          <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
          <CardDescription>
            Faça login para acompanhar seus pedidos e ter acesso exclusivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="email">Email/Senha</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4 mt-4">
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-12 text-base gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </Button>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={mode === 'signin' ? 'default' : 'secondary'}
                  className="flex-1"
                  onClick={() => setMode('signin')}
                >
                  Entrar
                </Button>
                <Button
                  type="button"
                  variant={mode === 'signup' ? 'default' : 'secondary'}
                  className="flex-1"
                  onClick={() => setMode('signup')}
                >
                  Criar conta
                </Button>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label>Nome (opcional)</Label>
                  <Input
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label>Confirmar senha</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              <Button onClick={handleEmailAuth} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
              </Button>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
