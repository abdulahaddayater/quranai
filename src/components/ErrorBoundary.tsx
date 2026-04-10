import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  /** Optional fallback. If omitted the built-in UI is shown. */
  fallback?: ReactNode
  /** Scope label shown in the error card, e.g. "Guidance" */
  scope?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Class-based error boundary (React still requires a class for this pattern).
 * Wrap any subtree to catch render-time exceptions and show a recovery UI
 * instead of crashing the whole page.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      const { scope = 'This section' } = this.props
      const msg = this.state.error?.message ?? 'Unknown error'

      return (
        <div className="eb-card" role="alert">
          <div className="eb-icon" aria-hidden>
            ⚠
          </div>
          <h2 className="eb-title">{scope} ran into a problem</h2>
          <p className="eb-msg">{msg}</p>
          <p className="eb-hint">
            This can happen due to a network issue or an unexpected response from the API.
          </p>
          <div className="eb-actions">
            <button type="button" className="btn btn--primary" onClick={this.reset}>
              Try again
            </button>
            <Link to="/dashboard" className="btn btn--ghost" onClick={this.reset}>
              Go to dashboard
            </Link>
          </div>
          <details className="eb-details">
            <summary>Technical details</summary>
            <pre className="eb-stack">{String(this.state.error)}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
