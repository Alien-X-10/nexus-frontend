import { useState, useEffect, useMemo } from 'react'
import ProblemCard from '../components/ProblemCard'
import api from '../services/api'
import './Problems.css'

function Problems() {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('All')
  const [status, setStatus] = useState('All')
  const [tag, setTag] = useState('All')
  const [favoriteFilter, setFavoriteFilter] = useState('All')

  const [problems, setProblems] = useState([])
  const [solvedProblems, setSolvedProblems] = useState([])
  const [favoriteProblems, setFavoriteProblems] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const problemsPerPage = 10

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/problem/getAllProblem')

        const problemData = Array.isArray(response.data)
          ? response.data
          : response.data.problems || []

        setProblems(problemData)

        const solvedResponse = await api.get(
          '/submission/solved-problems'
        )

        setSolvedProblems(
          solvedResponse.data?.solvedProblems || []
        )

        const favoriteResponse = await api.get(
          '/problem/favorites'
        )

        setFavoriteProblems(
          favoriteResponse.data?.favoriteProblems || []
        )
      } catch (error) {
        console.error('Problems fetch error:', error)

        setError(
          error.response?.data?.message ||
          'Failed to load problems'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [])

  const isProblemSolved = (problemId) => {
    return solvedProblems.some((solvedProblem) => {
      const solvedId =
        typeof solvedProblem === 'object'
          ? solvedProblem._id
          : solvedProblem

      return (
        solvedId?.toString() ===
        problemId?.toString()
      )
    })
  }

  const isProblemFavorite = (problemId) => {
    return favoriteProblems.some((favoriteProblem) => {
      const favoriteId =
        typeof favoriteProblem === 'object'
          ? favoriteProblem._id
          : favoriteProblem

      return (
        favoriteId?.toString() ===
        problemId?.toString()
      )
    })
  }

  const handleFavoriteChange = (problemId, isFavorite) => {
    if (isFavorite) {
      const problem = problems.find(
        (item) =>
          item._id?.toString() ===
          problemId?.toString()
      )

      if (!problem) return

      setFavoriteProblems((previous) => {
        const alreadyExists = previous.some(
          (item) =>
            item._id?.toString() ===
            problemId?.toString()
        )

        if (alreadyExists) return previous

        return [...previous, problem]
      })
    } else {
      setFavoriteProblems((previous) =>
        previous.filter(
          (item) =>
            item._id?.toString() !==
            problemId?.toString()
        )
      )
    }
  }

  const getProblemTags = (problem) => {
    const problemTags =
      problem.tags ||
      problem.topicTags ||
      []

    if (!Array.isArray(problemTags)) {
      return []
    }

    return problemTags
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        return (
          item?.name ||
          item?.title ||
          item?.tag ||
          ''
        )
      })
      .filter(Boolean)
  }

  const allTags = useMemo(() => {
    const tagSet = new Set()

    problems.forEach((problem) => {
      getProblemTags(problem).forEach(
        (problemTag) => tagSet.add(problemTag)
      )
    })

    return [...tagSet].sort((a, b) =>
      a.localeCompare(b)
    )
  }, [problems])

  const filteredProblems = useMemo(() => {
    const searchText = search.trim().toLowerCase()

    return problems.filter((problem) => {
      const title =
        problem.title?.toLowerCase() || ''

      const problemTags =
        getProblemTags(problem)

      const tagsText =
        problemTags.join(' ').toLowerCase()

      const matchesSearch =
        searchText === '' ||
        title.includes(searchText) ||
        tagsText.includes(searchText)

      const matchesDifficulty =
        difficulty === 'All' ||
        problem.difficulty?.toLowerCase() ===
          difficulty.toLowerCase()

      const solved = isProblemSolved(problem._id)

      const matchesStatus =
        status === 'All' ||
        (status === 'Solved' && solved) ||
        (status === 'Unsolved' && !solved)

      const matchesTag =
        tag === 'All' ||
        problemTags.some(
          (problemTag) =>
            problemTag.toLowerCase() ===
            tag.toLowerCase()
        )

      const favorite =
        isProblemFavorite(problem._id)

      const matchesFavorite =
        favoriteFilter === 'All' ||
        (favoriteFilter === 'Favorite' &&
          favorite)

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesStatus &&
        matchesTag &&
        matchesFavorite
      )
    })
  }, [
    problems,
    search,
    difficulty,
    status,
    tag,
    favoriteFilter,
    solvedProblems,
    favoriteProblems
  ])

  const totalPages = Math.ceil(
    filteredProblems.length /
      problemsPerPage
  )

  const safeCurrentPage =
    totalPages === 0
      ? 1
      : Math.min(currentPage, totalPages)

  const startIndex =
    (safeCurrentPage - 1) *
    problemsPerPage

  const paginatedProblems =
    filteredProblems.slice(
      startIndex,
      startIndex + problemsPerPage
    )

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    difficulty,
    status,
    tag,
    favoriteFilter
  ])

  const clearFilters = () => {
    setSearch('')
    setDifficulty('All')
    setStatus('All')
    setTag('All')
    setFavoriteFilter('All')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    difficulty !== 'All' ||
    status !== 'All' ||
    tag !== 'All' ||
    favoriteFilter !== 'All'

  const goToPreviousPage = () => {
    setCurrentPage((previousPage) =>
      Math.max(1, previousPage - 1)
    )
  }

  const goToNextPage = () => {
    setCurrentPage((previousPage) =>
      Math.min(totalPages, previousPage + 1)
    )
  }

  const solvedCount = solvedProblems.length
  const favoriteCount = favoriteProblems.length
  const easyCount = problems.filter(
    (problem) =>
      problem.difficulty?.toLowerCase() === 'easy'
  ).length
  const mediumCount = problems.filter(
    (problem) =>
      problem.difficulty?.toLowerCase() === 'medium'
  ).length
  const hardCount = problems.filter(
    (problem) =>
      problem.difficulty?.toLowerCase() === 'hard'
  ).length

  return (
    <main className="problems-page">
      <div className="problems-background-grid" />

      <div className="problems-glow problems-glow-one" />
      <div className="problems-glow problems-glow-two" />

      <div className="problems-content">
        {/* HEADER */}
        <section className="problems-header">
          <div>
            <div className="problems-eyebrow">
              <span className="eyebrow-dot" />
              CODING ARENA
            </div>

            <h1>
              Problems<span>.</span>
            </h1>

            <p>
              Practice coding problems, sharpen your algorithms,
              and become a better problem solver.
            </p>
          </div>

          <div className="problems-header-stats">
            <div className="header-stat">
              <strong>{problems.length}</strong>
              <span>Total</span>
            </div>

            <div className="header-stat solved-stat">
              <strong>{solvedCount}</strong>
              <span>Solved</span>
            </div>

            <div className="header-stat favorite-stat">
              <strong>{favoriteCount}</strong>
              <span>Favorites</span>
            </div>
          </div>
        </section>

        {/* DIFFICULTY OVERVIEW */}
        {!loading && !error && problems.length > 0 && (
          <section className="difficulty-overview">
            <div className="difficulty-item difficulty-easy">
              <div className="difficulty-icon">✓</div>
              <div>
                <span>Easy</span>
                <strong>{easyCount}</strong>
              </div>
            </div>

            <div className="difficulty-divider" />

            <div className="difficulty-item difficulty-medium">
              <div className="difficulty-icon">◆</div>
              <div>
                <span>Medium</span>
                <strong>{mediumCount}</strong>
              </div>
            </div>

            <div className="difficulty-divider" />

            <div className="difficulty-item difficulty-hard">
              <div className="difficulty-icon">◆</div>
              <div>
                <span>Hard</span>
                <strong>{hardCount}</strong>
              </div>
            </div>
          </section>
        )}

        {/* MAIN PANEL */}
        <section className="problems-panel">
          <div className="panel-top">
            <div>
              <h2>Problem Set</h2>
              <p>
                Find your next challenge and start solving.
              </p>
            </div>

            <div className="result-count">
              <span className="result-count-number">
                {filteredProblems.length}
              </span>
              <span>problems</span>
            </div>
          </div>

          {/* SEARCH */}
          <div className="search-wrapper">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search problems or tags..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

            <div className="search-shortcut">
              SEARCH
            </div>
          </div>

          {/* FILTERS */}
          <div className="filter-row">
            <div className="filter-group">
              <span className="filter-label">
                Difficulty
              </span>

              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value)
                }
              >
                <option value="All">
                  All Difficulties
                </option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">
                Status
              </span>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >
                <option value="All">
                  All Statuses
                </option>
                <option value="Solved">Solved</option>
                <option value="Unsolved">
                  Unsolved
                </option>
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">
                Topic
              </span>

              <select
                value={tag}
                onChange={(e) =>
                  setTag(e.target.value)
                }
              >
                <option value="All">
                  All Tags
                </option>

                {allTags.map((currentTag) => (
                  <option
                    key={currentTag}
                    value={currentTag}
                  >
                    {currentTag}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">
                Saved
              </span>

              <select
                value={favoriteFilter}
                onChange={(e) =>
                  setFavoriteFilter(e.target.value)
                }
              >
                <option value="All">
                  All Problems
                </option>
                <option value="Favorite">
                  Favorites
                </option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Reset filters
              </button>
            )}
          </div>

          {/* RESULT BAR */}
          <div className="result-bar">
            <div className="result-description">
              {filteredProblems.length ===
              problems.length ? (
                <>
                  Showing all{' '}
                  <strong>{problems.length}</strong>{' '}
                  problems
                </>
              ) : (
                <>
                  Showing{' '}
                  <strong>
                    {filteredProblems.length}
                  </strong>{' '}
                  of{' '}
                  <strong>{problems.length}</strong>{' '}
                  problems
                </>
              )}
            </div>

            <div className="active-filter-info">
              {favoriteCount > 0 && (
                <span className="favorite-summary">
                  ★ {favoriteCount} saved
                </span>
              )}

              {hasActiveFilters && (
                <span className="active-pill">
                  Filters active
                </span>
              )}
            </div>
          </div>

          {/* PROBLEM LIST */}
          <div className="problem-list">
            {loading && (
              <div className="problems-state">
                <div className="loader-ring" />
                <h3>Loading problems</h3>
                <p>
                  Preparing your coding arena...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="problems-state error-state">
                <div className="state-icon">!</div>
                <h3>Something went wrong</h3>
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try again
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              filteredProblems.length === 0 && (
                <div className="problems-state">
                  <div className="state-icon search-state-icon">
                    ⌕
                  </div>

                  <h3>
                    {favoriteFilter === 'Favorite'
                      ? 'No saved problems'
                      : 'No problems found'}
                  </h3>

                  <p>
                    {favoriteFilter === 'Favorite'
                      ? 'Save a problem and it will appear here.'
                      : 'Try changing your search or filters.'}
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}

            {!loading &&
              !error &&
              filteredProblems.length > 0 && (
                <>
                  <div className="problem-list-header">
                    <span>Problem</span>
                    <span>Difficulty</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>

                  <div className="problem-card-list">
                    {paginatedProblems.map(
                      (problem, index) => (
                        <div
                          className="problem-row-wrapper"
                          key={problem._id}
                          style={{
                            '--problem-delay': `${index * 35}ms`
                          }}
                        >
                          <ProblemCard
                            problem={problem}
                            isSolved={isProblemSolved(
                              problem._id
                            )}
                            isFavorite={isProblemFavorite(
                              problem._id
                            )}
                            onFavoriteChange={
                              handleFavoriteChange
                            }
                          />
                        </div>
                      )
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        type="button"
                        disabled={
                          safeCurrentPage === 1
                        }
                        onClick={
                          goToPreviousPage
                        }
                      >
                        ← Previous
                      </button>

                      <div className="page-indicator">
                        <span>
                          Page
                        </span>

                        <strong>
                          {safeCurrentPage}
                        </strong>

                        <span>
                          of {totalPages}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={
                          safeCurrentPage ===
                          totalPages
                        }
                        onClick={
                          goToNextPage
                        }
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Problems




// import { useState, useEffect, useMemo } from 'react'
// import ProblemCard from '../components/ProblemCard'
// import api from '../services/api'

// function Problems() {

//   // ==============================
//   // STATE
//   // ==============================

//   const [search, setSearch] = useState('')

//   const [difficulty, setDifficulty] = useState('All')

//   const [status, setStatus] = useState('All')

//   const [tag, setTag] = useState('All')

//   // NEW: Favorite filter
//   const [favoriteFilter, setFavoriteFilter] = useState('All')

//   const [problems, setProblems] = useState([])

//   const [solvedProblems, setSolvedProblems] = useState([])

//   // NEW: Favorite problems
//   const [favoriteProblems, setFavoriteProblems] = useState([])

//   const [loading, setLoading] = useState(true)

//   const [error, setError] = useState('')

//   const [currentPage, setCurrentPage] = useState(1)


//   // ==============================
//   // PAGINATION
//   // ==============================

//   const problemsPerPage = 10


//   // ==============================
//   // FETCH PROBLEMS
//   // ==============================

//   useEffect(() => {

//     const fetchProblems = async () => {

//       try {

//         setLoading(true)

//         setError('')


//         // =================================
//         // FETCH ALL PROBLEMS
//         // =================================

//         const response =
//           await api.get('/problem/getAllProblem')


//         console.log(
//           'All Problems:',
//           response.data
//         )


//         const problemData =
//           Array.isArray(response.data)
//             ? response.data
//             : response.data.problems || []


//         setProblems(problemData)


//         // =================================
//         // FETCH SOLVED PROBLEMS
//         // =================================

//         const solvedResponse =
//           await api.get(
//             '/submission/solved-problems'
//           )


//         console.log(
//           'Solved Problems:',
//           solvedResponse.data
//         )


//         setSolvedProblems(
//           solvedResponse.data?.solvedProblems || []
//         )


//         // =================================
//         // FETCH FAVORITE PROBLEMS
//         // =================================

//         const favoriteResponse =
//           await api.get(
//             '/problem/favorites'
//           )


//         console.log(
//           'Favorite Problems:',
//           favoriteResponse.data
//         )


//         setFavoriteProblems(
//           favoriteResponse.data?.favoriteProblems || []
//         )

//       }

//       catch (error) {

//         console.error(
//           'Problems fetch error:',
//           error
//         )


//         setError(
//           error.response?.data?.message ||
//           'Failed to load problems'
//         )

//       }

//       finally {

//         setLoading(false)

//       }

//     }


//     fetchProblems()

//   }, [])


//   // ==============================
//   // CHECK IF PROBLEM IS SOLVED
//   // ==============================

//   const isProblemSolved = (problemId) => {

//     return solvedProblems.some(
//       (solvedProblem) => {

//         const solvedId =
//           typeof solvedProblem === 'object'
//             ? solvedProblem._id
//             : solvedProblem


//         return (
//           solvedId?.toString() ===
//           problemId?.toString()
//         )

//       }
//     )

//   }


//   // ==============================
//   // CHECK IF PROBLEM IS FAVORITE
//   // ==============================

//   const isProblemFavorite = (problemId) => {

//     return favoriteProblems.some(
//       (favoriteProblem) => {

//         const favoriteId =
//           typeof favoriteProblem === 'object'
//             ? favoriteProblem._id
//             : favoriteProblem

//         return (
//           favoriteId?.toString() ===
//           problemId?.toString()
//         )

//       }
//     )

//   }


//   const handleFavoriteChange = (problemId, isFavorite) => {

//     if (isFavorite) {

//       const problem = problems.find(
//         (item) =>
//           item._id?.toString() === problemId?.toString()
//       )

//       if (!problem) {
//         return
//       }

//       setFavoriteProblems((previous) => {

//         const alreadyExists = previous.some(
//           (item) =>
//             item._id?.toString() === problemId?.toString()
//         )

//         if (alreadyExists) {
//           return previous
//         }

//         return [...previous, problem]

//       })

//     } else {

//       setFavoriteProblems((previous) =>
//         previous.filter(
//           (item) =>
//             item._id?.toString() !== problemId?.toString()
//         )
//       )

//     }

//   }


//   // ==============================
//   // GET PROBLEM TAGS
//   // ==============================

//   const getProblemTags = (problem) => {

//     const problemTags =
//       problem.tags ||
//       problem.topicTags ||
//       []


//     if (!Array.isArray(problemTags)) {
//       return []
//     }


//     return problemTags
//       .map((item) => {

//         if (typeof item === 'string') {
//           return item
//         }


//         return (
//           item?.name ||
//           item?.title ||
//           item?.tag ||
//           ''
//         )

//       })
//       .filter(Boolean)

//   }


//   // ==============================
//   // GET ALL UNIQUE TAGS
//   // ==============================

//   const allTags = useMemo(() => {

//     const tagSet = new Set()


//     problems.forEach((problem) => {

//       const problemTags =
//         getProblemTags(problem)


//       problemTags.forEach((problemTag) => {

//         tagSet.add(problemTag)

//       })

//     })


//     return [...tagSet].sort(
//       (a, b) =>
//         a.localeCompare(b)
//     )

//   }, [problems])


//   // ==============================
//   // FILTER PROBLEMS
//   // ==============================

//   const filteredProblems = useMemo(() => {

//     const searchText =
//       search
//         .trim()
//         .toLowerCase()


//     return problems.filter(
//       (problem) => {

//         // =================================
//         // SEARCH
//         // =================================

//         const title =
//           problem.title
//             ?.toLowerCase() || ''


//         const problemTags =
//           getProblemTags(problem)


//         const tagsText =
//           problemTags
//             .join(' ')
//             .toLowerCase()


//         const matchesSearch =
//           searchText === '' ||
//           title.includes(searchText) ||
//           tagsText.includes(searchText)


//         // =================================
//         // DIFFICULTY
//         // =================================

//         const matchesDifficulty =
//           difficulty === 'All' ||
//           problem.difficulty?.toLowerCase() ===
//           difficulty.toLowerCase()


//         // =================================
//         // SOLVED STATUS
//         // =================================

//         const solved =
//           isProblemSolved(problem._id)


//         const matchesStatus =
//           status === 'All' ||
//           (status === 'Solved' && solved) ||
//           (status === 'Unsolved' && !solved)


//         // =================================
//         // TAG
//         // =================================

//         const matchesTag =
//           tag === 'All' ||
//           problemTags.some(
//             (problemTag) =>
//               problemTag.toLowerCase() ===
//               tag.toLowerCase()
//           )


//         // =================================
//         // FAVORITE
//         // =================================

//         const favorite =
//           isProblemFavorite(problem._id)


//         const matchesFavorite =
//           favoriteFilter === 'All' ||
//           (favoriteFilter === 'Favorite' && favorite)


//         // =================================
//         // FINAL RESULT
//         // =================================

//         return (
//           matchesSearch &&
//           matchesDifficulty &&
//           matchesStatus &&
//           matchesTag &&
//           matchesFavorite
//         )

//       }
//     )

//   }, [
//     problems,
//     search,
//     difficulty,
//     status,
//     tag,
//     favoriteFilter,
//     solvedProblems,
//     favoriteProblems
//   ])


//   // ==============================
//   // PAGINATION
//   // ==============================

//   const totalPages =
//     Math.ceil(
//       filteredProblems.length /
//       problemsPerPage
//     )


//   const safeCurrentPage =
//     totalPages === 0
//       ? 1
//       : Math.min(
//         currentPage,
//         totalPages
//       )


//   const startIndex =
//     (safeCurrentPage - 1) *
//     problemsPerPage


//   const paginatedProblems =
//     filteredProblems.slice(
//       startIndex,
//       startIndex + problemsPerPage
//     )


//   // ==============================
//   // RESET PAGE WHEN FILTER CHANGES
//   // ==============================

//   useEffect(() => {

//     setCurrentPage(1)

//   }, [
//     search,
//     difficulty,
//     status,
//     tag,
//     favoriteFilter
//   ])


//   // ==============================
//   // CLEAR FILTERS
//   // ==============================

//   const clearFilters = () => {

//     setSearch('')

//     setDifficulty('All')

//     setStatus('All')

//     setTag('All')

//     setFavoriteFilter('All')

//     setCurrentPage(1)

//   }


//   // ==============================
//   // ACTIVE FILTER CHECK
//   // ==============================

//   const hasActiveFilters =
//     search.trim() !== '' ||
//     difficulty !== 'All' ||
//     status !== 'All' ||
//     tag !== 'All' ||
//     favoriteFilter !== 'All'


//   // ==============================
//   // PAGE NAVIGATION
//   // ==============================

//   const goToPreviousPage = () => {

//     setCurrentPage(
//       (previousPage) =>
//         Math.max(
//           1,
//           previousPage - 1
//         )
//     )

//   }


//   const goToNextPage = () => {

//     setCurrentPage(
//       (previousPage) =>
//         Math.min(
//           totalPages,
//           previousPage + 1
//         )
//     )

//   }


//   // ==============================
//   // RENDER
//   // ==============================

//   return (

//     <div>

//       {/* ================================= */}
//       {/* PAGE HEADER */}
//       {/* ================================= */}

//       <div className="mb-6">

//         <h1 className="text-3xl font-bold">
//           Problems
//         </h1>


//         <p className="text-base-content/60 mt-2">
//           Practice coding problems and improve your skills.
//         </p>

//       </div>


//       {/* ================================= */}
//       {/* MAIN CARD */}
//       {/* ================================= */}

//       <div className="card bg-base-100 shadow-xl">


//         {/* ================================= */}
//         {/* FILTER SECTION */}
//         {/* ================================= */}

//         <div className="p-4 border-b border-base-300">


//           {/* ================================= */}
//           {/* FILTER ROW */}
//           {/* ================================= */}

//           <div className="flex flex-col lg:flex-row gap-3">


//             {/* ================================= */}
//             {/* SEARCH */}
//             {/* ================================= */}

//             <input
//               type="text"
//               placeholder="Search problems or tags..."
//               className="input input-bordered flex-1"
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
//             />


//             {/* ================================= */}
//             {/* DIFFICULTY */}
//             {/* ================================= */}

//             <select
//               className="select select-bordered"
//               value={difficulty}
//               onChange={(e) =>
//                 setDifficulty(e.target.value)
//               }
//             >

//               <option value="All">
//                 All Difficulties
//               </option>

//               <option value="easy">
//                 Easy
//               </option>

//               <option value="medium">
//                 Medium
//               </option>

//               <option value="hard">
//                 Hard
//               </option>

//             </select>


//             {/* ================================= */}
//             {/* STATUS */}
//             {/* ================================= */}

//             <select
//               className="select select-bordered"
//               value={status}
//               onChange={(e) =>
//                 setStatus(e.target.value)
//               }
//             >

//               <option value="All">
//                 All Statuses
//               </option>

//               <option value="Solved">
//                 Solved
//               </option>

//               <option value="Unsolved">
//                 Unsolved
//               </option>

//             </select>


//             {/* ================================= */}
//             {/* TAG */}
//             {/* ================================= */}

//             <select
//               className="select select-bordered"
//               value={tag}
//               onChange={(e) =>
//                 setTag(e.target.value)
//               }
//             >

//               <option value="All">
//                 All Tags
//               </option>


//               {allTags.map(
//                 (currentTag) => (

//                   <option
//                     key={currentTag}
//                     value={currentTag}
//                   >
//                     {currentTag}
//                   </option>

//                 )
//               )}

//             </select>


//             {/* ================================= */}
//             {/* FAVORITE FILTER */}
//             {/* ================================= */}

//             <select
//               className="select select-bordered"
//               value={favoriteFilter}
//               onChange={(e) =>
//                 setFavoriteFilter(e.target.value)
//               }
//             >

//               <option value="All">
//                 All Problems
//               </option>

//               <option value="Favorite">
//                 ⭐ Favorites
//               </option>

//             </select>


//             {/* ================================= */}
//             {/* CLEAR */}
//             {/* ================================= */}

//             {hasActiveFilters && (

//               <button
//                 className="btn btn-ghost"
//                 onClick={clearFilters}
//               >
//                 Clear
//               </button>

//             )}

//           </div>


//           {/* ================================= */}
//           {/* RESULT INFORMATION */}
//           {/* ================================= */}

//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2">

//             <div className="text-sm text-base-content/60">

//               {filteredProblems.length ===
//                 problems.length ? (

//                 <>
//                   Showing all{' '}
//                   <span className="font-semibold">
//                     {problems.length}
//                   </span>{' '}
//                   problems
//                 </>

//               ) : (

//                 <>
//                   Showing{' '}
//                   <span className="font-semibold">
//                     {filteredProblems.length}
//                   </span>{' '}
//                   of{' '}
//                   <span className="font-semibold">
//                     {problems.length}
//                   </span>{' '}
//                   problems
//                 </>

//               )}

//             </div>


//             <div className="flex items-center gap-4">

//               {/* Favorite count */}

//               <div className="text-sm text-yellow-500">

//                 ⭐ {favoriteProblems.length} Favorites

//               </div>


//               {hasActiveFilters && (

//                 <div className="text-sm text-primary">

//                   Filters active

//                 </div>

//               )}

//             </div>

//           </div>

//         </div>


//         {/* ================================= */}
//         {/* PROBLEM LIST */}
//         {/* ================================= */}

//         <div>


//           {/* ================================= */}
//           {/* LOADING */}
//           {/* ================================= */}

//           {loading && (

//             <div className="p-8 text-center">

//               <span className="loading loading-spinner loading-md"></span>

//               <div className="mt-2">
//                 Loading problems...
//               </div>

//             </div>

//           )}


//           {/* ================================= */}
//           {/* ERROR */}
//           {/* ================================= */}

//           {!loading && error && (

//             <div className="p-8 text-center text-error">

//               {error}

//             </div>

//           )}


//           {/* ================================= */}
//           {/* EMPTY */}
//           {/* ================================= */}

//           {!loading &&
//             !error &&
//             filteredProblems.length === 0 && (

//               <div className="p-8 text-center">

//                 <div className="text-lg font-semibold">
//                   {favoriteFilter === 'Favorite'
//                     ? 'No favorite problems found.'
//                     : 'No problems found.'
//                   }
//                 </div>


//                 <div className="text-sm text-base-content/60 mt-2">

//                   {favoriteFilter === 'Favorite'
//                     ? 'Favorite a problem to see it here.'
//                     : 'Try changing your search or filters.'
//                   }

//                 </div>


//                 {hasActiveFilters && (

//                   <button
//                     className="btn btn-sm btn-outline mt-4"
//                     onClick={clearFilters}
//                   >
//                     Clear Filters
//                   </button>

//                 )}

//               </div>

//             )}


//           {/* ================================= */}
//           {/* PROBLEMS */}
//           {/* ================================= */}

//           {!loading &&
//             !error &&
//             filteredProblems.length > 0 && (

//               <>

//                 {paginatedProblems.map(
//                   (problem) => (

//                     <ProblemCard
//                       key={problem._id}
//                       problem={problem}
//                       isSolved={
//                         isProblemSolved(
//                           problem._id
//                         )
//                       }
//                       isFavorite={
//                         isProblemFavorite(
//                           problem._id
//                         )
//                       }
//                       onFavoriteChange={handleFavoriteChange}
//                     />

//                   )
//                 )}


//                 {/* ================================= */}
//                 {/* PAGINATION */}
//                 {/* ================================= */}

//                 {totalPages > 1 && (

//                   <div className="flex items-center justify-between p-4 border-t border-base-300">


//                     {/* PREVIOUS */}

//                     <button
//                       className="btn btn-sm"
//                       disabled={
//                         safeCurrentPage === 1
//                       }
//                       onClick={
//                         goToPreviousPage
//                       }
//                     >
//                       ← Previous
//                     </button>


//                     {/* PAGE INFORMATION */}

//                     <div className="text-sm text-base-content/70">

//                       Page{' '}

//                       <span className="font-semibold">
//                         {safeCurrentPage}
//                       </span>

//                       {' '}of{' '}

//                       <span className="font-semibold">
//                         {totalPages}
//                       </span>

//                     </div>


//                     {/* NEXT */}

//                     <button
//                       className="btn btn-sm"
//                       disabled={
//                         safeCurrentPage ===
//                         totalPages
//                       }
//                       onClick={
//                         goToNextPage
//                       }
//                     >
//                       Next →
//                     </button>

//                   </div>

//                 )}

//               </>

//             )}

//         </div>

//       </div>

//     </div>

//   )

// }


// export default Problems