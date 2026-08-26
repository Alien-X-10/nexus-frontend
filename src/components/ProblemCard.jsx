import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function ProblemCard({
  problem,
  isSolved,
  isFavorite = false,
  onFavoriteChange
}) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // ==========================================
  // FAVORITE / UNFAVORITE
  // ==========================================
  const handleFavorite = async (e) => {
    // Prevent clicking the star from opening
    // the problem page
    e.preventDefault()
    e.stopPropagation()

    // Prevent double clicking while request
    // is already running
    if (favoriteLoading) {
      return
    }

    try {
      setFavoriteLoading(true)

      if (favorite) {
        // =====================================
        // REMOVE FROM FAVORITES
        // =====================================
        await api.delete(
          `/problem/favorite/${problem._id}`
        )

        setFavorite(false)

        if (onFavoriteChange) {
          onFavoriteChange(
            problem._id,
            false
          )
        }
      } else {
        // =====================================
        // ADD TO FAVORITES
        // =====================================
        await api.post(
          `/problem/favorite/${problem._id}`
        )

        setFavorite(true)

        if (onFavoriteChange) {
          onFavoriteChange(
            problem._id,
            true
          )
        }
      }
    } catch (error) {
      console.error(
        'Favorite error:',
        error
      )
    } finally {
      setFavoriteLoading(false)
    }
  }

  // ==========================================
  // DIFFICULTY
  // ==========================================
  const difficultyClass =
    problem.difficulty === 'easy'
      ? 'badge-success'
      : problem.difficulty === 'medium'
        ? 'badge-warning'
        : 'badge-error'

  const difficultyText = problem.difficulty
    ? problem.difficulty.charAt(0).toUpperCase() +
      problem.difficulty.slice(1)
    : 'Unknown'

  return (
    <div
      className="
        grid
        grid-cols-[minmax(0,1fr)_130px_130px_80px]
        items-center
        min-h-[64px]
        px-5
        border-b
        border-base-300
        hover:bg-base-300/40
        transition-colors
      "
    >

      {/* ======================================
          PROBLEM
          ====================================== */}
      <div className="min-w-0">

        <Link
          to={`/problem/${problem._id}`}
          className="
            font-semibold
            text-base-content
            hover:text-primary
            transition-colors
          "
        >
          {problem.title}
        </Link>

      </div>


      {/* ======================================
          DIFFICULTY
          ====================================== */}
      <div className="flex items-center">
        <span
          className={`
            badge
            ${difficultyClass}
            font-medium
          `}
        >
          {difficultyText}
        </span>
      </div>


      {/* ======================================
          STATUS
          ====================================== */}
      <div className="flex items-center">

        {isSolved ? (
          <span
            className="
              text-success
              font-semibold
              whitespace-nowrap
            "
          >
            ✓ Solved
          </span>
        ) : (
          <span
            className="
              text-base-content/40
            "
          >
            —
          </span>
        )}

      </div>


      {/* ======================================
          ACTION / FAVORITE
          ====================================== */}
      <div className="flex items-center justify-start">

        <button
          type="button"
          onClick={handleFavorite}
          disabled={favoriteLoading}
          className={`
            btn
            btn-ghost
            btn-sm
            text-xl
            min-h-0
            h-9
            w-9
            p-0
            ${favorite
              ? 'text-warning'
              : 'text-base-content/40'
            }
            ${favoriteLoading
              ? 'loading'
              : ''
            }
          `}
          title={
            favorite
              ? 'Remove from favorites'
              : 'Add to favorites'
          }
        >
          {favorite ? '★' : '☆'}
        </button>

      </div>

    </div>
  )
}

export default ProblemCard