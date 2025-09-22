
import LoginForm from '@/components/admin/login-form';
import { Trophy } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Trophy className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground font-headline">
                BOTOLA Admin
            </h1>
            <p className="mt-2 text-muted-foreground">
                Sign in to manage leagues and matches.
            </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
