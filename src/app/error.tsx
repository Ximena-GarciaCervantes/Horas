'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rk-dark to-rk-gray flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
        <AlertTriangle size={64} className="text-rk-red mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-rk-dark mb-2">Algo salió mal</h1>
        <p className="text-rk-gray mb-6">
          Ocurrió un error inesperado. Por favor, intenta de nuevo.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-rk-green hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200"
        >
          Volver al Dashboard
        </button>
        <button
          onClick={() => router.push('/login')}
          className="w-full mt-3 bg-rk-gray hover:bg-rk-dark text-white font-semibold py-2 rounded-lg transition duration-200"
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}
