'use client';

import Button from '@/components/Transition/Button';
import { useAuth } from '@/providers/AuthProvider';
import { FaGoogle } from 'react-icons/fa';

export default function LoginButton() {
  const { signIn } = useAuth();
  return (
    <Button
      onClick={signIn}
      className="bg-primus-blue text-white hover:bg-primus-blue/90"
    >
      <FaGoogle className="mr-2" />
      Entrar com Google
    </Button>
  );
}