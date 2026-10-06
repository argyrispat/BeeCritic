import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function SignInPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-4xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Welcome back to BeeCritic.</p>

      <aside
        className="mt-6 rounded-sm border border-border bg-surface-2/60 px-4 py-3"
        aria-label="Demo credentials"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Demo credentials
        </p>
        <p className="mt-1 text-sm text-muted">
          Publicly shared for evaluation — use these to explore the app.
        </p>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-mono text-text">demo@beecritic.com</dd>
          </div>
          <div>
            <dt className="text-muted">Password</dt>
            <dd className="font-mono text-text">Demo1234!</dd>
          </div>
        </dl>
        <button
          type="button"
          className="mt-3 text-sm text-accent hover:underline"
          onClick={() => {
            setValue('email', 'demo@beecritic.com', { shouldValidate: true })
            setValue('password', 'Demo1234!', { shouldValidate: true })
          }}
        >
          Fill form
        </button>
      </aside>

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(async (values) => {
          try {
            await login(values.email, values.password)
            navigate(from, { replace: true })
          } catch (err) {
            setError('root', {
              message: err instanceof ApiError ? err.message : 'Sign in failed.',
            })
          }
        })}
      >
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            className="field"
            {...register('email')}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="current-password"
            className="field"
            {...register('password')}
          />
        </Field>

        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent py-3 text-sm font-medium text-bg disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        No account?{' '}
        <Link to="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>

      <style>{`
        .field {
          width: 100%;
          border: 1px solid var(--border);
          background: var(--surface);
          padding: 0.75rem 0.85rem;
          color: var(--text);
          outline: none;
        }
        .field:focus { border-color: var(--accent); }
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
