import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import './SubmissionDetails.css'

function SubmissionDetails() {

  const { submissionId } = useParams()

  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {

    const fetchSubmission = async () => {

      try {

        setLoading(true)
        setError('')

        const response = await api.get(
          `/submission/${submissionId}`
        )

        console.log('Submission Details:', response.data)

        setSubmission(
          response.data.submission ||
          response.data
        )

      } catch (err) {

        console.error(
          'Submission Details Error:',
          err
        )

        setError(
          err.response?.data?.message ||
          'Failed to load submission'
        )

      } finally {

        setLoading(false)

      }
    }

    if (submissionId) {
      fetchSubmission()
    }

  }, [submissionId])


  // ==========================================
  // STATUS
  // ==========================================

  const getStatusText = (status) => {

    if (!status) return 'Unknown'

    if (typeof status === 'object') {
      return (
        status.description ||
        status.name ||
        'Unknown'
      )
    }

    return String(status)
  }


  const normalizeStatus = (status) => {

    return getStatusText(status)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
  }


  const getStatusClass = (status) => {

    switch (normalizeStatus(status)) {

      case 'accepted':
        return 'text-success'

      case 'wrong':
      case 'wrong_answer':
      case 'compile_error':
      case 'runtime_error':
        return 'text-error'

      case 'tle':
      case 'time_limit_exceeded':
        return 'text-warning'

      case 'pending':
        return 'text-info'

      case 'mle':
      case 'memory_limit_exceeded':
        return 'text-error'

      default:
        return 'text-base-content'

    }
  }


  const getStatusIcon = (status) => {

    switch (normalizeStatus(status)) {

      case 'accepted':
        return '✓'

      case 'wrong':
      case 'wrong_answer':
      case 'compile_error':
      case 'runtime_error':
      case 'mle':
      case 'memory_limit_exceeded':
        return '✗'

      case 'pending':
        return '⏳'

      case 'tle':
      case 'time_limit_exceeded':
        return '⏱'

      default:
        return '!'
    }
  }


  // ==========================================
  // LANGUAGE
  // ==========================================

  const formatLanguage = (language) => {

    if (!language) return '-'

    const languages = {
      'c++': 'C++',
      cpp: 'C++',
      java: 'Java',
      javascript: 'JavaScript',
      js: 'JavaScript'
    }

    const normalized = String(language).toLowerCase()

    return languages[normalized] || language
  }


  // ==========================================
  // DIFFICULTY
  // ==========================================

  const getDifficultyClass = (difficulty) => {

    switch (String(difficulty).toLowerCase()) {

      case 'easy':
        return 'badge-success'

      case 'medium':
        return 'badge-warning'

      case 'hard':
        return 'badge-error'

      default:
        return 'badge-outline'
    }
  }


  // ==========================================
  // DATE
  // ==========================================

  const formatDate = (date) => {

    if (!date) return '-'

    try {

      return new Date(date).toLocaleString(
        undefined,
        {
          dateStyle: 'medium',
          timeStyle: 'short'
        }
      )

    } catch {

      return '-'

    }
  }


  // ==========================================
  // COPY CODE
  // ==========================================

  const handleCopyCode = async () => {

    if (!submission?.code) return

    try {

      await navigator.clipboard.writeText(
        submission.code
      )

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)

    } catch (err) {

      console.error(
        'Copy failed:',
        err
      )

    }
  }


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="text-center">

          <span className="loading loading-spinner loading-lg"></span>

          <p className="mt-4 text-base-content/60">
            Loading submission...
          </p>

        </div>

      </div>

    )
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (

      <div className="min-h-[60vh] flex items-center justify-center px-4">

        <div className="card bg-base-100 shadow-xl max-w-lg w-full">

          <div className="card-body text-center">

            <div className="text-5xl mb-4">
              ⚠️
            </div>

            <h2 className="text-xl font-bold">
              Unable to Load Submission
            </h2>

            <p className="text-error mt-2">
              {error}
            </p>

            <div className="flex justify-center gap-3 mt-6">

              <Link
                to="/profile"
                className="btn btn-outline"
              >
                ← Profile
              </Link>

              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>

            </div>

          </div>

        </div>

      </div>

    )
  }


  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!submission) {

    return (

      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-4">
            🔍
          </div>

          <h2 className="text-xl font-bold">
            Submission Not Found
          </h2>

          <p className="text-base-content/60 mt-2">
            This submission does not exist.
          </p>

          <Link
            to="/profile"
            className="btn btn-outline mt-6"
          >
            ← Back to Profile
          </Link>

        </div>

      </div>

    )
  }


  // ==========================================
  // PROBLEM
  // ==========================================

  const problem =
    submission.problemId ||
    submission.problem

  const statusText =
    getStatusText(submission.status)

  const normalizedStatus =
    normalizeStatus(submission.status)

  const isAccepted =
    normalizedStatus === 'accepted'


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="submission-details-page space-y-6">

      {/* NAVIGATION */}

      <div className="flex flex-wrap gap-3">

        <Link
          to="/profile"
          className="btn btn-ghost"
        >
          ← Back to Profile
        </Link>

        {problem?._id && (

          <Link
            to={`/problem/${problem._id}`}
            className="btn btn-outline"
          >
            View Problem →
          </Link>

        )}

      </div>


      {/* HEADER */}

      <div>

        <h1 className="text-3xl font-bold">
          Submission Details
        </h1>

        <p className="text-base-content/60 mt-2">
          View details of your code submission.
        </p>

      </div>


      {/* MAIN CARD */}

      <div className="card bg-base-100 shadow-xl">

        <div className="card-body">


          {/* PROBLEM + STATUS */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h2 className="text-2xl font-bold">
                  {problem?.title || 'Unknown Problem'}
                </h2>

                {isAccepted && (

                  <span className="text-success font-semibold">
                    ✓ Solved
                  </span>

                )}

              </div>


              <div className="flex items-center gap-3 mt-2">

                <span className="text-base-content/60">
                  {formatLanguage(submission.language)}
                </span>

                {problem?.difficulty && (

                  <span
                    className={`badge ${getDifficultyClass(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>

                )}

              </div>

            </div>


            {/* STATUS */}

            <div
              className={`text-lg font-bold ${getStatusClass(
                submission.status
              )}`}
            >

              {getStatusIcon(submission.status)}
              {' '}
              {statusText}

            </div>

          </div>


          {/* STATISTICS */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">


            <div className="bg-base-200 rounded-lg p-4">

              <div className="text-sm opacity-60">
                Runtime
              </div>

              <div className="text-lg font-bold mt-1">
                {submission.runtime ?? 0} ms
              </div>

            </div>


            <div className="bg-base-200 rounded-lg p-4">

              <div className="text-sm opacity-60">
                Memory
              </div>

              <div className="text-lg font-bold mt-1">
                {submission.memory ?? 0} KB
              </div>

            </div>


            <div className="bg-base-200 rounded-lg p-4">

              <div className="text-sm opacity-60">
                Test Cases
              </div>

              <div className="text-lg font-bold mt-1">
                {submission.testCasesPassed ?? 0}
                {' / '}
                {submission.testCasesTotal ?? 0}
              </div>

            </div>


            <div className="bg-base-200 rounded-lg p-4">

              <div className="text-sm opacity-60">
                Language
              </div>

              <div className="text-lg font-bold mt-1">
                {formatLanguage(submission.language)}
              </div>

            </div>

          </div>


          {/* DATE */}

          <div className="mt-6">

            <div className="text-sm text-base-content/60">
              Submitted on
            </div>

            <div className="font-medium mt-1">
              {formatDate(submission.createdAt)}
            </div>

          </div>


          {/* ERROR */}

          {submission.errorMessage && (

            <div className="mt-6">

              <h3 className="text-lg font-bold mb-2">
                Error
              </h3>

              <pre className="bg-error/10 text-error border border-error/30 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
                {submission.errorMessage}
              </pre>

            </div>

          )}


          {/* CODE */}

          <div className="mt-6">

            <div className="flex items-center justify-between mb-2">

              <h3 className="text-lg font-bold">
                Submitted Code
              </h3>

              {submission.code && (

                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={handleCopyCode}
                >
                  {copied
                    ? '✓ Copied'
                    : '📋 Copy Code'}
                </button>

              )}

            </div>


            {submission.code ? (

              <pre className="bg-base-300 rounded-lg p-5 overflow-x-auto text-sm leading-relaxed max-h-[700px] overflow-y-auto">

                <code>
                  {submission.code}
                </code>

              </pre>

            ) : (

              <div className="bg-base-200 rounded-lg p-6 text-center">

                <p className="text-base-content/60">
                  Submitted code is not available.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* BOTTOM */}

      <div className="flex justify-between gap-3">

        <Link
          to="/profile"
          className="btn btn-outline"
        >
          ← Back to Profile
        </Link>

        {problem?._id && (

          <Link
            to={`/problem/${problem._id}`}
            className="btn btn-primary"
          >
            Solve Problem →
          </Link>

        )}

      </div>

    </div>

  )
}

export default SubmissionDetails