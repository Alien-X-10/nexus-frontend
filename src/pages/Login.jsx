import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../services/api'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

function Login() {
  const navigate = useNavigate()

  // ==========================================
  // FORM STATE
  // ==========================================

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  // ==========================================
  // ANIMATED C++ CODE STATE
  // ==========================================

  const [numbers, setNumbers] = useState({
    a: 24,
    b: 18,
  })

  // Change numbers every 2.2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNumbers({
        a: Math.floor(Math.random() * 90) + 10,
        b: Math.floor(Math.random() * 90) + 10,
      })
    }, 2200)

    return () => clearInterval(interval)
  }, [])

  const sum = numbers.a + numbers.b

  // ==========================================
  // REACT HOOK FORM
  // ==========================================

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  // ==========================================
  // LOGIN
  // ==========================================

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setServerError('')

      await api.post('/user/login', {
        emailId: data.email,
        password: data.password,
      })

      navigate('/problems')
    } catch (error) {
      console.log(error.response?.data)

      setServerError(
        error.response?.data?.message ||
          error.response?.data ||
          'Invalid email or password'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`

        /* =========================================
           PAGE
        ========================================= */

        .login-page {
          min-height: calc(100vh - 72px);

          // padding: 28px 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          box-sizing: border-box;

          overflow: hidden;

          position: relative;

          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(99, 102, 241, 0.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(124, 58, 237, 0.10),
              transparent 30%
            ),
            #151a20;
        }


        /* =========================================
           ANIMATED GRID
        ========================================= */

        .login-grid {
          position: absolute;

          inset: 0;

          pointer-events: none;

          background-image:
            linear-gradient(
              rgba(99, 102, 241, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(99, 102, 241, 0.035) 1px,
              transparent 1px
            );

          background-size: 45px 45px;

          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 20%,
            black 80%,
            transparent
          );

          animation: gridMove 18s linear infinite;
        }

        @keyframes gridMove {
          from {
            transform: translateY(0);
          }

          to {
            transform: translateY(45px);
          }
        }


        /* =========================================
           FLOATING CODE SYMBOLS
        ========================================= */

        .floating-symbol {
          position: absolute;

          color: rgba(99, 102, 241, 0.12);

          font-family: monospace;

          font-size: 28px;

          pointer-events: none;

          animation: floatSymbol 7s ease-in-out infinite;
        }

        .symbol-one {
          top: 18%;
          left: 5%;
        }

        .symbol-two {
          top: 65%;
          left: 8%;
          animation-delay: 2s;
        }

        .symbol-three {
          top: 25%;
          right: 6%;
          animation-delay: 1s;
        }

        .symbol-four {
          bottom: 15%;
          right: 10%;
          animation-delay: 3s;
        }

        @keyframes floatSymbol {

          0%,
          100% {
            transform:
              translateY(0)
              rotate(0deg);

            opacity: 0.25;
          }

          50% {
            transform:
              translateY(-20px)
              rotate(4deg);

            opacity: 0.7;
          }
        }


        /* =========================================
           MAIN CARD
        ========================================= */

        .login-container {
          position: relative;

          z-index: 2;

          width: 100%;

          max-width: 1180px;

          min-height: 590px;

          display: grid;

          grid-template-columns:
            1.08fr
            0.92fr;

          overflow: hidden;

          border:
            1px solid
            rgba(255, 255, 255, 0.07);

          border-radius: 24px;

          background:
            rgba(25, 30, 37, 0.94);

          box-shadow:
            0 30px 80px
            rgba(0, 0, 0, 0.45),

            0 0 100px
            rgba(99, 102, 241, 0.06);

          backdrop-filter: blur(18px);

          animation:
            containerEnter
            0.7s
            ease-out;
        }

        @keyframes containerEnter {

          from {
            opacity: 0;

            transform:
              translateY(25px)
              scale(0.98);
          }

          to {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }
        }


        /* =========================================
           LEFT SIDE
        ========================================= */

        .login-left {
          position: relative;

          overflow: hidden;

          padding: 42px 48px;

          display: flex;

          flex-direction: column;

          justify-content: space-between;

          background:
            radial-gradient(
              circle at 20% 15%,
              rgba(99, 102, 241, 0.25),
              transparent 38%
            ),
            linear-gradient(
              135deg,
              rgba(49, 46, 129, 0.45),
              rgba(20, 25, 32, 0.88)
            );
        }

        .login-left::before {
          content: '';

          position: absolute;

          width: 420px;
          height: 420px;

          top: -220px;
          left: -180px;

          border-radius: 50%;

          background:
            rgba(99, 102, 241, 0.13);

          filter: blur(80px);

          animation:
            glowMove
            7s
            ease-in-out
            infinite;
        }

        .login-left::after {
          content: '';

          position: absolute;

          width: 280px;
          height: 280px;

          right: -120px;
          bottom: -140px;

          border-radius: 50%;

          background:
            rgba(99, 102, 241, 0.12);

          filter: blur(70px);

          animation:
            glowMove
            6s
            ease-in-out
            infinite;
        }

        @keyframes glowMove {

          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.3);
          }
        }


        /* =========================================
           BRAND
        ========================================= */

        .brand {
          display: flex;

          align-items: center;

          gap: 12px;

          position: relative;

          z-index: 2;
        }

        .brand-icon {
          width: 44px;
          height: 44px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 12px;

          color: #6366f1;

          background:
            rgba(99, 102, 241, 0.12);

          border:
            1px solid
            rgba(99, 102, 241, 0.35);

          font-size: 19px;

          font-weight: 700;

          box-shadow:
            0 0 20px
            rgba(99, 102, 241, 0.15);

          animation:
            iconPulse
            3s
            ease-in-out
            infinite;
        }

        @keyframes iconPulse {

          0%,
          100% {
            box-shadow:
              0 0 15px
              rgba(99, 102, 241, 0.12);
          }

          50% {
            box-shadow:
              0 0 30px
              rgba(99, 102, 241, 0.35);
          }
        }

        .brand-name {
          font-size: 19px;

          font-weight: 700;

          color: #f1f5f9;
        }

        .brand-tag {
          margin-top: 7px;

          display: inline-block;

          padding: 6px 11px;

          border-radius: 999px;

          color: #818cf8;

          background:
            rgba(99, 102, 241, 0.09);

          border:
            1px solid
            rgba(99, 102, 241, 0.25);

          font-size: 11px;

          font-family: monospace;

          letter-spacing: 0.4px;
        }


        /* =========================================
           HERO
        ========================================= */

        .hero-content {
          position: relative;

          z-index: 2;
        }

        .hero-title {
          margin:
            24px 0 18px;

          font-size:
            clamp(44px, 4vw, 58px);

          line-height: 1.02;

          letter-spacing: -2.5px;

          color: #f8fafc;
        }

        .hero-title .accent {
          color: #6366f1;

          text-shadow:
            0 0 25px
            rgba(99, 102, 241, 0.35);
        }

        .hero-description {
          max-width: 470px;

          margin: 0;

          color: #94a3b8;

          font-size: 15px;

          line-height: 1.7;
        }


        /* =========================================
           C++ TERMINAL
        ========================================= */

        .terminal {
          position: relative;

          z-index: 3;

          margin-top: 25px;

          width: 100%;

          border:
            1px solid
            rgba(255, 255, 255, 0.09);

          border-radius: 15px;

          overflow: hidden;

          background: #151a20;

          box-shadow:
            0 25px 50px
            rgba(0, 0, 0, 0.32),

            0 0 35px
            rgba(99, 102, 241, 0.06);

          animation:
            terminalEnter
            1s
            ease-out
            0.25s
            both;
        }

        @keyframes terminalEnter {

          from {
            opacity: 0;

            transform:
              translateY(25px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }
        }


        /* Terminal header */

        .terminal-header {
          height: 40px;

          display: flex;

          align-items: center;

          gap: 7px;

          padding: 0 14px;

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.07);

          background:
            rgba(255, 255, 255, 0.015);

          color: #64748b;

          font-family: monospace;

          font-size: 11px;
        }

        .terminal-dot {
          width: 9px;
          height: 9px;

          border-radius: 50%;
        }

        .dot-red {
          background: #ef476f;
        }

        .dot-yellow {
          background: #f5b700;
        }

        .dot-green {
          background: #06d6a0;
        }

        .terminal-file {
          margin-left: 8px;

          color: #64748b;
        }


        /* =========================================
           TERMINAL BODY
        ========================================= */

        .terminal-body {
          padding:
            18px
            20px
            20px;

          font-family:
            'Courier New',
            monospace;

          font-size: 13px;

          line-height: 1.72;

          color: #cbd5e1;
        }

        .code-line {
          white-space: nowrap;
        }

        .code-indent {
          padding-left: 22px;
        }

        .code-space {
          height: 8px;
        }

        .code-purple {
          color: #c084fc;
        }

        .code-blue {
          color: #60a5fa;
        }

        .code-green {
          color: #34d399;
        }

        .code-orange {
          color: #fb923c;
        }

        .code-white {
          color: #e2e8f0;
        }

        .code-string {
          color: #86efac;
        }

        .code-number {
          color: #fbbf24;
        }


        /* =========================================
           ANIMATED NUMBERS
        ========================================= */

        .animated-number {
          display: inline-block;

          min-width: 22px;

          color: #fbbf24;

          font-weight: 700;

          text-shadow:
            0 0 10px
            rgba(251, 191, 36, 0.25);

          animation:
            numberChange
            0.55s
            ease-out;
        }

        @keyframes numberChange {

          0% {
            opacity: 0;

            transform:
              translateY(-10px)
              scale(1.15);
          }

          55% {
            opacity: 1;

            transform:
              translateY(2px)
              scale(1.04);
          }

          100% {
            opacity: 1;

            transform:
              translateY(0)
              scale(1);
          }
        }


        /* =========================================
           OUTPUT
        ========================================= */

        .terminal-output {
          margin-top: 14px;

          padding-top: 13px;

          border-top:
            1px solid
            rgba(255, 255, 255, 0.06);
        }

        .output-label {
          margin-bottom: 4px;

          color: #64748b;

          font-size: 9px;

          letter-spacing: 1.5px;
        }

        .output-result {
          display: flex;

          align-items: center;

          gap: 8px;

          color: #e2e8f0;

          font-size: 13px;

          animation:
            outputChange
            0.55s
            ease-out;
        }

        @keyframes outputChange {

          from {
            opacity: 0;

            transform:
              translateX(-8px);
          }

          to {
            opacity: 1;

            transform:
              translateX(0);
          }
        }

        .output-symbol {
          color: #64748b;
        }

        .output-sum {
          color: #34d399;

          font-weight: 700;

          text-shadow:
            0 0 12px
            rgba(52, 211, 153, 0.3);
        }

        .cursor {
          color: #6366f1;

          animation:
            cursorBlink
            0.8s
            step-end
            infinite;
        }

        @keyframes cursorBlink {
          50% {
            opacity: 0;
          }
        }


        /* =========================================
           RIGHT SIDE
        ========================================= */

        .login-right {
          padding:
            48px
            58px;

          display: flex;

          flex-direction: column;

          justify-content: center;

          background:
            linear-gradient(
              180deg,
              rgba(24, 29, 36, 0.95),
              rgba(20, 24, 30, 0.98)
            );
        }

        .login-icon {
          width: 48px;
          height: 48px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 20px;

          border-radius: 13px;

          color: #6366f1;

          background:
            rgba(99, 102, 241, 0.08);

          border:
            1px solid
            rgba(99, 102, 241, 0.25);

          font-family: monospace;

          font-size: 20px;

          animation:
            iconPulse
            3s
            ease-in-out
            infinite;
        }

        .login-heading {
          margin: 0;

          color: #f8fafc;

          font-size: 38px;

          letter-spacing: -1.3px;
        }

        .login-subtitle {
          margin:
            9px 0 28px;

          color: #94a3b8;

          font-size: 15px;
        }


        /* =========================================
           FORM
        ========================================= */

        .form-group {
          margin-bottom: 19px;
        }

        .form-label {
          display: block;

          margin-bottom: 8px;

          color: #e2e8f0;

          font-size: 13px;

          font-weight: 600;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;

          height: 49px;

          box-sizing: border-box;

          padding:
            0 15px;

          border-radius: 7px;

          border:
            1px solid
            #3f4854;

          outline: none;

          color: #f1f5f9;

          background: #1b2027;

          font-size: 14px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .form-input:focus {
          border-color: #6366f1;

          background: #1d222a;

          box-shadow:
            0 0 0 3px
            rgba(99, 102, 241, 0.10),

            0 0 22px
            rgba(99, 102, 241, 0.07);
        }

        .password-input {
          padding-right: 55px;
        }


        /* =========================================
           PASSWORD TOGGLE
        ========================================= */

        .password-toggle {
          position: absolute;

          right: 13px;

          top: 50%;

          transform:
            translateY(-50%);

          border: none;

          background: transparent;

          color: #64748b;

          cursor: pointer;

          font-size: 13px;

          transition:
            color 0.2s ease;
        }

        .password-toggle:hover {
          color: #818cf8;
        }


        /* =========================================
           ERRORS
        ========================================= */

        .field-error {
          margin:
            6px 0 0;

          color: #fb7185;

          font-size: 12px;
        }

        .server-error {
          margin-bottom: 16px;

          padding:
            11px
            13px;

          border-radius: 7px;

          border:
            1px solid
            rgba(244, 63, 94, 0.25);

          background:
            rgba(244, 63, 94, 0.07);

          color: #fb7185;

          font-size: 13px;
        }


        /* =========================================
           LOGIN BUTTON
        ========================================= */

        .login-button {
          width: 100%;

          height: 50px;

          border: none;

          border-radius: 7px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #5855e8
            );

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          position: relative;

          overflow: hidden;

          box-shadow:
            0 8px 22px
            rgba(99, 102, 241, 0.22);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .login-button::before {
          content: '';

          position: absolute;

          top: 0;

          left: -100%;

          width: 60%;

          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.18),
              transparent
            );

          transform:
            skewX(-20deg);

          transition:
            left 0.5s ease;
        }

        .login-button:hover::before {
          left: 140%;
        }

        .login-button:hover:not(:disabled) {
          transform:
            translateY(-2px);

          box-shadow:
            0 12px 30px
            rgba(99, 102, 241, 0.35);
        }

        .login-button:active:not(:disabled) {
          transform:
            translateY(0);
        }

        .login-button:disabled {
          opacity: 0.7;

          cursor: not-allowed;
        }

        .button-content {
          position: relative;

          z-index: 2;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;
        }


        /* =========================================
           SPINNER
        ========================================= */

        .spinner {
          width: 15px;

          height: 15px;

          border:
            2px solid
            rgba(255,255,255,0.35);

          border-top-color: white;

          border-radius: 50%;

          animation:
            spin
            0.7s
            linear
            infinite;
        }

        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }


        /* =========================================
           REGISTER
        ========================================= */

        .register-text {
          margin:
            24px 0 0;

          text-align: center;

          color: #64748b;

          font-size: 13px;
        }

        .register-link {
          color: #818cf8;

          text-decoration: none;

          font-weight: 600;

          transition:
            color 0.2s ease;
        }

        .register-link:hover {
          color: #a5b4fc;
        }


        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 900px) {

          .login-page {
            padding: 24px;
          }

          .login-container {
            grid-template-columns: 1fr;

            min-height: auto;
          }

          .login-left {
            display: none;
          }

          .login-right {
            padding:
              45px
              35px;
          }
        }


        @media (max-width: 500px) {

          .login-page {
            padding: 15px;
          }

          .login-container {
            border-radius: 18px;
          }

          .login-right {
            padding:
              35px
              25px;
          }

          .login-heading {
            font-size: 32px;
          }
        }

      `}</style>


      {/* =========================================
          PAGE
      ========================================= */}

      <div className="login-page">

        {/* Animated background */}

        <div className="login-grid" />

        <div className="floating-symbol symbol-one">
          {'{ }'}
        </div>

        <div className="floating-symbol symbol-two">
          {'</>'}
        </div>

        <div className="floating-symbol symbol-three">
          {'[ ]'}
        </div>

        <div className="floating-symbol symbol-four">
          {'=>'}
        </div>


        {/* ======================================
            MAIN LOGIN CARD
        ====================================== */}

        <div className="login-container">


          {/* ====================================
              LEFT SIDE
          ==================================== */}

          <section className="login-left">

            <div>

              {/* BRAND */}

              <div className="brand">

                <div className="brand-icon">
                  {'</>'}
                </div>

                <div>

                  <div className="brand-name">
                    LeetCode Clone
                  </div>

                  <div className="brand-tag">
                    ● CODE · SOLVE · IMPROVE
                  </div>

                </div>

              </div>


              {/* HERO */}

              <div className="hero-content">

                <h1 className="hero-title">

                  Think.

                  <br />

                  <span className="accent">
                    Code.
                  </span>

                  <br />

                  Conquer.

                </h1>


                <p className="hero-description">
                  Practice coding problems, sharpen your
                  algorithms, and track your progress as you
                  become a better problem solver.
                </p>

              </div>

            </div>


            {/* ==================================
                C++ TERMINAL
            ================================== */}

            <div className="terminal">

              {/* TERMINAL HEADER */}

              <div className="terminal-header">

                <span className="terminal-dot dot-red" />

                <span className="terminal-dot dot-yellow" />

                <span className="terminal-dot dot-green" />

                <span className="terminal-file">
                  solution.cpp
                </span>

              </div>


              {/* TERMINAL CODE */}

              <div className="terminal-body">

                {/* #include */}

                <div className="code-line">

                  <span className="code-purple">
                    #include
                  </span>{' '}

                  <span className="code-white">
                    &lt;iostream&gt;
                  </span>

                </div>


                {/* namespace */}

                <div className="code-line">

                  <span className="code-purple">
                    using
                  </span>{' '}

                  <span className="code-blue">
                    namespace
                  </span>{' '}

                  <span className="code-white">
                    std;
                  </span>

                </div>


                <div className="code-space" />


                {/* main */}

                <div className="code-line">

                  <span className="code-purple">
                    int
                  </span>{' '}

                  <span className="code-green">
                    main
                  </span>

                  <span className="code-white">
                    ()
                  </span>{' '}

                  <span className="code-white">
                    {'{'}
                  </span>

                </div>


                {/* a */}

                <div className="code-line code-indent">

                  <span className="code-purple">
                    int
                  </span>{' '}

                  <span className="code-white">
                    a
                  </span>{' '}

                  <span className="code-white">
                    =
                  </span>{' '}

                  <span
                    key={`a-${numbers.a}`}
                    className="animated-number"
                  >
                    {numbers.a}
                  </span>

                  <span className="code-white">
                    ;
                  </span>

                </div>


                {/* b */}

                <div className="code-line code-indent">

                  <span className="code-purple">
                    int
                  </span>{' '}

                  <span className="code-white">
                    b
                  </span>{' '}

                  <span className="code-white">
                    =
                  </span>{' '}

                  <span
                    key={`b-${numbers.b}`}
                    className="animated-number"
                  >
                    {numbers.b}
                  </span>

                  <span className="code-white">
                    ;
                  </span>

                </div>


                <div className="code-space" />


                {/* sum */}

                <div className="code-line code-indent">

                  <span className="code-purple">
                    int
                  </span>{' '}

                  <span className="code-white">
                    sum
                  </span>{' '}

                  <span className="code-white">
                    =
                  </span>{' '}

                  <span className="code-white">
                    a + b;
                  </span>

                </div>


                <div className="code-space" />


                {/* cout */}

                <div className="code-line code-indent">

                  <span className="code-blue">
                    cout
                  </span>{' '}

                  <span className="code-white">
                    &lt;&lt;
                  </span>{' '}

                  <span className="code-orange">
                    a
                  </span>{' '}

                  <span className="code-white">
                    &lt;&lt;
                  </span>{' '}

                  <span className="code-string">
                    "&nbsp;+&nbsp;"
                  </span>{' '}

                  <span className="code-white">
                    &lt;&lt;
                  </span>{' '}

                  <span className="code-orange">
                    b
                  </span>{' '}

                  <span className="code-white">
                    &lt;&lt;
                  </span>{' '}

                  <span className="code-string">
                    "&nbsp;=&nbsp;"
                  </span>{' '}

                  <span className="code-white">
                    &lt;&lt;
                  </span>{' '}

                  <span className="code-orange">
                    sum
                  </span>{' '}

                  <span className="code-white">
                    &lt;&lt; endl;
                  </span>

                </div>


                <div className="code-space" />


                {/* return */}

                <div className="code-line code-indent">

                  <span className="code-purple">
                    return
                  </span>{' '}

                  <span className="code-number">
                    0
                  </span>

                  <span className="code-white">
                    ;
                  </span>

                </div>


                {/* closing bracket */}

                <div className="code-line">

                  <span className="code-white">
                    {'}'}
                  </span>

                </div>


                {/* =================================
                    OUTPUT
                ================================= */}

                <div className="terminal-output">

                  <div className="output-label">
                    OUTPUT
                  </div>

                  <div
                    key={`${numbers.a}-${numbers.b}`}
                    className="output-result"
                  >

                    <span>
                      {numbers.a}
                    </span>

                    <span className="output-symbol">
                      +
                    </span>

                    <span>
                      {numbers.b}
                    </span>

                    <span className="output-symbol">
                      =
                    </span>

                    <span className="output-sum">
                      {sum}
                    </span>

                    <span className="cursor">
                      █
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* ====================================
              RIGHT SIDE
          ==================================== */}

          <section className="login-right">

            {/* Login icon */}

            <div className="login-icon">
              &gt;_
            </div>


            {/* Heading */}

            <h2 className="login-heading">
              Welcome back
            </h2>

            <p className="login-subtitle">
              Sign in and continue solving problems.
            </p>


            {/* ==================================
                LOGIN FORM
            ================================== */}

            <form onSubmit={handleSubmit(onSubmit)}>


              {/* EMAIL */}

              <div className="form-group">

                <label
                  htmlFor="email"
                  className="form-label"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                />

                {errors.email && (
                  <p className="field-error">
                    {errors.email.message}
                  </p>
                )}

              </div>


              {/* PASSWORD */}

              <div className="form-group">

                <label
                  htmlFor="password"
                  className="form-label"
                >
                  Password
                </label>

                <div className="input-wrapper">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    className="form-input password-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...register('password')}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>

                </div>

                {errors.password && (
                  <p className="field-error">
                    {errors.password.message}
                  </p>
                )}

              </div>


              {/* SERVER ERROR */}

              {serverError && (
                <div className="server-error">
                  {serverError}
                </div>
              )}


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >

                <span className="button-content">

                  {loading ? (
                    <>
                      <span className="spinner" />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in

                      <span>
                        →
                      </span>
                    </>
                  )}

                </span>

              </button>

            </form>


            {/* REGISTER */}

            <p className="register-text">

              Don't have an account?{' '}

              <button
                type="button"
                className="register-link"
                onClick={() =>
                  navigate('/register')
                }
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                Create an account
              </button>

            </p>

          </section>

        </div>

      </div>
    </>
  )
}

export default Login