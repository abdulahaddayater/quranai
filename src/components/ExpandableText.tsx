import { useId, useState } from 'react'

type Props = {
  text: string
  collapsedChars?: number
  className?: string
}

export function ExpandableText({ text, collapsedChars = 520, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const trimmed = text.trim()
  const long = trimmed.length > collapsedChars
  const shown = !long || open ? trimmed : `${trimmed.slice(0, collapsedChars).trim()}…`

  return (
    <div className={className}>
      <p className="prose-block" id={id}>
        {shown}
      </p>
      {long ? (
        <button
          type="button"
          className="text-btn"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Show less' : 'Read more'}
        </button>
      ) : null}
    </div>
  )
}
