import { useEffect, useState } from 'react'
import './EmployeeAuth.css'
import { getEmployeeTestCredentials, loginEmployee, navigateToEmployeePath } from '../services/employeeAuth'

function EmployeeLoginPage({ employeeSession, onAuthenticated, redirectToLogin = false }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alertState, setAlertState] = useState({ type: '', message: '' })
  const testAccounts = getEmployeeTestCredentials()

  useEffect(() => {
    if (redirectToLogin && window.location.pathname !== '/login') {
      navigateToEmployeePath('/login')
    }
  }, [redirectToLogin])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setAlertState({ type: '', message: '' })

    try {
      const session = await loginEmployee({ email, password })
      setAlertState({
        type: 'success',
        message: 'Login successful. Redirecting to your protected dashboard.',
      })
      onAuthenticated?.(session)

      window.setTimeout(() => {
        navigateToEmployeePath('/dashboard')
      }, 700)
    } catch (error) {
      setAlertState({
        type: 'error',
        message: error.message || 'Unable to sign in right now.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDashboardClick = () => {
    navigateToEmployeePath('/dashboard')
  }

  return (
    <main className="employee-auth">
      <section className="employee-auth__shell">
        <div className="employee-auth__brand">
          <span className="employee-auth__brand-mark">NG</span>
          <div>
            <p className="employee-auth__brand-name">NewG India</p>
            <p className="employee-auth__brand-text">Employee dashboard access</p>
          </div>
        </div>

        <div className="employee-auth__card employee-auth__card--login">
          <div className="employee-auth__header">
            <span className="employee-auth__eyebrow">Private login</span>
            <h1>Sign in to continue</h1>
            <p>
              This is a shared employee login route. The dashboard opens according to the matched
              employee role after email and password are verified.
            </p>
          </div>

          {alertState.message ? (
            <div className={`employee-auth__alert employee-auth__alert--${alertState.type}`} role="alert">
              {alertState.message}
            </div>
          ) : null}

          <div className="employee-auth__helper">
            {testAccounts.map((account) => (
              <p key={account.email}>
                {account.role}: <strong>{account.email}</strong> / <strong>{account.password}</strong>
              </p>
            ))}
          </div>

          {employeeSession ? (
            <div className="employee-auth__success">
              <p>
                Signed in as <strong>{employeeSession.email}</strong>
              </p>
              <button type="button" className="employee-auth__primary" onClick={handleDashboardClick}>
                Open dashboard
              </button>
            </div>
          ) : (
            <form className="employee-auth__form" onSubmit={handleSubmit}>
              <label className="employee-auth__field">
                <span>Work email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="name@newgindia.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label className="employee-auth__field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              <button type="submit" className="employee-auth__primary" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Access dashboard'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

export default EmployeeLoginPage
