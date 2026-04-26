'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('invalid login credentials')) {
          setError('Correo o contraseña incorrectos. Verifica tus datos en Supabase Auth.');
        } else if (authError.message.toLowerCase().includes('email not confirmed')) {
          setError('Tu correo aun no esta confirmado. Confirma el email o desactiva confirmacion en Supabase Auth.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Get user profile to check assigned RKs
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profileData) {
          setError('Error al obtener perfil de usuario');
          setLoading(false);
          return;
        }

        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-hero">
          <div className="login-kicker">Pizarron Digital</div>
          <h1 className="login-title">HORAS</h1>
          <p className="login-copy">
            Control de produccion por maquina con seguimiento por hora, incidencias y eficiencia acumulada.
          </p>
          <div className="login-pills">
            <span className="login-pill">RK1</span>
            <span className="login-pill">RK2</span>
            <span className="login-pill">RK3</span>
            <span className="login-pill">RK4</span>
          </div>
        </div>

        <div className="login-grid">
          <div className="login-preview">
            <div className="login-preview-topbar">
              <span>Reporte de Produccion Hora por Hora</span>
              <span>Meta FPY 90%</span>
            </div>
            <div className="login-preview-body">
              <div className="login-preview-card">
                <strong>Hora</strong>
                <span>6:00 - 7:00</span>
                <span className="val-bad">44.2%</span>
              </div>
              <div className="login-preview-card">
                <strong>Acumulado</strong>
                <span>Plan 720</span>
                <span className="val-good">Real 402</span>
              </div>
              <div className="login-preview-card">
                <strong>Yield</strong>
                <span className="val-good">96%</span>
                <span>Sin paro mayor</span>
              </div>
              <div className="login-preview-card">
                <strong>Problemas</strong>
                <span>1 incidencia abierta</span>
                <span>Responsable: Mantenimiento</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="login-panel">
            <h2 className="login-panel-title">Iniciar Sesion</h2>

            {error && <div className="login-error">{error}</div>}

            <label className="login-field">
              Correo Electronico
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder="usuario@rk.com"
                required
              />
            </label>

            <label className="login-field">
              Contrasena
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder="********"
                required
              />
            </label>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Iniciando sesion...' : 'Entrar al tablero'}
            </button>

            <div className="mt-4 text-sm text-slate-700">
              <div><strong>Ejemplo:</strong> alberto@rk.com</div>
              <div><strong>Acceso:</strong> solo RKs asignadas por perfil</div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
