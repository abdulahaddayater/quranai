type Props = {
  src: string | null
  label?: string
}

export function AudioPlayer({ src, label = 'Recitation' }: Props) {
  if (!src) {
    return (
      <div className="audio audio--muted">
        <span className="audio__label">{label}</span>
        <p className="audio__empty">Audio is unavailable for this verse right now.</p>
      </div>
    )
  }

  return (
    <div className="audio">
      <span className="audio__label">{label}</span>
      <audio className="audio__el" controls preload="none" src={src}>
        Your browser does not support audio.
      </audio>
    </div>
  )
}
