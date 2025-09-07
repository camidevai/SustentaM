import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline';
import { logger } from '../../utils/logger';
import { LogViewer } from '../debug/LogViewer';
import { validarRUT } from '../../lib/validations';

const loginSchema = z.object({
  usuario: z.string().min(1, 'Usuario requerido'),
  clave: z.string().min(1, 'Clave requerida')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotTooltip, setShowForgotTooltip] = useState(false);
  const { login } = useAuthStore();

  useEffect(() => {
    logger.info('LoginForm', 'Componente LoginForm montado');
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    logger.info('LoginForm', 'Intento de login iniciado', { usuario: data.usuario });
    setLoading(true);
    setAuthError('');

    // Pre-validación de formato de RUT antes de consultar la base de datos
    const { valido, mensaje } = validarRUT(data.usuario);
    if (!valido) {
      logger.warn('LoginForm', 'RUT inválido', { rut: data.usuario, mensaje });
      setAuthError(`RUT inválido: ${mensaje}`);
      setLoading(false);
      return;
    }

    try {
      logger.debug('LoginForm', 'Llamando función login del store');
      const success = await login(data.usuario, data.clave);

      if (success) {
        logger.info('LoginForm', 'Login exitoso');
      } else {
        logger.warn('LoginForm', 'Login fallido - credenciales incorrectas');
        setAuthError('Usuario o clave incorrectos');
      }
    } catch (error) {
      logger.error('LoginForm', 'Error durante el login', error);
      setAuthError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header con tipografía consistente y colores de la nueva paleta */}
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-primary-500" />
          <h1 className="mt-6 font-sans text-3xl font-bold text-text-primary">
            Iniciar Sesión
          </h1>
          <p className="mt-2 font-sans text-base text-text-secondary">
            Plataforma de Gestión de Cursos
          </p>
        </div>
        
        {/* Formulario con espaciado consistente */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <Input
              label="Usuario (RUT)"
              type="text"
              autoComplete="username"
              required
              error={errors.usuario?.message}
              placeholder="Ej: 12345678-5"
              {...register('usuario')}
            />

            <div className="relative">
              <Input
                label="Clave"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                error={errors.clave?.message}
                {...register('clave')}
              />
              <button
                type="button"
                className="absolute right-4 top-12 text-text-muted hover:text-text-secondary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de error con nueva paleta */}
          {authError && (
            <div className="bg-error-50 border border-error-200 rounded p-4" role="alert">
              <p className="font-sans text-sm text-error-700 font-medium">{authError}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
          >
            Ingresar
          </Button>

          {/* Forgot password */}
          <div className="mt-3 flex justify-center">
            <div className="relative inline-block" onMouseEnter={() => setShowForgotTooltip(true)} onMouseLeave={() => setShowForgotTooltip(false)}>
              <button
                type="button"
                className="font-sans text-sm font-medium text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                aria-describedby="forgot-tooltip"
                onClick={() => {
                  console.log('Se ejecuta funcionalidad para recordar contraseña...');
                  setShowForgotTooltip(true);
                  setTimeout(() => setShowForgotTooltip(false), 1500);
                }}
              >
                ¿Olvidaste tu clave?
              </button>
              {/* Tooltip */}
              <div
                id="forgot-tooltip"
                role="tooltip"
                className={`${showForgotTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1'} absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-64 rounded-md bg-gray-900 text-white text-xs px-3 py-2 shadow-lg transition-all duration-150`}
              >
                Se ejecuta funcionalidad para recordar contraseña...
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" aria-hidden="true" />
              </div>
            </div>
          </div>
        </form>

        {/* Información de usuarios de prueba con tipografía consistente */}
        <div className="mt-8 text-center">
          <div className="bg-background-tertiary border border-border-light rounded-lg p-4">
            <p className="font-sans text-sm font-semibold text-text-primary mb-3">
              Usuarios de prueba:
            </p>
            <div className="space-y-2 font-sans text-xs text-text-secondary">
              <p><strong className="text-text-primary">Admin:</strong> Usuario: 11.111.111-1, Clave: admin</p>
              <p><strong className="text-text-primary">Contratista:</strong> Usuario: 22.222.222-2, Clave: 1234</p>
              <p><strong className="text-text-primary">Usuarios válidos para pruebas:</strong></p>
              <div className="ml-4 space-y-1">
                <p>• Juan Carlos Pérez González - 12.345.678-5, Clave: user123</p>
                <p>• María Elena Rodríguez Silva - 98.765.432-5, Clave: user123</p>
                <p>• Carlos Alberto Muñoz Torres - 15.678.234-3, Clave: user123</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Maqueta Interactiva - Datos de Demostración</p>
            <p>Esta es una simulación completa del sistema de gestión de cursos</p>
          </div>
        </div>
      </div>
      <LogViewer />
    </div>
  );
}