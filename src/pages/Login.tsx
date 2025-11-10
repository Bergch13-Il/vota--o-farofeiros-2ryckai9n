import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signIn, signUp } = useAuth()

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast({
        title: 'Erro no login',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Login bem-sucedido!',
        description: 'Bem-vindo de volta!',
      })
      navigate('/')
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      toast({
        title: 'Erro no cadastro',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Cadastro realizado!',
        description: 'Verifique seu e-mail para confirmação.',
      })
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Tabs defaultValue="login" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Cadastrar</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Entrar</CardTitle>
              <CardDescription>Acesse sua conta para votar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input
                  id="email-login"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">Senha</Label>
                <Input
                  id="password-login"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar</CardTitle>
              <CardDescription>
                Crie uma conta para participar da votação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Senha</Label>
                <Input
                  id="password-signup"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LoginPage
