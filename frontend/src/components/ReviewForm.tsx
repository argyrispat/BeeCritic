import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { RatingSelector } from '@/components/RatingSelector'
import { ApiError } from '@/lib/api'

const schema = z.object({
  rating: z.number().min(1, 'Choose a rating').max(10),
  content: z
    .string()
    .trim()
    .min(10, 'Review must be at least 10 characters')
    .max(5000, 'Review must be 5000 characters or fewer'),
})

type FormValues = z.infer<typeof schema>

interface ReviewFormProps {
  initialRating?: number
  initialContent?: string
  submitLabel?: string
  onSubmit: (values: FormValues) => Promise<void>
  onCancel?: () => void
}

export function ReviewForm({
  initialRating = 0,
  initialContent = '',
  submitLabel = 'Submit Review',
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: initialRating,
      content: initialContent,
    },
  })

  const rating = watch('rating')

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        try {
          await onSubmit(values)
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Failed to save review.'
          setError('root', { message })
        }
      })}
      className="space-y-5"
    >
      <div>
        <label className="mb-3 block text-sm text-muted">Your rating</label>
        <RatingSelector
          value={rating}
          onChange={(value) => setValue('rating', value, { shouldValidate: true })}
          disabled={isSubmitting}
        />
        {errors.rating && <p className="mt-2 text-sm text-danger">{errors.rating.message}</p>}
      </div>

      <div>
        <label htmlFor="content" className="mb-2 block text-sm text-muted">
          What did you think about this movie?
        </label>
        <textarea
          id="content"
          rows={5}
          className="w-full resize-y border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent"
          placeholder="Share your thoughts…"
          disabled={isSubmitting}
          {...register('content')}
        />
        {errors.content && <p className="mt-2 text-sm text-danger">{errors.content.message}</p>}
      </div>

      {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent px-5 py-2.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-border px-5 py-2.5 text-sm text-muted hover:text-text"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
