import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="landing">
      <div className="landing__glow" aria-hidden />
      <div className="landing__inner">
        <p className="eyebrow">Daily connection, gentle guidance</p>
        <h1 className="landing__headline">Hidayah AI</h1>
        <p className="landing__lede">
          Stay close to the Qur’an with mood-based verses, practical meaning, reflections you can
          revisit, and a simple habit rhythm that celebrates showing up.
        </p>
        <div className="landing__actions">
          <Link to="/dashboard" className="btn btn--primary">
            Open dashboard
          </Link>
          <Link to="/guidance" className="btn btn--ghost">
            Today’s guidance
          </Link>
        </div>
        <ul className="landing__points">
          <li>Arabic, translation, tafsir, and recitation in one calm view</li>
          <li>Real-life meaning plus one clear action</li>
          <li>Private reflections stored on this device</li>
        </ul>
      </div>
    </div>
  )
}
