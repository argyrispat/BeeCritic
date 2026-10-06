import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'

const schema = z
  .object({
    username: z
      .string()
      .min(3, 'At least 3 characters')
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only'),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Include a letter')
      .regex(/[0-9]/, 'Include a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function SignUpPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-4xl">Create account</h1>
      <p className="mt-2 text-sm text-muted">Join BeeCritic and start reviewing films.</p>

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(async (values) => {
          try {
            await registerUser(values)
            navigate('/', { replace: true })
          } catch (err) {
            setError('root', {
              message: err instanceof ApiError ? err.message : 'Registration failed.',
            })
          }
        })}
      >
        <Field label="Username" error={errors.username?.message}>
          <input className="auth-field" autoComplete="username" {...register('username')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            className="auth-field"
            autoComplete="email"
            {...register('email')}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input
            type="password"
            className="auth-field"
            autoComplete="new-password"
            {...register('password')}
          />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword?.message}>
          <input
            type="password"
            className="auth-field"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </Field>

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent py-3 text-sm font-medium text-bg disabled:opacity-60"
        >
          {isSubmitting ? 'Creating…' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link to="/signin" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>

      <style>{`
        .auth-field {
          width: 100%;
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 0.75rem 0.85rem;
          color: var(--text);
          outline: none;
        }
        .auth-field:focus { border-color: var(--accent); }
      `}</style>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      {children}
      {error && <span className="mt-2 block text-sm text-danger">{error}</span>}
    </label>
  )
}
