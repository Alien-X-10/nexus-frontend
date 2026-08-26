import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import './Profile.css'

function Profile() {

  const [profile, setProfile] = useState(null)
  const [favoriteProblems, setFavoriteProblems] = useState([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [languageFilter, setLanguageFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const [submissionPage, setSubmissionPage] = useState(1)

  const submissionsPerPage = 8


  // =========================================================
  // FETCH PROFILE
  // =========================================================

  const fetchProfile = async (isRefresh = false) => {

    try {

      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const [
        profileResponse,
        favoritesResponse
      ] = await Promise.all([
        api.get('/user/profile'),
        api.get('/problem/favorites')
      ])

      console.log(
        'Profile:',
        profileResponse.data
      )

      console.log(
        'Favorites:',
        favoritesResponse.data
      )

      setProfile(
        profileResponse.data
      )

      setFavoriteProblems(
        favoritesResponse.data?.favoriteProblems || []
      )

    } catch (err) {

      console.error(
        'Profile Error:',
        err
      )

      setError(
        err.response?.data?.message ||
        'Failed to load profile'
      )

    } finally {

      setLoading(false)
      setRefreshing(false)

    }

  }


  useEffect(() => {

    fetchProfile()

  }, [])


  // =========================================================
  // DATA
  // =========================================================

  const user =
    profile?.user || null

  const stats =
    profile?.stats || {}

  const solvedProblems =
    profile?.solvedProblems || []

  const submissions =
    profile?.recentSubmissions || []

  // NEW
  // Submission activity returned by backend

  const submissionActivity =
    profile?.submissionActivity || {}


  const totalProblems =
    stats.totalProblems || 0


  const solvedCount =
    stats.solved || 0


  const acceptanceRate =
    stats.acceptanceRate || 0


  // =========================================================
  // LANGUAGE
  // =========================================================

  const formatLanguage = (language) => {

    if (!language) {
      return '-'
    }

    const languages = {

      'c++': 'C++',

      cpp: 'C++',

      java: 'Java',

      javascript: 'JavaScript'

    }

    return (
      languages[language] ||
      language
    )

  }


  // =========================================================
  // STATUS
  // =========================================================

  const getStatusText = (status) => {

    if (!status) {
      return 'Unknown'
    }

    return typeof status === 'object'
      ? status.description || 'Unknown'
      : status

  }


  const normalizeStatus = (status) => {

    return getStatusText(status)
      .toLowerCase()
      .replace(/[\s-]+/g, '_')

  }


  const formatStatus = (status) => {

    const normalized =
      normalizeStatus(status)

    const statusNames = {

      accepted:
        'Accepted',

      wrong:
        'Wrong Answer',

      wrong_answer:
        'Wrong Answer',

      runtime_error:
        'Runtime Error',

      compile_error:
        'Compile Error',

      tle:
        'Time Limit Exceeded',

      mle:
        'Memory Limit Exceeded',

      pending:
        'Pending'

    }

    return (
      statusNames[normalized] ||
      getStatusText(status)
    )

  }


  const getStatusClass = (status) => {

    const normalized =
      normalizeStatus(status)

    switch (normalized) {

      case 'accepted':
        return 'text-success'

      case 'pending':
        return 'text-warning'

      default:
        return 'text-error'

    }

  }


  const isAccepted = (status) => {

    return (
      normalizeStatus(status) ===
      'accepted'
    )

  }


  // =========================================================
  // DIFFICULTY
  // =========================================================

  const getDifficultyClass = (difficulty) => {

    switch (
      difficulty?.toLowerCase()
    ) {

      case 'easy':
        return 'text-success'

      case 'medium':
        return 'text-warning'

      case 'hard':
        return 'text-error'

      default:
        return 'text-base-content'

    }

  }


  const getDifficultyBadge = (difficulty) => {

    switch (
      difficulty?.toLowerCase()
    ) {

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


  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return '-'
    }

    return new Date(date).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    )

  }


  const formatRelativeTime = (date) => {

    if (!date) {
      return '-'
    }

    const now =
      new Date()

    const created =
      new Date(date)

    const seconds =
      Math.floor(
        (now - created) / 1000
      )

    if (seconds < 60) {
      return 'Just now'
    }

    const minutes =
      Math.floor(
        seconds / 60
      )

    if (minutes < 60) {
      return `${minutes} min ago`
    }

    const hours =
      Math.floor(
        minutes / 60
      )

    if (hours < 24) {
      return `${hours} hr ago`
    }

    const days =
      Math.floor(
        hours / 24
      )

    if (days < 30) {
      return `${days} day${days === 1 ? '' : 's'} ago`
    }

    return formatDate(date)

  }


  // =========================================================
  // PROBLEM ID
  // =========================================================

  const getProblemId = (problem) => {

    return (
      problem?._id ||
      problem?.id ||
      null
    )

  }


  // =========================================================
  // SUBMISSION FILTERING
  // =========================================================

  const filteredSubmissions =
    useMemo(() => {

      const searchValue =
        search
          .trim()
          .toLowerCase()

      return submissions.filter(
        (submission) => {

          const problem =
            submission.problemId

          const title =
            problem?.title ||
            ''

          const matchesSearch =
            title
              .toLowerCase()
              .includes(searchValue)

          const matchesLanguage =
            languageFilter === 'All' ||
            submission.language?.toLowerCase() ===
              languageFilter.toLowerCase()

          const matchesStatus =
            statusFilter === 'All' ||
            normalizeStatus(
              submission.status
            ) === statusFilter

          return (
            matchesSearch &&
            matchesLanguage &&
            matchesStatus
          )

        }
      )

    }, [
      submissions,
      search,
      languageFilter,
      statusFilter
    ])


  useEffect(() => {

    setSubmissionPage(1)

  }, [
    search,
    languageFilter,
    statusFilter
  ])


  // =========================================================
  // SUBMISSION PAGINATION
  // =========================================================

  const totalSubmissionPages =
    Math.ceil(
      filteredSubmissions.length /
      submissionsPerPage
    )


  const currentSubmissionPage =
    totalSubmissionPages === 0
      ? 1
      : Math.min(
          submissionPage,
          totalSubmissionPages
        )


  const startIndex =
    (currentSubmissionPage - 1) *
    submissionsPerPage


  const visibleSubmissions =
    filteredSubmissions.slice(
      startIndex,
      startIndex +
        submissionsPerPage
    )


  // =========================================================
  // PROGRESS
  // =========================================================

  const easySolved =
    stats.easy || 0

  const mediumSolved =
    stats.medium || 0

  const hardSolved =
    stats.hard || 0


  const progressPercentage =
    totalProblems > 0
      ? Math.round(
          (solvedCount / totalProblems) * 100
        )
      : 0


  // =========================================================
  // SUBMISSION ACTIVITY
  // =========================================================

  /*
    We create a 365-day calendar.

    Each day looks like:

    {
      dateKey: "2026-08-20",
      date: Date object,
      count: 5
    }

    The backend gives us:

    {
      "2026-08-20": 5,
      "2026-08-19": 2
    }

    If a date isn't present,
    its submission count is 0.
  */

  const activityWeeks = useMemo(() => {

    const weeks = []

    const today = new Date()

    // Start 365 days ago

    const startDate = new Date(today)

    startDate.setDate(
      startDate.getDate() - 364
    )


    // Move backwards to Sunday

    startDate.setDate(
      startDate.getDate() -
      startDate.getDay()
    )


    // End date

    const endDate = new Date(today)

    // Move forward to Saturday

    endDate.setDate(
      endDate.getDate() +
      (6 - endDate.getDay())
    )


    let currentDate =
      new Date(startDate)


    while (
      currentDate <= endDate
    ) {

      const week = []

      for (
        let day = 0;
        day < 7;
        day++
      ) {

        const date =
          new Date(currentDate)


        const year =
          date.getFullYear()

        const month =
          String(
            date.getMonth() + 1
          ).padStart(2, '0')

        const dayNumber =
          String(
            date.getDate()
          ).padStart(2, '0')


        const dateKey =
          `${year}-${month}-${dayNumber}`


        const count =
          submissionActivity[dateKey] || 0


        week.push({

          dateKey,

          date,

          count

        })


        currentDate.setDate(
          currentDate.getDate() + 1
        )

      }


      weeks.push(week)

    }


    return weeks

  }, [
    submissionActivity
  ])


  // =========================================================
  // ACTIVITY LEVEL
  // =========================================================

  const getActivityLevel = (count) => {

    if (count === 0) {
      return 'bg-base-300'
    }

    if (count <= 2) {
      return 'bg-success/30'
    }

    if (count <= 5) {
      return 'bg-success/50'
    }

    if (count <= 10) {
      return 'bg-success/70'
    }

    return 'bg-success'

  }


  // =========================================================
  // TOTAL ACTIVITY
  // =========================================================

  const totalActivity =
    Object.values(
      submissionActivity
    ).reduce(
      (total, count) =>
        total + count,
      0
    )


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {

    setSearch('')
    setLanguageFilter('All')
    setStatusFilter('All')

  }


  const hasFilters =
    search ||
    languageFilter !== 'All' ||
    statusFilter !== 'All'


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="p-10 text-center">

        <span className="loading loading-spinner loading-lg"></span>

        <p className="mt-4">
          Loading profile...
        </p>

      </div>

    )

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (

      <div className="card bg-base-100 shadow-xl">

        <div className="p-10 text-center">

          <div className="text-error text-lg font-semibold">
            {error}
          </div>

          <button
            className="btn btn-outline mt-5"
            onClick={() =>
              fetchProfile()
            }
          >
            Try Again
          </button>

        </div>

      </div>

    )

  }


  // =========================================================
  // MAIN
  // =========================================================

  return (

    <main className="profile-page">


      {/* =================================================== */}
      {/* PROFILE HEADER */}
      {/* =================================================== */}

      <div className="card bg-base-100 shadow-xl">

        <div className="p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="flex items-center gap-5">

              {/* Avatar */}

              <div className="avatar placeholder">

                <div className="bg-primary text-primary-content rounded-full w-20">

                  <span className="text-2xl font-bold">

                    {user?.firstName
                      ?.charAt(0)
                      ?.toUpperCase() || 'U'}

                  </span>

                </div>

              </div>


              {/* User */}

              <div>

                <h1 className="text-3xl font-bold">

                  {user?.firstName || ''}
                  {' '}
                  {user?.lastName || ''}

                </h1>

                <p className="text-base-content/60 mt-1">
                  {user?.emailId}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">

                  <span className="badge badge-outline">

                    {user?.role || 'user'}

                  </span>

                  {user?.createdAt && (

                    <span className="text-sm text-base-content/60">

                      Member since{' '}

                      {formatDate(
                        user.createdAt
                      )}

                    </span>

                  )}

                </div>

              </div>

            </div>


            {/* Refresh */}

            <button
              className="btn btn-outline"
              onClick={() =>
                fetchProfile(true)
              }
              disabled={refreshing}
            >

              {refreshing ? (

                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Refreshing...
                </>

              ) : (

                <>
                  ↻ Refresh
                </>

              )}

            </button>

          </div>

        </div>

      </div>


      {/* =================================================== */}
      {/* MAIN STATISTICS */}
      {/* =================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">


        {/* Solved */}

        <div className="card bg-base-100 shadow-xl">

          <div className="p-5">

            <div className="text-sm text-base-content/60">
              Problems Solved
            </div>

            <div className="text-3xl font-bold mt-2">
              {solvedCount}
            </div>

          </div>

        </div>


        {/* Submissions */}

        <div className="card bg-base-100 shadow-xl">

          <div className="p-5">

            <div className="text-sm text-base-content/60">
              Submissions
            </div>

            <div className="text-3xl font-bold mt-2">
              {stats.submissions || 0}
            </div>

          </div>

        </div>


        {/* Acceptance */}

        <div className="card bg-base-100 shadow-xl">

          <div className="p-5">

            <div className="text-sm text-base-content/60">
              Acceptance Rate
            </div>

            <div className="text-3xl font-bold mt-2">
              {acceptanceRate}%
            </div>

          </div>

        </div>


        {/* Accepted */}

        <div className="card bg-base-100 shadow-xl">

          <div className="p-5">

            <div className="text-sm text-base-content/60">
              Accepted
            </div>

            <div className="text-3xl font-bold text-success mt-2">
              {stats.accepted || 0}
            </div>

          </div>

        </div>

      </div>


      {/* =================================================== */}
      {/* PROGRESS + DIFFICULTY */}
      {/* =================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* Problem Progress */}

        <div className="card bg-base-100 shadow-xl">

          <div className="p-6">

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-xl font-semibold">
                  Problem Progress
                </h2>

                <p className="text-sm text-base-content/60 mt-1">
                  Your progress across all problems.
                </p>

              </div>

              <div className="text-2xl font-bold">
                {progressPercentage}%
              </div>

            </div>


            <progress
              className="progress progress-primary w-full mt-5"
              value={solvedCount}
              max={totalProblems || 1}
            />


            <div className="flex justify-between text-sm text-base-content/60 mt-2">

              <span>
                {solvedCount} solved
              </span>

              <span>
                {totalProblems} total
              </span>

            </div>


            <div className="grid grid-cols-3 gap-3 mt-6">


              <div className="bg-base-200 rounded-lg p-4">

                <div className="text-success font-semibold">
                  Easy
                </div>

                <div className="text-2xl font-bold mt-1">
                  {easySolved}
                </div>

              </div>


              <div className="bg-base-200 rounded-lg p-4">

                <div className="text-warning font-semibold">
                  Medium
                </div>

                <div className="text-2xl font-bold mt-1">
                  {mediumSolved}
                </div>

              </div>


              <div className="bg-base-200 rounded-lg p-4">

                <div className="text-error font-semibold">
                  Hard
                </div>

                <div className="text-2xl font-bold mt-1">
                  {hardSolved}
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* Difficulty Statistics */}

        <div className="card bg-base-100 shadow-xl">

          <div className="p-6">

            <h2 className="text-xl font-semibold">
              Problem Statistics
            </h2>

            <p className="text-sm text-base-content/60 mt-1">
              Breakdown of your solved problems.
            </p>


            <div className="space-y-6 mt-7">


              {/* Easy */}

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-success font-semibold">
                    Easy
                  </span>

                  <span>
                    {easySolved}
                  </span>

                </div>

                <progress
                  className="progress progress-success w-full"
                  value={easySolved}
                  max={
                    Math.max(
                      easySolved,
                      mediumSolved,
                      hardSolved,
                      1
                    )
                  }
                />

              </div>


              {/* Medium */}

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-warning font-semibold">
                    Medium
                  </span>

                  <span>
                    {mediumSolved}
                  </span>

                </div>

                <progress
                  className="progress progress-warning w-full"
                  value={mediumSolved}
                  max={
                    Math.max(
                      easySolved,
                      mediumSolved,
                      hardSolved,
                      1
                    )
                  }
                />

              </div>


              {/* Hard */}

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-error font-semibold">
                    Hard
                  </span>

                  <span>
                    {hardSolved}
                  </span>

                </div>

                <progress
                  className="progress progress-error w-full"
                  value={hardSolved}
                  max={
                    Math.max(
                      easySolved,
                      mediumSolved,
                      hardSolved,
                      1
                    )
                  }
                />

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================== */}
      {/* FAVORITES */}
      {/* =================================================== */}

      <div className="card bg-base-100 shadow-xl">

        <div className="p-6 border-b border-base-300">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-semibold">
                ⭐ Favorite Problems
              </h2>

              <p className="text-sm text-base-content/60 mt-1">
                Problems you have saved for later.
              </p>

            </div>

            <span className="badge badge-warning">
              {favoriteProblems.length}
            </span>

          </div>

        </div>


        {favoriteProblems.length === 0 ? (

          <div className="p-8 text-center text-base-content/60">

            <div className="text-4xl">
              ☆
            </div>

            <p className="mt-3">
              You haven't favorited any problems yet.
            </p>

            <Link
              to="/problems"
              className="btn btn-sm btn-primary mt-4"
            >
              Browse Problems
            </Link>

          </div>

        ) : (

          <div className="divide-y divide-base-300">

            {favoriteProblems
              .slice(0, 6)
              .map((problem) => {

                const problemId =
                  getProblemId(problem)

                return (

                  <Link
                    key={problemId}
                    to={`/problem/${problemId}`}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-base-300 transition"
                  >

                    <div className="min-w-0">

                      <div className="font-medium truncate">
                        {problem.title}
                      </div>

                      {problem.tags?.length > 0 && (

                        <div className="flex flex-wrap gap-2 mt-2">

                          {problem.tags
                            .slice(0, 3)
                            .map((tag) => (

                              <span
                                key={tag}
                                className="badge badge-outline badge-sm"
                              >
                                {tag}
                              </span>

                            ))}

                        </div>

                      )}

                    </div>


                    <div className="flex items-center gap-3 shrink-0">

                      <span
                        className={`badge ${getDifficultyBadge(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty}
                      </span>

                      <span className="text-warning">
                        ⭐
                      </span>

                    </div>

                  </Link>

                )

              })}


            {favoriteProblems.length > 6 && (

              <div className="p-4 text-center">

                <Link
                  to="/problems"
                  className="btn btn-sm btn-ghost"
                >
                  View all favorites →
                </Link>

              </div>

            )}

          </div>

        )}

      </div>


      {/* =================================================== */}
      {/* SOLVED PROBLEMS */}
      {/* =================================================== */}

      <div className="card bg-base-100 shadow-xl">

        <div className="p-6 border-b border-base-300">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-semibold">
                ✓ Solved Problems
              </h2>

              <p className="text-sm text-base-content/60 mt-1">
                Problems you have successfully solved.
              </p>

            </div>

            <span className="badge badge-success">
              {solvedProblems.length}
            </span>

          </div>

        </div>


        {solvedProblems.length === 0 ? (

          <div className="p-8 text-center text-base-content/60">

            <p>
              No solved problems yet.
            </p>

            <Link
              to="/problems"
              className="btn btn-sm btn-primary mt-4"
            >
              Start Solving
            </Link>

          </div>

        ) : (

          <div className="divide-y divide-base-300">

            {solvedProblems
              .slice(0, 8)
              .map((problem) => {

                const problemId =
                  getProblemId(problem)

                return (

                  <Link
                    key={problemId}
                    to={`/problem/${problemId}`}
                    className="flex items-center justify-between gap-4 p-4 hover:bg-base-300 transition"
                  >

                    <div className="min-w-0">

                      <div className="font-medium">
                        {problem.title}
                      </div>

                      {problem.tags?.length > 0 && (

                        <div className="flex flex-wrap gap-2 mt-2">

                          {problem.tags
                            .slice(0, 3)
                            .map((tag) => (

                              <span
                                key={tag}
                                className="badge badge-outline badge-sm"
                              >
                                {tag}
                              </span>

                            ))}

                        </div>

                      )}

                    </div>


                    <span
                      className={`badge ${getDifficultyBadge(
                        problem.difficulty
                      )}`}
                    >

                      {problem.difficulty}

                    </span>

                  </Link>

                )

              })}


            {solvedProblems.length > 8 && (

              <div className="p-4 text-center">

                <Link
                  to="/problems"
                  className="btn btn-sm btn-ghost"
                >
                  View all solved problems →
                </Link>

              </div>

            )}

          </div>

        )}

      </div>


      {/* =================================================== */}
      {/* RECENT SUBMISSIONS */}
      {/* =================================================== */}

      <div className="card bg-base-100 shadow-xl">

        <div className="p-6 border-b border-base-300">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            <div>

              <h2 className="text-xl font-semibold">
                📝 Recent Submissions
              </h2>

              <p className="text-sm text-base-content/60 mt-1">
                Your latest code submissions.
              </p>

            </div>

            <span className="text-sm text-base-content/60">
              {filteredSubmissions.length} shown
            </span>

          </div>


          {/* Filters */}

          <div className="flex flex-col md:flex-row gap-3 mt-5">

            <input
              type="text"
              placeholder="Search problem..."
              className="input input-bordered flex-1"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />


            <select
              className="select select-bordered"
              value={languageFilter}
              onChange={(e) =>
                setLanguageFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Languages
              </option>

              <option value="c++">
                C++
              </option>

              <option value="java">
                Java
              </option>

              <option value="javascript">
                JavaScript
              </option>

            </select>


            <select
              className="select select-bordered"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Statuses
              </option>

              <option value="accepted">
                Accepted
              </option>

              <option value="wrong">
                Wrong Answer
              </option>

              <option value="runtime_error">
                Runtime Error
              </option>

              <option value="compile_error">
                Compile Error
              </option>

              <option value="tle">
                Time Limit Exceeded
              </option>

              <option value="mle">
                Memory Limit Exceeded
              </option>

              <option value="pending">
                Pending
              </option>

            </select>


            {hasFilters && (

              <button
                className="btn btn-ghost"
                onClick={clearFilters}
              >
                Clear
              </button>

            )}

          </div>

        </div>


        {visibleSubmissions.length === 0 ? (

          <div className="p-8 text-center text-base-content/60">

            No submissions found.

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="table">

              <thead>

                <tr>

                  <th>
                    Problem
                  </th>

                  <th>
                    Language
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Runtime
                  </th>

                  <th>
                    Memory
                  </th>

                  <th>
                    Time
                  </th>

                  <th>
                    View
                  </th>

                </tr>

              </thead>


              <tbody>

                {visibleSubmissions.map(
                  (submission) => {

                    const problem =
                      submission.problemId

                    return (

                      <tr
                        key={
                          submission._id
                        }
                        className="hover:bg-base-300"
                      >

                        <td>

                          {problem ? (

                            <Link
                              to={`/problem/${problem._id}`}
                              className="font-medium hover:text-primary"
                            >
                              {problem.title}
                            </Link>

                          ) : (

                            'Unknown Problem'

                          )}

                        </td>


                        <td>

                          {formatLanguage(
                            submission.language
                          )}

                        </td>


                        <td>

                          <span
                            className={`font-semibold ${getStatusClass(
                              submission.status
                            )}`}
                          >

                            {isAccepted(
                              submission.status
                            ) && '✓ '}

                            {formatStatus(
                              submission.status
                            )}

                          </span>

                        </td>


                        <td>

                          {submission.runtime != null
                            ? `${submission.runtime} ms`
                            : '-'}

                        </td>


                        <td>

                          {submission.memory != null
                            ? `${submission.memory} KB`
                            : '-'}

                        </td>


                        <td className="text-sm text-base-content/60 whitespace-nowrap">

                          {formatRelativeTime(
                            submission.createdAt
                          )}

                        </td>


                        <td>

                          <Link
                            to={`/submission/${submission._id}`}
                            className="btn btn-xs btn-outline"
                          >
                            View
                          </Link>

                        </td>

                      </tr>

                    )

                  }
                )}

              </tbody>

            </table>


            {/* Pagination */}

            {totalSubmissionPages > 1 && (

              <div className="flex items-center justify-between p-4 border-t border-base-300">

                <button
                  className="btn btn-sm"
                  disabled={
                    currentSubmissionPage === 1
                  }
                  onClick={() =>
                    setSubmissionPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                >
                  ← Previous
                </button>


                <span className="text-sm">

                  Page{' '}

                  {currentSubmissionPage}

                  {' '}of{' '}

                  {totalSubmissionPages}

                </span>


                <button
                  className="btn btn-sm"
                  disabled={
                    currentSubmissionPage ===
                    totalSubmissionPages
                  }
                  onClick={() =>
                    setSubmissionPage(
                      (page) =>
                        Math.min(
                          totalSubmissionPages,
                          page + 1
                        )
                    )
                  }
                >
                  Next →
                </button>

              </div>

            )}

          </div>

        )}

      </div>


      {/* =================================================== */}
      {/* SUBMISSION ACTIVITY */}
      {/* =================================================== */}

      <div className="card bg-base-100 shadow-xl">

        <div className="p-6">

          {/* HEADER */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            <div>

              <h2 className="text-xl font-semibold">
                📅 Submission Activity
              </h2>

              <p className="text-sm text-base-content/60 mt-1">
                Your coding activity over the last year.
              </p>

            </div>


            <div className="text-sm text-base-content/60">

              {totalActivity}{' '}

              {totalActivity === 1
                ? 'submission'
                : 'submissions'}

            </div>

          </div>


          {/* CALENDAR */}

          <div className="overflow-x-auto mt-6">

            <div className="min-w-[900px]">


              {/* MONTH LABELS */}

              <div className="flex ml-10 mb-2">

                {activityWeeks.map(
                  (week, index) => {

                    const firstDay =
                      week[0]?.date

                    if (!firstDay) {
                      return null
                    }


                    const previousWeek =
                      activityWeeks[index - 1]


                    const previousMonth =
                      previousWeek?.[0]?.date?.getMonth()


                    const currentMonth =
                      firstDay.getMonth()


                    const isFirstWeek =
                      index === 0


                    if (
                      isFirstWeek ||
                      currentMonth !==
                      previousMonth
                    ) {

                      return (

                        <div
                          key={index}
                          className="w-4 mr-1 text-xs text-base-content/60"
                        >

                          {firstDay.toLocaleString(
                            'default',
                            {
                              month: 'short'
                            }
                          )}

                        </div>

                      )

                    }


                    return (

                      <div
                        key={index}
                        className="w-4 mr-1"
                      />

                    )

                  }
                )}

              </div>


              {/* CALENDAR BODY */}

              <div className="flex">


                {/* DAY LABELS */}

                <div className="w-10 flex flex-col gap-1 mr-1">

                  <div className="h-4" />

                  <div className="h-4 text-xs text-base-content/50">
                    Mon
                  </div>

                  <div className="h-4" />

                  <div className="h-4 text-xs text-base-content/50">
                    Wed
                  </div>

                  <div className="h-4" />

                  <div className="h-4 text-xs text-base-content/50">
                    Fri
                  </div>

                  <div className="h-4" />

                </div>


                {/* WEEKS */}

                <div className="flex gap-1">

                  {activityWeeks.map(
                    (week, weekIndex) => (

                      <div
                        key={weekIndex}
                        className="flex flex-col gap-1"
                      >

                        {week.map(
                          (day) => (

                            <div
                              key={day.dateKey}
                              className={`w-4 h-4 rounded-sm ${getActivityLevel(
                                day.count
                              )} cursor-pointer transition hover:ring-2 hover:ring-primary`}
                              title={`${day.count} submission${day.count === 1 ? '' : 's'} on ${day.date.toLocaleDateString(
                                undefined,
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }
                              )}`}
                            />

                          )
                        )}

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* LEGEND */}

              <div className="flex items-center justify-end gap-2 mt-4">

                <span className="text-xs text-base-content/60">
                  Less
                </span>


                <div className="w-4 h-4 rounded-sm bg-base-300" />

                <div className="w-4 h-4 rounded-sm bg-success/30" />

                <div className="w-4 h-4 rounded-sm bg-success/50" />

                <div className="w-4 h-4 rounded-sm bg-success/70" />

                <div className="w-4 h-4 rounded-sm bg-success" />


                <span className="text-xs text-base-content/60">
                  More
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


    </main>

  )

}

export default Profile