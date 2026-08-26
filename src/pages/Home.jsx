import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <main className="home-page">

      {/* Background */}
      <div className="home-grid" />
      <div className="home-glow home-glow-one" />
      <div className="home-glow home-glow-two" />

      <section className="home-hero">

        {/* LEFT */}
        <div className="home-hero-content">

          <div className="home-eyebrow">
            <span className="home-eyebrow-dot" />
            THE NEXT GENERATION CODING PLATFORM
          </div>

          <h1>
            Start.
            <br />
            <span>Code.</span>
            <br />
            Conquer<span className="home-dot">.</span>
          </h1>

          <p className="home-hero-description">
            Master algorithms, solve challenging problems,
            sharpen your problem-solving skills, and build
            the confidence to conquer technical interviews.
          </p>

          <div className="home-actions">

            <Link
              to="/problems"
              className="home-primary-btn"
            >
              <span>Explore Problems</span>
              <span className="home-arrow">→</span>
            </Link>

            <Link
              to="/register"
              className="home-secondary-btn"
            >
              Create Account
            </Link>

          </div>

          <div className="home-trust">

            <div className="home-trust-item">
              <strong>100+</strong>
              <span>Problems</span>
            </div>

            <div className="home-trust-divider" />

            <div className="home-trust-item">
              <strong>3</strong>
              <span>Difficulty Levels</span>
            </div>

            <div className="home-trust-divider" />

            <div className="home-trust-item">
              <strong>∞</strong>
              <span>Attempts</span>
            </div>

          </div>

        </div>


        {/* RIGHT — CODE VISUAL */}
        <div className="home-code-wrapper">

          <div className="home-code-glow" />

          <div className="home-code-window">

            <div className="home-code-header">

              <div className="home-window-dots">
                <span />
                <span />
                <span />
              </div>

              <div className="home-file-name">
                solution.cpp
              </div>

              <div className="home-live">
                <span />
                LIVE
              </div>

            </div>


            <div className="home-code-body">

              <div className="home-line">
                <span className="line-number">01</span>
                <span className="code-purple">
                  #include
                </span>
                <span className="code-white">
                  {' '}&lt;iostream&gt;
                </span>
              </div>

              <div className="home-line">
                <span className="line-number">02</span>
                <span className="code-purple">
                  using namespace
                </span>
                <span className="code-white">
                  {' '}std;
                </span>
              </div>

              <div className="home-line">
                <span className="line-number">03</span>
              </div>

              <div className="home-line">
                <span className="line-number">04</span>
                <span className="code-purple">
                  int
                </span>
                <span className="code-white">
                  {' '}main()
                </span>
                <span className="code-white">
                  {' '}&#123;
                </span>
              </div>

              <div className="home-line">
                <span className="line-number">05</span>
                <span className="code-white indent">
                  int a ={' '}
                </span>
                <span className="code-number">
                  4
                </span>
                <span className="code-white">
                  ;
                </span>
              </div>

              <div className="home-line">
                <span className="line-number">06</span>
                <span className="code-white indent">
                  int b ={' '}
                </span>
                <span className="code-number">
                  7
                </span>
                <span className="code-white">
                  ;
                </span>
              </div>

              <div className="home-line">
                <span className="line-number">07</span>
                <span className="code-white indent">
                  int sum = a + b;
                </span>
              </div>

              <div className="home-line">
                <span className="line-number">08</span>
                <span className="code-white indent">
                  cout &lt;&lt; sum;
                </span>
              </div>

              <div className="home-line">
                <span className="line-number">09</span>
                <span className="code-white">
                  &#125;
                </span>
              </div>

              <div className="home-cursor" />

            </div>


            <div className="home-terminal">

              <div className="terminal-header">
                <span>TERMINAL</span>
                <span className="terminal-status">
                  ● READY
                </span>
              </div>

              <div className="terminal-content">
                <span className="terminal-prompt">
                  $
                </span>

                <span>
                  ./solution
                </span>

                <span className="terminal-output">
                  11
                </span>

                <span className="terminal-success">
                  ✓ Accepted
                </span>
              </div>

            </div>

          </div>


          {/* Floating badge */}
          <div className="home-floating-card">

            <div className="floating-check">
              ✓
            </div>

            <div>
              <strong>Solution Accepted</strong>
              <span>Runtime 42 ms</span>
            </div>

          </div>

        </div>

      </section>


      {/* FEATURES */}

      <section className="home-features">

        <div className="home-section-heading">

          <span>
            WHY NEXUS
          </span>

          <h2>
            Everything you need to
            <strong> level up.</strong>
          </h2>

        </div>


        <div className="home-feature-grid">

          <div className="home-feature-card">

            <div className="feature-number">
              01
            </div>

            <div className="feature-icon">
              &lt;/&gt;
            </div>

            <h3>
              Practice Problems
            </h3>

            <p>
              Solve carefully designed coding
              problems across multiple difficulty
              levels and sharpen your fundamentals.
            </p>

            <Link to="/problems">
              Start solving →
            </Link>

          </div>


          <div className="home-feature-card">

            <div className="feature-number">
              02
            </div>

            <div className="feature-icon">
              ◈
            </div>

            <h3>
              Track Progress
            </h3>

            <p>
              Keep an eye on your solved problems,
              submissions, acceptance rate, and
              overall coding progress.
            </p>

            <Link to="/profile">
              View profile →
            </Link>

          </div>


          <div className="home-feature-card">

            <div className="feature-number">
              03
            </div>

            <div className="feature-icon">
              ⚡
            </div>

            <h3>
              Code & Submit
            </h3>

            <p>
              Write code directly in the browser,
              run test cases, and submit your
              solutions against the online judge.
            </p>

            <Link to="/problems">
              Enter arena →
            </Link>

          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="home-bottom-cta">

        <div className="cta-content">

          <div className="home-eyebrow">
            <span className="home-eyebrow-dot" />
            YOUR JOURNEY STARTS HERE
          </div>

          <h2>
            Ready to
            <span> conquer?</span>
          </h2>

          <p>
            Pick a problem. Write some code.
            Keep getting better.
          </p>

          <Link
            to="/problems"
            className="home-primary-btn"
          >
            Start Coding
            <span className="home-arrow">→</span>
          </Link>

        </div>

      </section>

    </main>
  )
}

export default Home