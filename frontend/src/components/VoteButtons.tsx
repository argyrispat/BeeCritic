import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export type VoteValue = 1 | -1 | null

interface VoteButtonsProps {
  upvoteCount: number
  downvoteCount: number
  myVote?: VoteValue
  disabled?: boolean
  pending?: boolean
  interactive?: boolean
  size?: 'sm' | 'md'
  className?: string
  onVote?: (value: 1 | -1) => void
}

export function VoteButtons({
  upvoteCount,
  downvoteCount,
  myVote = null,
  disabled = false,
  pending = false,
  interactive = true,
  size = 'md',
  className = '',
  onVote,
}: VoteButtonsProps) {
  const iconSize = size === 'sm' ? 14 : 16
  const canInteract = interactive && !disabled && !pending && Boolean(onVote)

  return (
    <div
      className={`inline-flex items-center gap-1 ${size === 'sm' ? 'text-xs' : 'text-sm'} ${className}`}
      onClick={(e) => e.preventDefault()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <VoteControl
        label="Upvote"
        count={upvoteCount}
        active={myVote === 1}
        activeClass="text-accent bg-accent-soft"
        idleClass={
          canInteract
            ? 'text-muted hover:text-accent hover:bg-accent-soft/60'
            : 'text-muted'
        }
        icon={<ChevronUp size={iconSize} strokeWidth={2.25} />}
        size={size}
        disabled={!canInteract}
        onClick={() => onVote?.(1)}
      />
      <VoteControl
        label="Downvote"
        count={downvoteCount}
        active={myVote === -1}
        activeClass="text-danger bg-danger/10"
        idleClass={
          canInteract
            ? 'text-muted hover:text-danger hover:bg-danger/10'
            : 'text-muted'
        }
        icon={<ChevronDown size={iconSize} strokeWidth={2.25} />}
        size={size}
        disabled={!canInteract}
        onClick={() => onVote?.(-1)}
      />
    </div>
  )
}

function VoteControl({
  label,
  count,
  active,
  activeClass,
  idleClass,
  icon,
  size,
  disabled,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  activeClass: string
  idleClass: string
  icon: ReactNode
  size: 'sm' | 'md'
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={`inline-flex items-center gap-1 rounded-md font-medium tabular-nums transition-colors ${
        size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1'
      } ${active ? activeClass : idleClass} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {icon}
      <span>{count}</span>
    </button>
  )
}

/** Compact read-only vote counts for list cards wrapped in links. */
export function VoteCounts({
  upvoteCount,
  downvoteCount,
  className = '',
}: {
  upvoteCount: number
  downvoteCount: number
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs tabular-nums text-muted ${className}`}
    >
      <span className="inline-flex items-center gap-0.5 text-accent/80">
        <ChevronUp size={12} strokeWidth={2.25} />
        {upvoteCount}
      </span>
      <span className="inline-flex items-center gap-0.5 text-danger/80">
        <ChevronDown size={12} strokeWidth={2.25} />
        {downvoteCount}
      </span>
    </span>
  )
}

export function SignInToVoteHint() {
  return (
    <p className="text-xs text-muted">
      <Link to="/signin" className="text-accent hover:underline">
        Sign in
      </Link>{' '}
      to vote
    </p>
  )
}
