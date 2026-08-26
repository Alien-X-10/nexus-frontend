import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../services/api'
import './Register.css'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  emailId: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/user/register', data)
      console.log(response.data)
    } catch (error) {
      console.log(error.response?.data)
    }
  }

  return (
    <main className="register-page">
      <div className="register-orb register-orb-one" />
      <div className="register-orb register-orb-two" />

      <div className="register-container">
        {/* LEFT: product / coding showcase */}
        <section className="register-left">
          <div className="register-grid" />

          <div className="register-brand">
            <div className="register-code-icon">
              &lt;/&gt;
            </div>

            <div>
              <div className="register-brand-title">LeetCode Clone</div>

              <div className="register-pill">
                <span className="register-pill-dot" />
                CODE&nbsp;&nbsp;•&nbsp;&nbsp;SOLVE&nbsp;&nbsp;•&nbsp;&nbsp;IMPROVE
              </div>
            </div>
          </div>

          <div className="register-hero">
            <h1>
              Start.
              <br />
              <span>Code.</span>
              <br />
              Conquer.
            </h1>

            <p>
              Create your account, practice coding problems, sharpen your
              algorithms, and track your progress as you become a better
              problem solver.
            </p>
          </div>

          <div className="register-terminal">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span />
                <span />
                <span />
              </div>

              <span className="terminal-file">solution.cpp</span>
              <span className="terminal-status">●</span>
            </div>

            <div className="terminal-body">
              <div className="code-line">
                <span className="code-purple">#include</span>
                <span className="code-white">&lt;iostream&gt;</span>
              </div>

              <div className="code-line">
                <span className="code-purple">using</span>
                <span className="code-white"> namespace std;</span>
              </div>

              <div className="code-line">&nbsp;</div>

              <div className="code-line">
                <span className="code-purple">int</span>
                <span className="code-white"> main() {'{'}</span>
              </div>

              <div className="code-line code-indent">
                <span className="code-purple">int</span>
                <span className="code-white"> a = </span>
                <span className="code-number code-number-one">4</span>
                <span className="code-white">;</span>
              </div>

              <div className="code-line code-indent">
                <span className="code-purple">int</span>
                <span className="code-white"> b = </span>
                <span className="code-number code-number-two">7</span>
                <span className="code-white">;</span>
              </div>

              <div className="code-line code-indent">
                <span className="code-white">cout &lt;&lt; a + b;</span>
                <span className="terminal-cursor" />
              </div>

              <div className="code-line">
                <span className="code-white">{'}'}</span>
              </div>

              <div className="terminal-output">
                <span>&gt; output:</span>
                <strong>11</strong>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: registration form */}
        <section className="register-right">
          <div className="register-form-wrap">
            <div className="register-login-icon">
              <span>&gt;_</span>
            </div>

            <div className="register-heading">
              <h2>Create your account</h2>
              <p>Join the community and start solving problems.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="register-form">
              <div className="name-row">
                <div className="field-group">
                  <label htmlFor="firstName">First name</label>

                  <input
                    id="firstName"
                    type="text"
                    placeholder="Pritam"
                    {...register('firstName')}
                    className={errors.firstName ? 'field-error' : ''}
                  />

                  {errors.firstName && (
                    <p className="error-message">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="field-group">
                  <label htmlFor="lastName">Last name</label>

                  <input
                    id="lastName"
                    type="text"
                    placeholder="Maity"
                    {...register('lastName')}
                    className={errors.lastName ? 'field-error' : ''}
                  />

                  {errors.lastName && (
                    <p className="error-message">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="emailId">Email address</label>

                <input
                  id="emailId"
                  type="email"
                  placeholder="you@example.com"
                  {...register('emailId')}
                  className={errors.emailId ? 'field-error' : ''}
                />

                {errors.emailId && (
                  <p className="error-message">
                    {errors.emailId.message}
                  </p>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  {...register('password')}
                  className={errors.password ? 'field-error' : ''}
                />

                {errors.password && (
                  <p className="error-message">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button type="submit" className="register-submit">
                <span>Create account</span>
                <span className="register-arrow">→</span>
              </button>
            </form>

            <div className="register-footer">
              Already have an account?
              <a href="/login">Sign in</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Register
