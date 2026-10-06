import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { commentsApi, reviewsApi, tmdbApi } from '@/api/client'
import { RatingBadge } from '@/components/RatingSelector'
import { ErrorState, PageLoader } from '@/components/States'
import { SignInToVoteHint, VoteButtons } from '@/components/VoteButtons'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import { formatRelativeDate, posterUrl } from '@/lib/format'
import type { Comment, Review, VoteResult } from '@/types'

const commentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
})

type CommentForm = z.infer<typeof commentSchema>

function applyVoteResult<T extends { upvoteCount: number; downvoteCount: number; myVote: number | null }>(
  target: T,
  result: VoteResult,
): T {
  return {
    ...target,
    upvoteCount: result.upvoteCount,
    downvoteCount: result.downvoteCount,
    myVote: result.myVote,
  }
}

export function ReviewDetailPage() {
  const { movieId: movieIdParam, reviewId } = useParams()
  const movieId = Number(movieIdParam)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)

  const review = useQuery({
    queryKey: ['review', reviewId],
    enabled: Boolean(reviewId),
    queryFn: () => reviewsApi.get(reviewId!),
  })

  const movie = useQuery({
    queryKey: ['tmdb', 'movie', movieId],
    enabled: Number.isFinite(movieId),
    queryFn: () => tmdbApi.movie(movieId),
  })

  const comments = useQuery({
    queryKey: ['comments', reviewId],
    enabled: Boolean(reviewId),
    queryFn: () => commentsApi.byReview(reviewId!),
  })

  const createComment = useMutation({
    mutationFn: (content: string) => commentsApi.create(reviewId!, content),
    onSuccess: async () => {
      reset()
      await queryClient.invalidateQueries({ queryKey: ['comments', reviewId] })
      await queryClient.invalidateQueries({ queryKey: ['review', reviewId] })
      await queryClient.invalidateQueries({ queryKey: ['reviews', movieId] })
    },
  })

  const updateComment = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentsApi.update(id, content),
    onSuccess: async () => {
      setEditingCommentId(null)
      await queryClient.invalidateQueries({ queryKey: ['comments', reviewId] })
    },
  })

  const deleteComment = useMutation({
    mutationFn: (id: string) => commentsApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['comments', reviewId] })
      await queryClient.invalidateQueries({ queryKey: ['review', reviewId] })
      await queryClient.invalidateQueries({ queryKey: ['reviews', movieId] })
    },
  })

  const voteReview = useMutation({
    mutationFn: (value: 1 | -1) => reviewsApi.vote(reviewId!, value),
    onSuccess: (result) => {
      queryClient.setQueryData<Review>(['review', reviewId], (current) =>
        current ? applyVoteResult(current, result) : current,
      )
      void queryClient.invalidateQueries({ queryKey: ['reviews', movieId] })
    },
  })

  const voteComment = useMutation({
    mutationFn: ({ id, value }: { id: string; value: 1 | -1 }) =>
      commentsApi.vote(id, value),
    onSuccess: (result, { id }) => {
      queryClient.setQueryData(['comments', reviewId], (current: unknown) => {
        if (!current || typeof current !== 'object' || !('items' in current)) return current
        const page = current as { items: Comment[] }
        return {
          ...page,
          items: page.items.map((item) =>
            item.id === id ? applyVoteResult(item, result) : item,
          ),
        }
      })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
  })

  if (review.isLoading || movie.isLoading) return <PageLoader />

  if (review.isError || !review.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          title="Review not found"
          message={review.error instanceof ApiError ? review.error.message : undefined}
        />
      </div>
    )
  }

  const r = review.data

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 fade-in">
      <button
        type="button"
        onClick={() => navigate(`/movie/${movieId}`)}
        className="text-sm text-muted hover:text-text"
      >
        ← Back to movie
      </button>

      {movie.data && (
        <Link to={`/movie/${movieId}`} className="mt-6 flex items-center gap-4">
          {movie.data.posterPath && (
            <img
              src={posterUrl(movie.data.posterPath, 'w342') ?? undefined}
              alt=""
              className="h-24 w-16 object-cover"
            />
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Review for</p>
            <h1 className="font-display text-2xl">{movie.data.title}</h1>
          </div>
        </Link>
      )}

      <article className="mt-10 border border-border bg-surface p-6 sm:p-8">
        <RatingBadge rating={r.rating} size="lg" />
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
          <Link to={`/u/${r.username}`} className="hover:text-accent">
            {r.username}
          </Link>
          <span>·</span>
          <span>{formatRelativeDate(r.createdAt)}</span>
        </div>
        <p className="mt-6 text-lg leading-relaxed">“{r.content}”</p>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <VoteButtons
            upvoteCount={r.upvoteCount}
            downvoteCount={r.downvoteCount}
            myVote={r.myVote === 1 || r.myVote === -1 ? r.myVote : null}
            pending={voteReview.isPending}
            interactive={isAuthenticated}
            onVote={(value) => voteReview.mutate(value)}
          />
          {!isAuthenticated && <SignInToVoteHint />}
          {voteReview.isError && (
            <p className="text-xs text-danger">
              {voteReview.error instanceof ApiError
                ? voteReview.error.message
                : 'Could not save vote.'}
            </p>
          )}
        </div>
      </article>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Comments</h2>

        <div className="mt-6 space-y-4">
          {comments.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-surface-2" />
            ))
          ) : comments.isError ? (
            <ErrorState onRetry={() => comments.refetch()} />
          ) : !comments.data?.items.length ? (
            <p className="text-sm text-muted">No comments yet. Start the conversation.</p>
          ) : (
            comments.data.items.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwner={user?.userId === comment.userId}
                isAuthenticated={isAuthenticated}
                isEditing={editingCommentId === comment.id}
                votePending={voteComment.isPending && voteComment.variables?.id === comment.id}
                onEdit={() => setEditingCommentId(comment.id)}
                onCancel={() => setEditingCommentId(null)}
                onSave={async (content) => {
                  await updateComment.mutateAsync({ id: comment.id, content })
                }}
                onDelete={() => {
                  if (window.confirm('Delete this comment?')) {
                    deleteComment.mutate(comment.id)
                  }
                }}
                onVote={(value) => voteComment.mutate({ id: comment.id, value })}
              />
            ))
          )}
        </div>

        <div className="mt-8 border-t border-border pt-8">
          {isAuthenticated ? (
            <form
              onSubmit={handleSubmit(async (values) => {
                try {
                  await createComment.mutateAsync(values.content)
                } catch {
                  // surfaced via mutation
                }
              })}
              className="space-y-3"
            >
              <label htmlFor="comment" className="text-sm text-muted">
                Write a comment…
              </label>
              <textarea
                id="comment"
                rows={3}
                className="w-full border border-border bg-surface px-3 py-2 outline-none focus:border-accent"
                {...register('content')}
              />
              {errors.content && (
                <p className="text-sm text-danger">{errors.content.message}</p>
              )}
              {createComment.isError && (
                <p className="text-sm text-danger">
                  {createComment.error instanceof ApiError
                    ? createComment.error.message
                    : 'Failed to post comment.'}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting || createComment.isPending}
                className="bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
              >
                Comment
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted">
              <Link to="/signin" className="text-accent hover:underline">
                Sign in
              </Link>{' '}
              to leave a comment.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function CommentItem({
  comment,
  isOwner,
  isAuthenticated,
  isEditing,
  votePending,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onVote,
}: {
  comment: Comment
  isOwner: boolean
  isAuthenticated: boolean
  isEditing: boolean
  votePending: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (content: string) => Promise<void>
  onDelete: () => void
  onVote: (value: 1 | -1) => void
}) {
  const [draft, setDraft] = useState(comment.content)
  const [saving, setSaving] = useState(false)

  return (
    <div className="border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          <Link to={`/u/${comment.username}`} className="font-medium hover:text-accent">
            {comment.username}
          </Link>
          <span className="mx-2 text-muted">·</span>
          <span className="text-muted">{formatRelativeDate(comment.createdAt)}</span>
        </div>
        {isOwner && !isEditing && (
          <div className="flex gap-3 text-xs text-muted">
            <button type="button" onClick={onEdit} className="hover:text-text">
              Edit
            </button>
            <button type="button" onClick={onDelete} className="hover:text-danger">
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full border border-border bg-bg px-3 py-2 outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true)
                try {
                  await onSave(draft)
                } finally {
                  setSaving(false)
                }
              }}
              className="bg-accent px-3 py-1.5 text-sm text-bg"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(comment.content)
                onCancel()
              }}
              className="border border-border px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 leading-relaxed text-text/90">“{comment.content}”</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <VoteButtons
              size="sm"
              upvoteCount={comment.upvoteCount}
              downvoteCount={comment.downvoteCount}
              myVote={comment.myVote === 1 || comment.myVote === -1 ? comment.myVote : null}
              pending={votePending}
              interactive={isAuthenticated}
              onVote={onVote}
            />
            {!isAuthenticated && <SignInToVoteHint />}
          </div>
        </>
      )}
    </div>
  )
}
