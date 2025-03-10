
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { Ambulance, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  // Clear form fields when switching between login and register
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'login') {
      await login(email, password);
    } else {
      await register(name, email, password, phone);
    }
  };

  // List of demo accounts for easy access
  const demoAccounts = [
    { role: 'Admin', username: 'admin@swiftaid.com', password: 'admin123' },
    { role: 'Driver', username: 'driver1@swiftaid.com', password: 'driver123' },
    { role: 'Driver', username: 'driver2@swiftaid.com', password: 'driver123' },
    { role: 'User', username: 'user@swiftaid.com', password: 'user123' }
  ];

  const setDemoAccount = (username: string, password: string) => {
    setEmail(username);
    setPassword(password);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="glass-card animate-scale">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Ambulance className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'login'
              ? 'Enter your credentials to access your account'
              : 'Fill in your details to create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Saumu Kadilo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="glass-input"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">{mode === 'login' ? 'Email' : 'Email'}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-input"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === 'login' && (
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass-input"
              />
            </div>
            
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(254)0742650817"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'}</>
              )}
            </Button>
          </form>
          
          {mode === 'login' && (
            <div className="mt-4 p-3 border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 rounded-md">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-amber-700 dark:text-amber-500 mr-2 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-400">
                  For this school project, email verification is required. After registration, please check your email 
                  and click the verification link before you can login. You can also use one of the demo accounts below.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <a
                  onClick={() => navigate('/register')}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Sign up
                </a>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <a
                  onClick={() => navigate('/login')}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Sign in
                </a>
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      {mode === 'login' && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemoAccount('admin@swiftaid.com', 'admin123')}
              className={cn(
                "text-xs",
                email === 'admin@swiftaid.com' && "border-primary text-primary"
              )}
            >
              Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemoAccount('driver1@swiftaid.com', 'driver123')}
              className={cn(
                "text-xs",
                email === 'driver1@swiftaid.com' && "border-primary text-primary"
              )}
            >
              Driver 1
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemoAccount('driver2@swiftaid.com', 'driver123')}
              className={cn(
                "text-xs",
                email === 'driver2@swiftaid.com' && "border-primary text-primary"
              )}
            >
              Driver 2
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemoAccount('user@swiftaid.com', 'user123')}
              className={cn(
                "text-xs",
                email === 'user@swiftaid.com' && "border-primary text-primary"
              )}
            >
              User
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
