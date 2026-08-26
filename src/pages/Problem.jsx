import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import Editor from '@monaco-editor/react'
import './Problem.css'

const starterCode = {
  'c++': `#include <bits/stdc++.h>
using namespace std;

int main() {

    return 0;
}`,

  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {

    }
}`,

  javascript: `const fs = require("fs");

const input = fs.readFileSync(0, "utf8");

console.log(input);`
}

const languageLabels = {
  'c++': 'C++',
  java: 'Java',
  javascript: 'JavaScript'
}

/* =========================================================
   STATUS + SUBMISSION HELPERS
========================================================= */

const normalizeSubmissionStatus = (status) => {
  if (!status) return 'unknown'

  const raw =
    typeof status === 'object'
      ? status.description || status.id || status.status
      : status

  const value = String(raw).toLowerCase().trim()

  if (['accepted', 'accepted.', '3'].includes(value)) return 'accepted'
  if (['wrong', 'wrong answer', 'wrong_answer', '4'].includes(value)) return 'wrong'
  if (['compile_error', 'compilation error', 'compilation_error', '6'].includes(value)) return 'compile_error'
  if (['runtime_error', 'runtime error', '7', '11', '12', '13', '14'].includes(value)) return 'runtime_error'
  if (['tle', 'time limit exceeded', 'time_limit_exceeded', '5'].includes(value)) return 'tle'
  if (['pending', 'queued', 'processing', 'in queue'].includes(value)) return 'pending'
  if (['error', 'internal error'].includes(value)) return 'error'

  return value
}

const formatSubmissionDate = (date) => {
  if (!date) return '-'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return '-'

  return parsedDate.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const getSubmissionPassedCount = (submission) => {
  if (
    submission?.testCasesPassed !== undefined &&
    submission?.testCasesPassed !== null
  ) {
    return Number(submission.testCasesPassed)
  }

  if (Array.isArray(submission?.testCases)) {
    return submission.testCases.filter(
      (test) =>
        test?.status?.id === 3 ||
        normalizeSubmissionStatus(test?.status) === 'accepted'
    ).length
  }

  return null
}

const getSubmissionTotalCount = (submission) => {
  if (
    submission?.testCasesTotal !== undefined &&
    submission?.testCasesTotal !== null
  ) {
    return Number(submission.testCasesTotal)
  }

  if (Array.isArray(submission?.testCases)) {
    return submission.testCases.length
  }

  return null
}

const getStatusLabel = (status) => {
  switch (normalizeSubmissionStatus(status)) {
    case 'accepted':
      return 'Accepted'
    case 'wrong':
      return 'Wrong Answer'
    case 'compile_error':
      return 'Compilation Error'
    case 'runtime_error':
      return 'Runtime Error'
    case 'tle':
      return 'Time Limit Exceeded'
    case 'pending':
      return 'Pending'
    case 'error':
      return 'Error'
    default:
      return status || 'Unknown'
  }
}

const getStatusClassName = (status) => {
  switch (normalizeSubmissionStatus(status)) {
    case 'accepted':
      return 'text-success'

    case 'tle':
    case 'pending':
      return 'text-warning'

    case 'wrong':
    case 'compile_error':
    case 'runtime_error':
    case 'error':
      return 'text-error'

    default:
      return 'text-base-content'
  }
}

/* =========================================================
   STATUS HELPER
========================================================= */

const getStatusInfo = (result, resultType) => {
  if (!result) {
    return {
      key: null,
      label: '',
      icon: '',
      className: ''
    }
  }

  if (
    result.status === 'error' ||
    (result.success === false && !result.result)
  ) {
    return {
      key: 'error',
      label: 'Error',
      icon: '✗',
      className: 'text-error'
    }
  }

  if (resultType === 'submit' && result.submission?.status) {
    switch (normalizeSubmissionStatus(result.submission.status)) {
      case 'accepted':
        return {
          key: 'accepted',
          label: 'Accepted',
          icon: '✓',
          className: 'text-success'
        }

      case 'wrong':
        return {
          key: 'wrong',
          label: 'Wrong Answer',
          icon: '✗',
          className: 'text-error'
        }

      case 'compile_error':
        return {
          key: 'compile_error',
          label: 'Compilation Error',
          icon: '✗',
          className: 'text-error'
        }

      case 'runtime_error':
        return {
          key: 'runtime_error',
          label: 'Runtime Error',
          icon: '✗',
          className: 'text-error'
        }

      case 'tle':
        return {
          key: 'tle',
          label: 'Time Limit Exceeded',
          icon: '⚠',
          className: 'text-warning'
        }

      case 'error':
        return {
          key: 'error',
          label: 'Error',
          icon: '✗',
          className: 'text-error'
        }

      default:
        return {
          key: 'wrong',
          label: 'Wrong Answer',
          icon: '✗',
          className: 'text-error'
        }
    }
  }

  if (resultType === 'custom') {
    switch (normalizeSubmissionStatus(result.status)) {
      case 'accepted':
        return {
          key: 'accepted',
          label: 'Accepted',
          icon: '✓',
          className: 'text-success'
        }

      case 'compile_error':
        return {
          key: 'compile_error',
          label: 'Compilation Error',
          icon: '✗',
          className: 'text-error'
        }

      case 'runtime_error':
        return {
          key: 'runtime_error',
          label: 'Runtime Error',
          icon: '✗',
          className: 'text-error'
        }

      case 'tle':
        return {
          key: 'tle',
          label: 'Time Limit Exceeded',
          icon: '⚠',
          className: 'text-warning'
        }

      case 'wrong':
        return {
          key: 'wrong',
          label: 'Wrong Answer',
          icon: '✗',
          className: 'text-error'
        }

      default:
        return {
          key: 'error',
          label: 'Error',
          icon: '✗',
          className: 'text-error'
        }
    }
  }

  if (
    resultType === 'run' &&
    Array.isArray(result.result)
  ) {
    const tests = result.result

    if (
      tests.length > 0 &&
      tests.every(
        (test) => test.status?.id === 3
      )
    ) {
      return {
        key: 'accepted',
        label: 'Accepted',
        icon: '✓',
        className: 'text-success'
      }
    }

    if (
      tests.some(
        (test) => test.status?.id === 6
      )
    ) {
      return {
        key: 'compile_error',
        label: 'Compilation Error',
        icon: '✗',
        className: 'text-error'
      }
    }

    if (
      tests.some(
        (test) => test.status?.id === 5
      )
    ) {
      return {
        key: 'tle',
        label: 'Time Limit Exceeded',
        icon: '⚠',
        className: 'text-warning'
      }
    }

    if (
      tests.some(
        (test) =>
          test.status?.id === 7 ||
          test.status?.id === 11
      )
    ) {
      return {
        key: 'runtime_error',
        label: 'Runtime Error',
        icon: '✗',
        className: 'text-error'
      }
    }

    return {
      key: 'wrong',
      label: 'Wrong Answer',
      icon: '✗',
      className: 'text-error'
    }
  }

  return {
    key: 'error',
    label: 'Error',
    icon: '✗',
    className: 'text-error'
  }
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function Problem() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [problem, setProblem] = useState(null)
  const [allProblems, setAllProblems] = useState([])

  const [language, setLanguage] = useState('c++')

  // Controls the custom language dropdown.
  const [languageOpen, setLanguageOpen] = useState(false)

  const [selectedTestCase, setSelectedTestCase] =
    useState(0)

  const [testView, setTestView] =
    useState('cases')

  const [customInput, setCustomInput] =
    useState('')

  /* =====================================================
     CODE STATE
  ===================================================== */

  const [codes, setCodes] = useState({
    'c++': starterCode['c++'],
    java: starterCode.java,
    javascript: starterCode.javascript
  })

  const [codeSaved, setCodeSaved] = useState(true)

  const [restoredDraft, setRestoredDraft] =
    useState(false)

  /* =====================================================
     RESULT STATE
  ===================================================== */

  const [result, setResult] = useState(null)

  const [runLoading, setRunLoading] =
    useState(false)

  const [customLoading, setCustomLoading] =
    useState(false)

  const [submitLoading, setSubmitLoading] =
    useState(false)

  const [resultType, setResultType] =
    useState(null)

  /* =====================================================
     SOLVED STATE
  ===================================================== */

  const [solvedProblems, setSolvedProblems] =
    useState([])

  /* =====================================================
     EDITOR SETTINGS
  ===================================================== */

  const [isFullscreen, setIsFullscreen] =
    useState(false)

  const [showSettings, setShowSettings] =
    useState(false)

  const [fontSize, setFontSize] =
    useState(14)

  const [wordWrap, setWordWrap] =
    useState('off')

  const [editorMinimap, setEditorMinimap] =
    useState(false)

  /* =====================================================
     FAVORITE
  ===================================================== */

  const [isFavorite, setIsFavorite] =
    useState(false)

  const [favoriteLoading, setFavoriteLoading] =
    useState(false)

  /* =====================================================
     SUBMISSIONS
  ===================================================== */

  const [recentSubmissions, setRecentSubmissions] =
    useState([])

  const [submissionsLoading, setSubmissionsLoading] =
    useState(false)

  const [submissionPage, setSubmissionPage] =
    useState(1)

  const [submissionPageSize, setSubmissionPageSize] =
    useState(5)

  const [submissionStatusFilter, setSubmissionStatusFilter] =
    useState('all')

  const [submissionLanguageFilter, setSubmissionLanguageFilter] =
    useState('all')

  /* =====================================================
     HINTS
  ===================================================== */

  const [showHints, setShowHints] =
    useState(false)

  const [openHint, setOpenHint] =
    useState(null)

  /* =====================================================
     DISCUSSION
  ===================================================== */

  const [discussions, setDiscussions] =
    useState([])

  const [discussionLoading, setDiscussionLoading] =
    useState(false)

  const [discussionPosting, setDiscussionPosting] =
    useState(false)

  const [discussionContent, setDiscussionContent] =
    useState('')

  const [discussionError, setDiscussionError] =
    useState('')

  /* =====================================================
     SOLUTION
  ===================================================== */

  const [showSolution, setShowSolution] =
    useState(false)

  /* =====================================================
     REFS
  ===================================================== */

  const editorPanelRef = useRef(null)

  const editorRef = useRef(null)

  const saveTimerRef = useRef(null)

  const code = codes[language]

  /* =========================================================
     LOCAL STORAGE KEYS
  ========================================================= */

  const getStorageKey = (
    problemId,
    selectedLanguage
  ) => {
    return `leetcode-draft-${problemId}-${selectedLanguage}`
  }

  /* =========================================================
     FETCH PROBLEM
  ========================================================= */

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setProblem(null)

        const response = await api.get(
          `/problem/problemById/${id}`
        )

        setProblem(response.data)

        setSelectedTestCase(0)

        /* ================================
           SOLVED PROBLEMS
        ================================= */

        try {
          const solvedResponse =
            await api.get(
              '/submission/solved-problems'
            )

          setSolvedProblems(
            solvedResponse.data.solvedProblems || []
          )
        } catch (solvedError) {
          console.error(
            'Could not load solved problems:',
            solvedError
          )
        }

        /* ================================
           ALL PROBLEMS
        ================================= */

        try {
          const problemsResponse =
            await api.get(
              '/problem/getAllProblem'
            )

          const problemsList =
            Array.isArray(problemsResponse.data)
              ? problemsResponse.data
              : []

          setAllProblems(problemsList)
        } catch (problemListError) {
          console.error(
            'Could not load problem list:',
            problemListError
          )
        }

        /* ================================
           FAVORITE
        ================================= */

        try {
          const favoriteResponse =
            await api.get('/problem/favorites')

          const favoriteProblems =
            favoriteResponse.data?.favoriteProblems || []

          const favorite =
            favoriteProblems.some(
              (favoriteProblem) =>
                (favoriteProblem?._id || favoriteProblem?.id)?.toString() ===
                id?.toString()
            )

          setIsFavorite(favorite)

        } catch (favoriteError) {
          console.error(
            'Could not load favorite state:',
            favoriteError
          )

          setIsFavorite(false)
        }

      } catch (error) {
        console.error(
          'Failed to load problem:',
          error
        )
      }
    }

    fetchProblem()
  }, [id])

  /* =========================================================
     LOAD SAVED CODE WHEN PROBLEM CHANGES
  ========================================================= */

  useEffect(() => {
    if (!problem || !id) return

    const loadedCodes = {
      'c++': starterCode['c++'],
      java: starterCode.java,
      javascript: starterCode.javascript
    }

    Object.keys(loadedCodes).forEach(
      (lang) => {
        const savedCode =
          localStorage.getItem(
            getStorageKey(id, lang)
          )

        if (savedCode !== null) {
          loadedCodes[lang] = savedCode
        }
      }
    )

    setCodes(loadedCodes)

    setCodeSaved(true)

    const currentSavedCode =
      localStorage.getItem(
        getStorageKey(id, language)
      )

    if (
      currentSavedCode !== null &&
      currentSavedCode !==
        starterCode[language]
    ) {
      setRestoredDraft(true)
    } else {
      setRestoredDraft(false)
    }

  }, [problem, id])

  /* =========================================================
     FULLSCREEN LISTENER
  ========================================================= */

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ===
          editorPanelRef.current
      )
    }

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange
    )

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange
      )
    }
  }, [])

  /* =========================================================
     KEYBOARD SHORTCUTS
  ========================================================= */

  useEffect(() => {
    const handleKeyboardShortcuts = (event) => {
      if (!event.ctrlKey) return

      if (
        event.key === 'Enter' &&
        !event.shiftKey
      ) {
        event.preventDefault()

        if (
          !runLoading &&
          !customLoading &&
          !submitLoading
        ) {
          runCode()
        }
      }

      if (
        event.shiftKey &&
        event.key === 'Enter'
      ) {
        event.preventDefault()

        if (
          !runLoading &&
          !customLoading &&
          !submitLoading
        ) {
          submitCode()
        }
      }

      if (
        event.key.toLowerCase() === 's'
      ) {
        event.preventDefault()

        saveCodeManually()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyboardShortcuts
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyboardShortcuts
      )
    }
  }, [
    code,
    language,
    id,
    runLoading,
    customLoading,
    submitLoading
  ])

  /* =========================================================
     AUTO SAVE
  ========================================================= */

  useEffect(() => {
    if (!problem || !id) return

    setCodeSaved(false)

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current =
      setTimeout(() => {
        try {
          localStorage.setItem(
            getStorageKey(id, language),
            code
          )

          setCodeSaved(true)
        } catch (error) {
          console.error(
            'Could not save code:',
            error
          )
        }
      }, 700)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(
          saveTimerRef.current
        )
      }
    }
  }, [
    code,
    language,
    id,
    problem
  ])

  /* =========================================================
     SOLVED
  ========================================================= */

  const isSolved =
    solvedProblems.some(
      (solvedProblem) =>
        solvedProblem._id === id
    )

  /* =========================================================
     CLEAR RESULT
  ========================================================= */

  const clearResult = () => {
    setResult(null)
    setResultType(null)
  }

  /* =========================================================
     CODE CHANGE
  ========================================================= */

  const handleCodeChange = (value) => {
    setCodes((prev) => ({
      ...prev,
      [language]: value || ''
    }))

    setCodeSaved(false)

    setRestoredDraft(false)

    if (result) {
      setResult(null)
      setResultType(null)
    }
  }

  /* =========================================================
     LANGUAGE CHANGE
  ========================================================= */

  const handleLanguageChange = (
    newLanguage
  ) => {
    setLanguage(newLanguage)

    setSelectedTestCase(0)

    clearResult()

    const savedCode =
      localStorage.getItem(
        getStorageKey(id, newLanguage)
      )

    if (
      savedCode !== null &&
      savedCode !==
        starterCode[newLanguage]
    ) {
      setRestoredDraft(true)
    } else {
      setRestoredDraft(false)
    }
  }

  /* =========================================================
     MANUAL SAVE
  ========================================================= */

  const saveCodeManually = () => {
    if (!id) return

    try {
      localStorage.setItem(
        getStorageKey(id, language),
        code
      )

      setCodeSaved(true)

    } catch (error) {
      console.error(
        'Manual save failed:',
        error
      )
    }
  }

  /* =========================================================
     RESET CODE
  ========================================================= */

  const resetCode = () => {
    const shouldReset =
      window.confirm(
        `Reset ${languageLabels[language]} code to the starter code? Your saved draft for this language will also be replaced.`
      )

    if (!shouldReset) return

    const defaultCode =
      starterCode[language]

    setCodes((prev) => ({
      ...prev,
      [language]: defaultCode
    }))

    localStorage.setItem(
      getStorageKey(id, language),
      defaultCode
    )

    setCodeSaved(true)

    setRestoredDraft(false)

    clearResult()
  }

  /* =========================================================
     CLEAR SAVED DRAFT
  ========================================================= */

  const clearSavedDraft = () => {
    localStorage.removeItem(
      getStorageKey(id, language)
    )

    setCodes((prev) => ({
      ...prev,
      [language]: starterCode[language]
    }))

    setCodeSaved(true)

    setRestoredDraft(false)

    clearResult()
  }

  /* =========================================================
     FULLSCREEN
  ========================================================= */

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await editorPanelRef.current?.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error(
        'Fullscreen error:',
        error
      )
    }
  }

  /* =========================================================
     FAVORITE
  ========================================================= */

  const toggleFavorite = async () => {
    if (!id || favoriteLoading) return

    try {
      setFavoriteLoading(true)

      if (isFavorite) {
        const response =
          await api.delete(
            `/problem/favorite/${id}`
          )

        console.log(
          'Remove Favorite:',
          response.data
        )

        setIsFavorite(false)

      } else {
        const response =
          await api.post(
            `/problem/favorite/${id}`
          )

        console.log(
          'Add Favorite:',
          response.data
        )

        setIsFavorite(true)
      }

    } catch (error) {
      console.error(
        'Favorite Error:',
        error.response?.data || error
      )

      window.alert(
        error.response?.data?.message ||
          'Could not update favorite. Please try again.'
      )

    } finally {
      setFavoriteLoading(false)
    }
  }

  /* =========================================================
     PREVIOUS / NEXT
  ========================================================= */

  const getPreviousNextProblems = () => {
    if (!allProblems.length) {
      return {
        previous: null,
        next: null
      }
    }

    const currentIndex =
      allProblems.findIndex(
        (item) => item._id === id
      )

    if (currentIndex === -1) {
      return {
        previous: null,
        next: null
      }
    }

    return {
      previous:
        currentIndex > 0
          ? allProblems[
              currentIndex - 1
            ]
          : null,

      next:
        currentIndex <
          allProblems.length - 1
          ? allProblems[
              currentIndex + 1
            ]
          : null
    }
  }

  const {
    previous,
    next
  } = getPreviousNextProblems()

  /* =========================================================
     RUN CODE
  ========================================================= */

  const runCode = async () => {
    if (!code.trim()) {
      setResult({
        success: false,
        status: 'error',
        message:
          'Please write some code first.'
      })

      setResultType('run')
      return
    }

    try {
      setRunLoading(true)

      setResult(null)

      setResultType('run')

      const response =
        await api.post(
          `/submission/run/${id}`,
          {
            code,
            language
          }
        )

      console.log(
        'Run Code Result:',
        response.data
      )

      setResult(response.data)

    } catch (error) {
      console.error(
        'Run Code Error:',
        error.response?.data ||
          error
      )

      setResult({
        success: false,
        status: 'error',
        message:
          error.response?.data
            ?.message ||
          error.response?.data ||
          'Something went wrong while running your code.'
      })

      setResultType('run')

    } finally {
      setRunLoading(false)
    }
  }

  /* =========================================================
     CUSTOM TEST
  ========================================================= */

  const runCustomCode = async () => {
    if (!code.trim()) {
      setResult({
        success: false,
        status: 'error',
        message:
          'Please write some code first.'
      })

      setResultType('custom')
      return
    }

    if (!customInput.trim()) {
      setResult({
        success: false,
        status: 'error',
        message:
          'Please enter some custom input first.'
      })

      setResultType('custom')
      return
    }

    try {
      setCustomLoading(true)

      setResult(null)

      setResultType('custom')

      const response =
        await api.post(
          `/submission/run-custom/${id}`,
          {
            code,
            language,
            input: customInput
          }
        )

      console.log(
        'Custom Code Result:',
        response.data
      )

      setResult(response.data)

    } catch (error) {
      console.error(
        'Custom Code Error:',
        error.response?.data ||
          error
      )

      setResult({
        success: false,
        status: 'error',
        message:
          error.response?.data
            ?.message ||
          error.response?.data ||
          'Something went wrong while running custom code.'
      })

      setResultType('custom')

    } finally {
      setCustomLoading(false)
    }
  }

  /* =========================================================
     SUBMIT CODE
  ========================================================= */

  const submitCode = async () => {
    if (!code.trim()) {
      setResult({
        success: false,
        status: 'error',
        message:
          'Please write some code first.'
      })

      setResultType('submit')
      return
    }

    try {
      setSubmitLoading(true)

      setResult(null)

      setResultType('submit')

      saveCodeManually()

      const response =
        await api.post(
          `/submission/submit/${id}`,
          {
            code,
            language
          }
        )

      console.log(
        'Submit Result:',
        response.data
      )

      setResult(response.data)

      try {
        const solvedResponse =
          await api.get(
            '/submission/solved-problems'
          )

        setSolvedProblems(
          solvedResponse.data
            .solvedProblems || []
        )
      } catch (solvedError) {
        console.error(
          'Could not refresh solved problems:',
          solvedError
        )
      }

      await fetchRecentSubmissions()

    } catch (error) {
      console.error(
        'Submit Code Error:',
        error.response?.data ||
          error
      )

      setResult({
        success: false,
        status: 'error',
        message:
          error.response?.data
            ?.message ||
          error.response?.data ||
          'Something went wrong while submitting your code.'
      })

      setResultType('submit')

    } finally {
      setSubmitLoading(false)
    }
  }

  /* =========================================================
     DISCUSSIONS
  ========================================================= */

  const fetchDiscussions = async () => {
    if (!id) return

    try {
      setDiscussionLoading(true)
      setDiscussionError('')

      const response =
        await api.get(
          `/discussion/problem/${id}`
        )

      const data = response.data

      let discussionList = []

      if (Array.isArray(data)) {
        discussionList = data
      } else if (
        Array.isArray(data.discussions)
      ) {
        discussionList = data.discussions
      } else if (
        Array.isArray(data.result)
      ) {
        discussionList = data.result
      }

      setDiscussions(discussionList)

    } catch (error) {
      console.error(
        'Could not load discussions:',
        error.response?.data || error
      )

      setDiscussionError(
        error.response?.data?.message ||
          'Could not load discussions.'
      )

      setDiscussions([])

    } finally {
      setDiscussionLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return

    setDiscussionContent('')
    setDiscussionError('')

    fetchDiscussions()
  }, [id])

  /* =========================================================
     CREATE DISCUSSION
  ========================================================= */

  const createDiscussion = async () => {
    const content =
      discussionContent.trim()

    if (!content) {
      setDiscussionError(
        'Please write something before posting.'
      )
      return
    }

    if (content.length < 5) {
      setDiscussionError(
        'Discussion must contain at least 5 characters.'
      )
      return
    }

    try {
      setDiscussionPosting(true)
      setDiscussionError('')

      await api.post(
        '/discussion',
        {
          problemId: id,
          content
        }
      )

      setDiscussionContent('')

      await fetchDiscussions()

    } catch (error) {
      console.error(
        'Create Discussion Error:',
        error.response?.data || error
      )

      setDiscussionError(
        error.response?.data?.message ||
          'Could not create discussion.'
      )

    } finally {
      setDiscussionPosting(false)
    }
  }

  /* =========================================================
     RECENT SUBMISSIONS
  ========================================================= */

  const fetchRecentSubmissions =
    async () => {
      try {
        setSubmissionsLoading(true)

        const response =
          await api.get(
            '/submission/my'
          )

        const data =
          response.data

        let submissions = []

        if (Array.isArray(data)) {
          submissions = data
        } else if (
          Array.isArray(
            data.submissions
          )
        ) {
          submissions =
            data.submissions
        } else if (
          Array.isArray(
            data.result
          )
        ) {
          submissions =
            data.result
        }

        const currentProblemSubmissions =
          submissions.filter(
            (submission) => {
              const submissionProblemId =
                submission.problemId?._id ||
                submission.problemId

              return (
                submissionProblemId?.toString() ===
                id?.toString()
              )
            }
          )

        setRecentSubmissions(
          currentProblemSubmissions
        )

        setSubmissionPage(1)

      } catch (error) {
        console.error(
          'Could not load recent submissions:',
          error
        )

        setRecentSubmissions([])

      } finally {
        setSubmissionsLoading(false)
      }
    }

  useEffect(() => {
    if (!id) return

    setSubmissionPage(1)
    setSubmissionStatusFilter('all')
    setSubmissionLanguageFilter('all')

    fetchRecentSubmissions()
  }, [id])

  /* =========================================================
     SUBMISSION FILTER + PAGINATION
  ========================================================= */

  const filteredSubmissions =
    recentSubmissions.filter((submission) => {
      const status =
        normalizeSubmissionStatus(
          submission.status
        )

      const languageMatches =
        submissionLanguageFilter === 'all' ||
        submission.language ===
          submissionLanguageFilter

      const statusMatches =
        submissionStatusFilter === 'all' ||
        status === submissionStatusFilter

      return languageMatches && statusMatches
    })

  const submissionTotalPages = Math.max(
    1,
    Math.ceil(
      filteredSubmissions.length /
        submissionPageSize
    )
  )

  const safeSubmissionPage = Math.min(
    submissionPage,
    submissionTotalPages
  )

  const submissionStartIndex =
    (safeSubmissionPage - 1) *
    submissionPageSize

  const paginatedSubmissions =
    filteredSubmissions.slice(
      submissionStartIndex,
      submissionStartIndex +
        submissionPageSize
    )

  const submissionStartNumber =
    filteredSubmissions.length === 0
      ? 0
      : submissionStartIndex + 1

  const submissionEndNumber =
    Math.min(
      submissionStartIndex +
        submissionPageSize,
      filteredSubmissions.length
    )

  useEffect(() => {
    if (
      submissionPage >
      submissionTotalPages
    ) {
      setSubmissionPage(
        submissionTotalPages
      )
    }
  }, [
    submissionPage,
    submissionTotalPages
  ])

  /* =========================================================
     RESULT DATA
  ========================================================= */

  const statusInfo =
    getStatusInfo(
      result,
      resultType
    )

  const resultTests =
    Array.isArray(
      result?.result
    )
      ? result.result
      : []

  const resultSubmission =
    result?.submission

  const passedCount =
    resultType === 'run'
      ? result?.testCasesPassed ??
        resultTests.filter(
          (test) =>
            test.status?.id === 3
        ).length
      : resultType === 'custom'
        ? result?.status ===
            'accepted'
          ? 1
          : 0
        : resultSubmission
            ?.testCasesPassed ??
          0

  const totalCount =
    resultType === 'run'
      ? result?.testCasesTotal ??
        resultTests.length
      : resultType === 'custom'
        ? 1
        : resultSubmission
            ?.testCasesTotal ??
          0

  const runtime =
    resultType === 'run'
      ? resultTests.length
        ? Math.max(
            ...resultTests.map(
              (test) =>
                Number(
                  test.time || 0
                ) * 1000
            )
          )
        : 0
      : resultType === 'custom'
        ? Number(
            result?.runtime || 0
          )
        : Number(
            resultSubmission
              ?.runtime || 0
          )

  const memory =
    resultType === 'run'
      ? resultTests.length
        ? Math.max(
            ...resultTests.map(
              (test) =>
                Number(
                  test.memory || 0
                )
            )
          )
        : 0
      : resultType === 'custom'
        ? Number(
            result?.memory || 0
          )
        : Number(
            resultSubmission
              ?.memory || 0
          )

  /* =========================================================
     TEST CASE ERROR
  ========================================================= */

  const getTestCaseError =
    (testCase) => {
      if (
        testCase.compile_output
      ) {
        return testCase.compile_output
      }

      if (testCase.stderr) {
        return testCase.stderr
      }

      if (testCase.message) {
        return testCase.message
      }

      return ''
    }

  /* =========================================================
     FORMAT SUBMISSION STATUS
  ========================================================= */

  const formatSubmissionStatus =
    (status) => ({
      label: getStatusLabel(status),
      className: getStatusClassName(status)
    })

  /* =========================================================
     MONACO NEXUS THEME
  ========================================================= */

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('nexus-dark', {
      base: 'vs-dark',
      inherit: false,

      colors: {
        /* Main editor */
        'editor.background': '#080D16',
        'editor.foreground': '#E6EAF2',

        /* Line numbers */
        'editorLineNumber.foreground': '#3E4A61',
        'editorLineNumber.activeForeground': '#8B7CFF',

        /* Current line */
        'editor.lineHighlightBackground': '#10182A',
        'editor.lineHighlightBorder': '#202A40',

        /* Cursor */
        'editorCursor.foreground': '#7C6CFF',

        /* Selection */
        'editor.selectionBackground': '#40358A',
        'editor.inactiveSelectionBackground': '#29245C',

        /* Whitespace / indentation */
        'editorWhitespace.foreground': '#263044',
        'editorIndentGuide.background1': '#182133',
        'editorIndentGuide.activeBackground1': '#394665',

        /* Scrollbar */
        'scrollbarSlider.background': '#303B52',
        'scrollbarSlider.hoverBackground': '#4A5872',
        'scrollbarSlider.activeBackground': '#6558B8',

        /* Autocomplete */
        'editorSuggestWidget.background': '#0E1522',
        'editorSuggestWidget.border': '#303B55',
        'editorSuggestWidget.selectedBackground': '#29235E',

        /* Hover */
        'editorHoverWidget.background': '#0E1522',
        'editorHoverWidget.border': '#303B55',

        /* Brackets */
        'editorBracketMatch.background': '#29235E',
        'editorBracketMatch.border': '#796BFF',

        /* Find */
        'editor.findMatchBackground': '#40358A',
        'editor.findMatchHighlightBackground': '#29245C',
      },

      rules: [
        /* Comments */
        {
          token: 'comment',
          foreground: '667085',
          fontStyle: 'italic',
        },

        /* Keywords */
        {
          token: 'keyword',
          foreground: 'C792EA',
        },

        /* Control keywords */
        {
          token: 'keyword.control',
          foreground: 'FF7AB2',
        },

        /* Types */
        {
          token: 'type',
          foreground: '82AAFF',
        },

        /* Classes */
        {
          token: 'type.identifier',
          foreground: '89DDFF',
        },

        /* Strings */
        {
          token: 'string',
          foreground: 'C3E88D',
        },

        /* Numbers */
        {
          token: 'number',
          foreground: 'F78C6C',
        },

        /* Functions */
        {
          token: 'function',
          foreground: '82AAFF',
        },

        /* Operators */
        {
          token: 'operator',
          foreground: '89DDFF',
        },

        /* Variables */
        {
          token: 'variable',
          foreground: 'EEFFFF',
        },

        /* Constants */
        {
          token: 'constant',
          foreground: 'F78C6C',
        },
      ],
    })
  }

  /* =========================================================
     FULLSCREEN EDITOR HEIGHT
  ========================================================= */

  const editorHeight = isFullscreen
    ? 'calc(100vh - 180px)'
    : '460px'

  /* =========================================================
     LOADING
  ========================================================= */

  if (!problem) {
    return (
      <div className="p-6">
        <p>Loading problem...</p>
      </div>
    )
  }

  return (
    <div className="problem-page pb-10">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <div className="flex items-center justify-between mb-6">

        <button
          className="btn btn-ghost"
          onClick={() =>
            navigate('/problems')
          }
        >
          ← Problems
        </button>

        <button
          className={`btn btn-sm ${
            isFavorite
              ? 'btn-warning'
              : 'btn-outline'
          }`}
          onClick={toggleFavorite}
          disabled={favoriteLoading}
          title={
            isFavorite
              ? 'Remove from favorites'
              : 'Add to favorites'
          }
        >
          {favoriteLoading
            ? '⟳ Updating...'
            : isFavorite
              ? '★ Favorited'
              : '☆ Favorite'}
        </button>

      </div>

      {/* =====================================================
          MAIN WORKSPACE
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ===================================================
            LEFT PANEL
        =================================================== */}

        <div className="card bg-base-100 shadow-xl">

          <div className="p-6">

            {/* TITLE */}

            <div className="flex items-center gap-3 mb-4 flex-wrap">

              <h1 className="text-2xl font-bold">
                {problem.title}
              </h1>

              {isSolved && (
                <span className="text-success font-semibold">
                  ✓ Solved
                </span>
              )}

            </div>

            {/* DESCRIPTION */}

            <p className="text-base-content/80 leading-relaxed mb-4">
              {problem.description}
            </p>

            {/* DIFFICULTY */}

            <span
              className={`badge ${
                problem.difficulty ===
                'easy'
                  ? 'badge-success'
                  : problem.difficulty ===
                    'medium'
                    ? 'badge-warning'
                    : 'badge-error'
              }`}
            >
              {problem.difficulty
                ?.charAt(0)
                .toUpperCase() +
                problem.difficulty?.slice(
                  1
                )}
            </span>

            {/* TAGS */}

            <div className="flex gap-2 mt-4 flex-wrap">

              {problem.tags?.map(
                (tag) => (
                  <span
                    key={tag}
                    className="badge badge-outline"
                  >
                    {tag}
                  </span>
                )
              )}

            </div>

            {/* =================================================
                EXAMPLES
            ================================================= */}

            {Array.isArray(
              problem.examples
            ) &&
              problem.examples.length >
                0 && (

                <div className="mt-8">

                  <h2 className="text-xl font-semibold mb-4">
                    Examples
                  </h2>

                  <div className="space-y-4">

                    {problem.examples.map(
                      (
                        example,
                        index
                      ) => (

                        <div
                          key={index}
                          className="bg-base-200 rounded-lg p-4"
                        >

                          <div className="font-semibold mb-3">
                            Example{' '}
                            {index + 1}
                          </div>

                          {example.input !==
                            undefined && (
                              <div className="mb-3">

                                <div className="text-sm opacity-60 mb-1">
                                  Input
                                </div>

                                <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                                  {String(
                                    example.input
                                  )}
                                </pre>

                              </div>
                            )}

                          {example.output !==
                            undefined && (
                              <div className="mb-3">

                                <div className="text-sm opacity-60 mb-1">
                                  Output
                                </div>

                                <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                                  {String(
                                    example.output
                                  )}
                                </pre>

                              </div>
                            )}

                          {example.explanation && (
                            <div>

                              <div className="text-sm opacity-60 mb-1">
                                Explanation
                              </div>

                              <p>
                                {
                                  example.explanation
                                }
                              </p>

                            </div>
                          )}

                        </div>

                      )
                    )}

                  </div>

                </div>
              )}

            {/* =================================================
                CONSTRAINTS
            ================================================= */}

            {problem.constraints &&
              (Array.isArray(
                problem.constraints
              ) ||
                typeof problem.constraints ===
                  'string') && (

                <div className="mt-8">

                  <h2 className="text-xl font-semibold mb-3">
                    Constraints
                  </h2>

                  {Array.isArray(
                    problem.constraints
                  ) ? (
                    <ul className="list-disc ml-5 space-y-2 text-base-content/80">

                      {problem.constraints.map(
                        (
                          constraint,
                          index
                        ) => (
                          <li key={index}>
                            {constraint}
                          </li>
                        )
                      )}

                    </ul>
                  ) : (
                    <p className="whitespace-pre-wrap text-base-content/80">
                      {
                        problem.constraints
                      }
                    </p>
                  )}

                </div>
              )}

            {/* =================================================
                HINTS
            ================================================= */}

            {Array.isArray(
              problem.hints
            ) &&
              problem.hints.length >
                0 && (

                <div className="mt-8">

                  <button
                    className="btn btn-outline w-full justify-between"
                    onClick={() =>
                      setShowHints(
                        (prev) => !prev
                      )
                    }
                  >
                    <span>
                      💡 Hints
                    </span>

                    <span>
                      {showHints
                        ? '▲'
                        : '▼'}
                    </span>
                  </button>

                  {showHints && (
                    <div className="mt-3 space-y-2">

                      {problem.hints.map(
                        (
                          hint,
                          index
                        ) => (

                          <div
                            key={index}
                            className="collapse collapse-arrow bg-base-200"
                          >

                            <input
                              type="checkbox"
                              checked={
                                openHint ===
                                index
                              }
                              onChange={() =>
                                setOpenHint(
                                  openHint ===
                                    index
                                    ? null
                                    : index
                                )
                              }
                            />

                            <div className="collapse-title font-medium">
                              Hint{' '}
                              {index + 1}
                            </div>

                            <div className="collapse-content">

                              <p>
                                {typeof hint ===
                                  'string'
                                  ? hint
                                  : hint.text ||
                                    hint.content ||
                                    ''}
                              </p>

                            </div>

                          </div>

                        )
                      )}

                    </div>
                  )}

                </div>
              )}

            {/* =================================================
                SOLUTION
            ================================================= */}

            {problem.solution && (

              <div className="mt-8">

                <button
                  className="btn btn-outline w-full justify-between"
                  onClick={() =>
                    setShowSolution(
                      (prev) => !prev
                    )
                  }
                >
                  <span>
                    📖 Solution / Editorial
                  </span>

                  <span>
                    {showSolution
                      ? '▲'
                      : '▼'}
                  </span>
                </button>

                {showSolution && (
                  <div className="mt-3 bg-base-200 rounded-lg p-4">

                    <pre className="whitespace-pre-wrap leading-relaxed">
                      {typeof problem.solution ===
                        'string'
                        ? problem.solution
                        : problem.solution.content ||
                          problem.solution.text ||
                          ''}
                    </pre>

                  </div>
                )}

              </div>
            )}

            {/* =================================================
                TEST CASES
            ================================================= */}

            <div className="mt-8">

              <div className="flex gap-2 mb-4">

                <button
                  className={`btn btn-sm ${
                    testView === 'cases'
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                  onClick={() =>
                    setTestView(
                      'cases'
                    )
                  }
                >
                  Test Cases
                </button>

                <button
                  className={`btn btn-sm ${
                    testView === 'custom'
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                  onClick={() =>
                    setTestView(
                      'custom'
                    )
                  }
                >
                  Custom Test
                </button>

              </div>

              {/* =============================
                  NORMAL TEST CASES
              ============================= */}

              {testView === 'cases' ? (

                problem.visibleTestCases
                  ?.length > 0 ? (

                  <div>

                    <div className="flex gap-2 mb-4 flex-wrap">

                      {problem.visibleTestCases.map(
                        (_, index) => (

                          <button
                            key={index}
                            className={`btn btn-sm ${
                              selectedTestCase ===
                              index
                                ? 'btn-primary'
                                : 'btn-outline'
                            }`}
                            onClick={() =>
                              setSelectedTestCase(
                                index
                              )
                            }
                          >
                            Case{' '}
                            {index + 1}
                          </button>

                        )
                      )}

                    </div>

                    {problem.visibleTestCases[
                      selectedTestCase
                    ] && (

                        <div className="bg-base-200 rounded-lg p-4">

                          <div className="mb-5">

                            <div className="text-sm opacity-60 mb-2">
                              Input
                            </div>

                            <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                              {
                                problem
                                  .visibleTestCases[
                                  selectedTestCase
                                ].input
                              }
                            </pre>

                          </div>

                          <div className="mb-5">

                            <div className="text-sm opacity-60 mb-2">
                              Expected Output
                            </div>

                            <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                              {
                                problem
                                  .visibleTestCases[
                                  selectedTestCase
                                ].output
                              }
                            </pre>

                          </div>

                          {problem
                            .visibleTestCases[
                            selectedTestCase
                          ].explanation && (

                              <div>

                                <div className="text-sm opacity-60 mb-2">
                                  Explanation
                                </div>

                                <p className="leading-relaxed">
                                  {
                                    problem
                                      .visibleTestCases[
                                      selectedTestCase
                                    ].explanation
                                  }
                                </p>

                              </div>

                            )}

                        </div>
                      )}

                  </div>

                ) : (

                  <div className="bg-base-200 rounded-lg p-4 text-base-content/60">
                    No visible test cases available.
                  </div>

                )

              ) : (

                /* =============================
                   CUSTOM TEST
                ============================= */

                <div className="bg-base-200 rounded-lg p-4">

                  <h2 className="text-lg font-semibold">
                    Custom Test Input
                  </h2>

                  <p className="text-sm opacity-60 mt-1 mb-3">
                    Enter your own input and
                    run the current code against
                    it.
                  </p>

                  <textarea
                    className="textarea textarea-bordered w-full min-h-40 font-mono"
                    placeholder={
                      'Example:\n[2,7,11,15]\n9'
                    }
                    value={customInput}
                    onChange={(e) => {
                      setCustomInput(
                        e.target.value
                      )

                      if (
                        resultType ===
                        'custom'
                      ) {
                        clearResult()
                      }
                    }}
                    disabled={
                      runLoading ||
                      customLoading ||
                      submitLoading
                    }
                  />

                  <div className="flex flex-wrap gap-2 mt-3">

                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        const firstCase =
                          problem
                            .visibleTestCases?.[0]

                        if (firstCase) {
                          setCustomInput(
                            firstCase.input
                          )
                        }
                      }}
                      disabled={
                        !problem
                          .visibleTestCases
                          ?.length ||
                        runLoading ||
                        customLoading ||
                        submitLoading
                      }
                    >
                      Use Case 1 Input
                    </button>

                    <button
                      className="btn btn-sm btn-primary"
                      onClick={
                        runCustomCode
                      }
                      disabled={
                        runLoading ||
                        customLoading ||
                        submitLoading
                      }
                    >
                      {customLoading
                        ? 'Running...'
                        : '▶ Run Custom Test'}
                    </button>

                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => {
                        setCustomInput('')

                        if (
                          resultType ===
                          'custom'
                        ) {
                          clearResult()
                        }
                      }}
                    >
                      Clear Input
                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* ===================================================
            RIGHT PANEL - EDITOR
        =================================================== */}

        <div
          ref={editorPanelRef}
          className={`card bg-base-100 shadow-xl lg:sticky lg:top-6 lg:self-start ${
            isFullscreen
              ? 'bg-base-100 w-screen h-screen overflow-auto rounded-none'
              : ''
          }`}
        >

          <div className="p-6">

            {/* EDITOR HEADER */}

            <div className="flex items-center justify-between gap-3 mb-3">

              <div>

                <h2 className="text-lg font-semibold">
                  Code
                </h2>

                <div className="text-xs mt-1">

                  {codeSaved ? (
                    <span className="text-success">
                      ✓ Saved
                    </span>
                  ) : (
                    <span className="text-warning">
                      ● Saving...
                    </span>
                  )}

                </div>

              </div>

              <div className="flex gap-2">

                {/* SETTINGS */}

                <div className="relative">

                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() =>
                      setShowSettings(
                        (prev) =>
                          !prev
                      )
                    }
                    title="Editor settings"
                  >
                    ⚙
                  </button>

                  {showSettings && (

                    <div className="absolute right-0 top-10 z-50 w-72 p-4 rounded-lg bg-base-100 border border-base-300 shadow-xl">

                      <div className="font-semibold mb-3">
                        Editor Settings
                      </div>

                      <label className="flex items-center justify-between gap-3 mb-3">

                        <span className="text-sm">
                          Font size
                        </span>

                        <select
                          className="select select-bordered select-sm"
                          value={
                            fontSize
                          }
                          onChange={(e) =>
                            setFontSize(
                              Number(
                                e.target
                                  .value
                              )
                            )
                          }
                        >
                          <option value="12">
                            12
                          </option>

                          <option value="14">
                            14
                          </option>

                          <option value="16">
                            16
                          </option>

                          <option value="18">
                            18
                          </option>

                          <option value="20">
                            20
                          </option>
                        </select>

                      </label>

                      <label className="flex items-center justify-between gap-3 mb-3">

                        <span className="text-sm">
                          Word wrap
                        </span>

                        <select
                          className="select select-bordered select-sm"
                          value={
                            wordWrap
                          }
                          onChange={(e) =>
                            setWordWrap(
                              e.target
                                .value
                            )
                          }
                        >
                          <option value="off">
                            Off
                          </option>

                          <option value="on">
                            On
                          </option>
                        </select>

                      </label>

                      <label className="flex items-center justify-between gap-3">

                        <span className="text-sm">
                          Minimap
                        </span>

                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={
                            editorMinimap
                          }
                          onChange={(e) =>
                            setEditorMinimap(
                              e.target
                                .checked
                            )
                          }
                        />

                      </label>

                    </div>
                  )}

                </div>

                {/* FULLSCREEN */}

                <button
                  className="btn btn-sm btn-outline"
                  onClick={
                    toggleFullscreen
                  }
                  title={
                    isFullscreen
                      ? 'Exit fullscreen'
                      : 'Fullscreen editor'
                  }
                >
                  {isFullscreen
                    ? '⛶ Exit'
                    : '⛶'}
                </button>

              </div>

            </div>

            {/* RESTORED DRAFT NOTICE */}

            {restoredDraft && (

              <div className="alert alert-info mb-3">

                <div>

                  <div className="font-semibold">
                    Saved draft found
                  </div>

                  <div className="text-sm">
                    Your previous{' '}
                    {
                      languageLabels[
                        language
                      ]
                    }{' '}
                    code has been restored.
                  </div>

                </div>

                <button
                  className="btn btn-xs"
                  onClick={() =>
                    setRestoredDraft(
                      false
                    )
                  }
                >
                  Dismiss
                </button>

              </div>
            )}

            {/* =================================================
                LANGUAGE SELECTOR
                Compact horizontal dropdown.
            ================================================= */}

            <div
              className="relative mb-3"
              style={{ zIndex: 1000 }}
            >
              {/* SELECT BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setLanguageOpen((prev) => !prev)
                }
                disabled={
                  runLoading ||
                  customLoading ||
                  submitLoading
                }
                aria-haspopup="listbox"
                aria-expanded={languageOpen}
                style={{
                  width: '100%',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#101A2A',
                  color: '#E6EAF2',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor:
                    runLoading ||
                    customLoading ||
                    submitLoading
                      ? 'not-allowed'
                      : 'pointer'
                }}
              >
                <span>{languageLabels[language]}</span>

                <span
                  style={{
                    opacity: 0.7,
                    fontSize: '12px',
                    transform: languageOpen
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                    transition: 'transform 150ms ease'
                  }}
                >
                  ▾
                </span>
              </button>

              {/* COMPACT HORIZONTAL DROPDOWN */}

              {languageOpen && (
                <div
                  role="listbox"
                  aria-label="Select programming language"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    width: '100%',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'stretch',
                    background: '#0E1522',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow:
                      '0 18px 40px rgba(0, 0, 0, 0.55)',
                    zIndex: 999999
                  }}
                >
                  {[
                    ['c++', 'C++'],
                    ['java', 'Java'],
                    ['javascript', 'JavaScript']
                  ].map(([value, label], index) => (
                    <button
                      key={value}
                      type="button"
                      role="option"
                      aria-selected={language === value}
                      onClick={() => {
                        handleLanguageChange(value)
                        setLanguageOpen(false)
                      }}
                      style={{
                        flex: 1,
                        height: '100%',
                        minWidth: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '0 12px',
                        border: 'none',
                        borderRight:
                          index < 2
                            ? '1px solid #263247'
                            : 'none',
                        background:
                          language === value
                            ? '#1A2144'
                            : '#0E1522',
                        color:
                          language === value
                            ? '#8B7CFF'
                            : '#E6EAF2',
                        fontSize: '14px',
                        fontWeight:
                          language === value ? 600 : 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition:
                          'background 150ms ease, color 150ms ease'
                      }}
                      onMouseEnter={(e) => {
                        if (language !== value) {
                          e.currentTarget.style.background =
                            '#182238'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (language !== value) {
                          e.currentTarget.style.background =
                            '#0E1522'
                        }
                      }}
                    >
                      {language === value && (
                        <span
                          style={{
                            color: '#7C6CFF',
                            fontWeight: 700
                          }}
                        >
                          ✓
                        </span>
                      )}

                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* =================================================
                MONACO EDITOR
            ================================================= */}

            <div className="relative z-0 rounded-lg overflow-hidden border border-base-300">



              <Editor
                height={editorHeight}

                /*
                  NEXUS custom Monaco theme
                */
                theme="nexus-dark"

                language={
                  language === 'c++'
                    ? 'cpp'
                    : language === 'java'
                      ? 'java'
                      : 'javascript'
                }

                value={code}

                beforeMount={
                  handleEditorWillMount
                }

                /*
                  IMPORTANT:
                  Explicitly apply our theme
                  after Monaco mounts.
                */
                onMount={(editor, monaco) => {
                  editorRef.current = editor

                  monaco.editor.setTheme(
                    'nexus-dark'
                  )
                }}

                onChange={
                  handleCodeChange
                }

                options={{
                  /* Minimap */
                  minimap: {
                    enabled:
                      editorMinimap
                  },

                  /* Font */
                  fontSize,

                  /* Word wrap */
                  wordWrap,

                  /* Layout */
                  automaticLayout: true,

                  scrollBeyondLastLine: false,

                  /* Editor padding */
                  padding: {
                    top: 14,
                    bottom: 14
                  },

                  /* Autocomplete */
                  suggestOnTriggerCharacters:
                    true,

                  /* Indentation */
                  tabSize: 4,

                  insertSpaces: true,

                  /* NEXUS editor feel */
                  smoothScrolling: true,

                  cursorBlinking:
                    'smooth',

                  cursorSmoothCaretAnimation:
                    'on',

                  renderLineHighlight:
                    'all',

                  renderWhitespace:
                    'selection',

                  roundedSelection:
                    true,

                  /* Scrollbars */
                  scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                    useShadows: false
                  }
                }}
              />

            </div>

            {/* EDITOR ACTIONS */}

            <div className="flex flex-wrap gap-3 mt-4">

              <button
                className="btn btn-outline"
                onClick={runCode}
                disabled={
                  runLoading ||
                  customLoading ||
                  submitLoading
                }
              >
                {runLoading
                  ? '⟳ Running...'
                  : '▶ Run Code'}
              </button>

              <button
                className="btn btn-primary"
                onClick={submitCode}
                disabled={
                  runLoading ||
                  customLoading ||
                  submitLoading
                }
              >
                {submitLoading
                  ? '⟳ Submitting...'
                  : '✓ Submit'}
              </button>

              <button
                className="btn btn-outline"
                onClick={
                  saveCodeManually
                }
                disabled={
                  runLoading ||
                  customLoading ||
                  submitLoading
                }
              >
                💾 Save
              </button>

              <button
                className="btn btn-ghost"
                onClick={resetCode}
                disabled={
                  runLoading ||
                  customLoading ||
                  submitLoading
                }
              >
                ↻ Reset
              </button>

              <button
                className="btn btn-ghost"
                onClick={
                  clearSavedDraft
                }
                disabled={
                  runLoading ||
                  customLoading ||
                  submitLoading
                }
              >
                Clear Draft
              </button>

              <button
                className="btn btn-ghost"
                onClick={clearResult}
                disabled={
                  !result ||
                  runLoading ||
                  customLoading ||
                  submitLoading
                }
              >
                Clear Result
              </button>

            </div>

            {/* SHORTCUTS */}

            <div className="text-xs opacity-50 mt-3">

              Ctrl + Enter: Run Code
              &nbsp; • &nbsp;
              Ctrl + Shift + Enter:
              Submit
              &nbsp; • &nbsp;
              Ctrl + S: Save

            </div>

            {/* =================================================
                RESULT
            ================================================= */}

            {result && (

              <div className="mt-5 border border-base-300 rounded-lg overflow-hidden">

                {/* RESULT HEADER */}

                <div className="p-4 bg-base-200">

                  <div className="flex items-center justify-between">

                    <h2 className="text-xl font-semibold">
                      {resultType ===
                        'run'
                        ? 'Run Code Result'
                        : resultType ===
                          'custom'
                          ? 'Custom Test Result'
                          : 'Submission Result'}
                    </h2>

                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={
                        clearResult
                      }
                    >
                      ✕
                    </button>

                  </div>

                  {/* STATUS */}

                  <div
                    className={`text-lg font-semibold mt-4 ${statusInfo.className}`}
                  >
                    {statusInfo.icon}{' '}
                    {statusInfo.label}
                  </div>

                  {/* MESSAGE */}

                  {result.message && (

                    <div className="mt-3">

                      <div className="text-sm opacity-60 mb-2">
                        Message
                      </div>

                      <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm text-error">
                        {String(
                          result.message
                        )}
                      </pre>

                    </div>

                  )}

                  {/* SUMMARY */}

                  {(
                    resultTests.length >
                      0 ||
                    resultSubmission ||
                    resultType ===
                      'custom'
                  ) && (

                    <div className="grid grid-cols-3 gap-3 mt-4">

                      <div className="bg-base-100 rounded-lg p-3">

                        <div className="text-xs opacity-60">
                          Test Cases
                        </div>

                        <div className="font-semibold">
                          {totalCount > 0
                            ? `${passedCount} / ${totalCount}`
                            : '-'}
                        </div>

                      </div>

                      <div className="bg-base-100 rounded-lg p-3">

                        <div className="text-xs opacity-60">
                          Runtime
                        </div>

                        <div className="font-semibold">
                          {runtime} ms
                        </div>

                      </div>

                      <div className="bg-base-100 rounded-lg p-3">

                        <div className="text-xs opacity-60">
                          Memory
                        </div>

                        <div className="font-semibold">
                          {memory} KB
                        </div>

                      </div>

                    </div>
                  )}

                  {/* VIEW SUBMISSION */}

                  {resultType ===
                    'submit' &&
                    resultSubmission?._id && (

                    <button
                      className="btn btn-sm btn-primary mt-4"
                      onClick={() =>
                        navigate(
                          `/submission/${resultSubmission._id}`
                        )
                      }
                    >
                      View Submission →
                    </button>
                  )}

                </div>

                {/* =================================================
                    CUSTOM RESULT
                ================================================= */}

                {resultType ===
                  'custom' && (

                  <div className="p-4 border-t border-base-300">

                    <h3 className="text-lg font-semibold mb-3">
                      Custom Test Result
                    </h3>

                    {result.output !==
                      undefined && (

                      <div className="mb-4">

                        <div className="opacity-60 mb-1">
                          Output
                        </div>

                        <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                          {String(
                            result.output
                          )}
                        </pre>

                      </div>
                    )}

                    {result.error && (

                      <div>

                        <div className="opacity-60 mb-1">
                          Error
                        </div>

                        <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap text-error">
                          {String(
                            result.error
                          )}
                        </pre>

                      </div>
                    )}

                  </div>
                )}

                {/* =================================================
                    TEST CASE RESULTS
                ================================================= */}

                {resultTests.length >
                  0 && (

                  <div className="p-4">

                    <h3 className="text-lg font-semibold mb-3">
                      Test Case Results
                    </h3>

                    <div className="space-y-3">

                      {resultTests.map(
                        (
                          testCase,
                          index
                        ) => {

                          const passed =
                            testCase
                              .status
                              ?.id === 3

                          const visibleTestCase =
                            problem
                              .visibleTestCases
                              ?.[index]

                          const errorText =
                            getTestCaseError(
                              testCase
                            )

                          return (

                            <div
                              key={
                                testCase.token ||
                                index
                              }
                              className={`border rounded-lg p-4 ${
                                passed
                                  ? 'border-success/30'
                                  : 'border-error/30'
                              }`}
                            >

                              <div className="flex justify-between items-center mb-3">

                                <span className="font-semibold">
                                  Test Case{' '}
                                  {index +
                                    1}
                                </span>

                                {passed ? (

                                  <span className="text-success font-semibold">
                                    ✓ Passed
                                  </span>

                                ) : (

                                  <span className="text-error font-semibold">
                                    ✗ Failed
                                  </span>

                                )}

                              </div>

                              <div className="text-sm mb-3">

                                <span className="opacity-60">
                                  Status:
                                </span>{' '}

                                {testCase
                                  .status
                                  ?.description ||
                                  'Unknown'}

                              </div>

                              {/* INPUT */}

                              {visibleTestCase && (

                                <div className="mb-3">

                                  <div className="opacity-60 mb-1">
                                    Input
                                  </div>

                                  <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                                    {
                                      visibleTestCase.input
                                    }
                                  </pre>

                                </div>
                              )}

                              {/* YOUR OUTPUT */}

                              {testCase.stdout && (

                                <div className="mb-3">

                                  <div className="opacity-60 mb-1">
                                    Your Output
                                  </div>

                                  <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                                    {
                                      testCase.stdout
                                    }
                                  </pre>

                                </div>
                              )}

                              {/* EXPECTED */}

                              {visibleTestCase && (

                                <div className="mb-3">

                                  <div className="opacity-60 mb-1">
                                    Expected Output
                                  </div>

                                  <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                                    {
                                      visibleTestCase.output
                                    }
                                  </pre>

                                </div>
                              )}

                              {/* ERROR */}

                              {errorText && (

                                <div>

                                  <div className="opacity-60 mb-1">
                                    Error
                                  </div>

                                  <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap text-error">
                                    {
                                      errorText
                                    }
                                  </pre>

                                </div>
                              )}

                            </div>
                          )
                        }
                      )}

                    </div>

                  </div>
                )}

                {/* SUBMISSION ERROR */}

                {resultSubmission
                  ?.errorMessage && (

                  <div className="p-4 border-t border-base-300">

                    <div className="opacity-60 mb-2">
                      Error Details
                    </div>

                    <pre className="bg-base-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap text-error text-sm">
                      {
                        resultSubmission.errorMessage
                      }
                    </pre>

                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          RECENT SUBMISSIONS
      ===================================================== */}

      <div className="card bg-base-100 shadow-xl mt-6">

        <div className="p-6">

          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">

            <div>
              <h2 className="text-xl font-semibold">
                My Submissions
              </h2>

              <p className="text-sm opacity-60 mt-1">
                Your submission history for this problem.
              </p>
            </div>

            <button
              className="btn btn-sm btn-outline"
              onClick={
                fetchRecentSubmissions
              }
              disabled={
                submissionsLoading
              }
            >
              {submissionsLoading
                ? 'Loading...'
                : '↻ Refresh'}
            </button>

          </div>

          {recentSubmissions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">

              <select
                className="select select-bordered w-full"
                value={
                  submissionStatusFilter
                }
                onChange={(e) => {
                  setSubmissionStatusFilter(
                    e.target.value
                  )

                  setSubmissionPage(1)
                }}
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="wrong">
                  Wrong Answer
                </option>

                <option value="compile_error">
                  Compilation Error
                </option>

                <option value="runtime_error">
                  Runtime Error
                </option>

                <option value="tle">
                  Time Limit Exceeded
                </option>

                <option value="pending">
                  Pending
                </option>
              </select>

              <select
                className="select select-bordered w-full"
                value={
                  submissionLanguageFilter
                }
                onChange={(e) => {
                  setSubmissionLanguageFilter(
                    e.target.value
                  )

                  setSubmissionPage(1)
                }}
              >
                <option value="all">
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
                className="select select-bordered w-full"
                value={
                  submissionPageSize
                }
                onChange={(e) => {
                  setSubmissionPageSize(
                    Number(
                      e.target.value
                    )
                  )

                  setSubmissionPage(1)
                }}
              >
                <option value="5">
                  5 per page
                </option>

                <option value="10">
                  10 per page
                </option>

                <option value="20">
                  20 per page
                </option>
              </select>

            </div>
          )}

          {submissionsLoading ? (

            <div className="text-center p-6 opacity-60">
              Loading submissions...
            </div>

          ) : recentSubmissions.length ===
            0 ? (

            <div className="text-center p-6 opacity-60">
              No submissions for this problem yet.
            </div>

          ) : filteredSubmissions.length ===
            0 ? (

            <div className="text-center p-6">

              <p className="opacity-60 mb-3">
                No submissions match these filters.
              </p>

              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setSubmissionStatusFilter(
                    'all'
                  )

                  setSubmissionLanguageFilter(
                    'all'
                  )

                  setSubmissionPage(1)
                }}
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <>

              <div className="flex items-center justify-between mb-3 text-sm opacity-60 flex-wrap gap-2">

                <span>
                  Showing{' '}
                  {submissionStartNumber}{' '}
                  –{' '}
                  {submissionEndNumber}{' '}
                  of{' '}
                  {
                    filteredSubmissions.length
                  }
                </span>

                <span>
                  {
                    recentSubmissions.length
                  }{' '}
                  total submissions
                </span>

              </div>

              <div className="overflow-x-auto">

                <table className="table">

                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Language</th>
                      <th>Test Cases</th>
                      <th>Runtime</th>
                      <th>Memory</th>
                      <th>Submitted</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>

                    {paginatedSubmissions.map(
                      (submission) => {

                        const normalizedStatus =
                          normalizeSubmissionStatus(
                            submission.status
                          )

                        const status =
                          formatSubmissionStatus(
                            submission.status
                          )

                        const passed =
                          getSubmissionPassedCount(
                            submission
                          )

                        const total =
                          getSubmissionTotalCount(
                            submission
                          )

                        return (
                          <tr
                            key={
                              submission._id
                            }
                          >

                            <td>

                              <span
                                className={`font-semibold ${status.className}`}
                              >
                                {normalizedStatus ===
                                'accepted'
                                  ? '✓ '
                                  : normalizedStatus ===
                                        'tle' ||
                                      normalizedStatus ===
                                        'pending'
                                    ? '⚠ '
                                    : '✗ '}

                                {
                                  status.label
                                }

                              </span>

                            </td>

                            <td>
                              {languageLabels[
                                submission
                                  .language
                              ] ||
                                submission.language ||
                                '-'}
                            </td>

                            <td>
                              {passed !==
                                null &&
                              total !==
                                null
                                ? `${passed} / ${total}`
                                : '-'}
                            </td>

                            <td>
                              {submission.runtime !==
                                undefined &&
                              submission.runtime !==
                                null
                                ? `${submission.runtime} ms`
                                : '-'}
                            </td>

                            <td>
                              {submission.memory !==
                                undefined &&
                              submission.memory !==
                                null
                                ? `${submission.memory} KB`
                                : '-'}
                            </td>

                            <td className="whitespace-nowrap text-sm">
                              {formatSubmissionDate(
                                submission.createdAt
                              )}
                            </td>

                            <td>

                              <button
                                className="btn btn-xs btn-outline"
                                onClick={() =>
                                  navigate(
                                    `/submission/${submission._id}`
                                  )
                                }
                              >
                                View
                              </button>

                            </td>

                          </tr>
                        )
                      }
                    )}

                  </tbody>

                </table>

              </div>

              {submissionTotalPages >
                1 && (

                <div className="flex items-center justify-between mt-5 gap-3 flex-wrap">

                  <button
                    className="btn btn-sm btn-outline"
                    disabled={
                      safeSubmissionPage <=
                      1
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

                  <div className="flex items-center gap-2 flex-wrap justify-center">

                    {Array.from(
                      {
                        length:
                          submissionTotalPages
                      },
                      (_, index) => (
                        <button
                          key={index}
                          className={`btn btn-sm ${
                            safeSubmissionPage ===
                            index + 1
                              ? 'btn-primary'
                              : 'btn-outline'
                          }`}
                          onClick={() =>
                            setSubmissionPage(
                              index + 1
                            )
                          }
                        >
                          {index + 1}
                        </button>
                      )
                    )}

                  </div>

                  <button
                    className="btn btn-sm btn-outline"
                    disabled={
                      safeSubmissionPage >=
                      submissionTotalPages
                    }
                    onClick={() =>
                      setSubmissionPage(
                        (page) =>
                          Math.min(
                            submissionTotalPages,
                            page + 1
                          )
                      )
                    }
                  >
                    Next →
                  </button>

                </div>
              )}

            </>
          )}

        </div>

      </div>

      {/* =====================================================
          DISCUSSION
      ===================================================== */}

      <div className="card bg-base-100 shadow-xl mt-6">

        <div className="p-6">

          <div className="flex items-center justify-between gap-4 mb-5">

            <div>

              <h2 className="text-xl font-semibold">
                💬 Discussion
              </h2>

              <p className="text-sm opacity-60 mt-1">
                Ask questions, share approaches, and discuss this problem.
              </p>

            </div>

            <div className="badge badge-primary">
              {discussions.length}
            </div>

          </div>

          <div className="bg-base-200 rounded-lg p-4">

            <textarea
              className="textarea textarea-bordered w-full min-h-32"
              placeholder="Ask a question or share your approach..."
              value={
                discussionContent
              }
              onChange={(e) => {
                setDiscussionContent(
                  e.target.value
                )

                if (discussionError) {
                  setDiscussionError(
                    ''
                  )
                }
              }}
              maxLength={2000}
              disabled={
                discussionPosting
              }
            />

            <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">

              <span className="text-xs opacity-50">
                {
                  discussionContent.length
                }
                /2000
              </span>

              <button
                className="btn btn-primary"
                onClick={
                  createDiscussion
                }
                disabled={
                  discussionPosting ||
                  !discussionContent.trim()
                }
              >
                {discussionPosting
                  ? 'Posting...'
                  : '💬 Post Discussion'}
              </button>

            </div>

            {discussionError && (
              <div className="text-error text-sm mt-3">
                {discussionError}
              </div>
            )}

          </div>

          <div className="mt-6">

            {discussionLoading ? (

              <div className="text-center py-8 opacity-60">
                Loading discussions...
              </div>

            ) : discussions.length ===
              0 ? (

              <div className="text-center py-10">

                <div className="text-4xl mb-3">
                  💬
                </div>

                <p className="font-semibold">
                  No discussions yet
                </p>

                <p className="text-sm opacity-60 mt-1">
                  Be the first person to start a discussion.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {discussions.map(
                  (discussion) => {

                    const author =
                      discussion.userId ||
                      discussion.user ||
                      discussion.author

                    const authorName =
                      author
                        ? `${author.firstName || ''} ${
                            author.lastName || ''
                          }`.trim()
                        : 'User'

                    const createdAt =
                      discussion.createdAt
                        ? formatSubmissionDate(
                            discussion.createdAt
                          )
                        : ''

                    return (

                      <div
                        key={
                          discussion._id
                        }
                        className="border border-base-300 rounded-lg p-4"
                      >

                        <div className="flex items-center justify-between gap-3 mb-3">

                          <div className="flex items-center gap-3">

                            <div className="avatar placeholder">

                              <div className="bg-primary text-primary-content rounded-full w-9">

                                <span>
                                  {authorName
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </span>

                              </div>

                            </div>

                            <div>

                              <div className="font-semibold">
                                {
                                  authorName
                                }
                              </div>

                              {createdAt && (
                                <div className="text-xs opacity-50">
                                  {
                                    createdAt
                                  }
                                </div>
                              )}

                            </div>

                          </div>

                        </div>

                        <div className="text-base-content/90 whitespace-pre-wrap leading-relaxed">
                          {
                            discussion.content
                          }
                        </div>

                        <div className="flex items-center gap-4 mt-4">

                          <button
                            className="btn btn-xs btn-ghost"
                            type="button"
                          >
                            👍{' '}
                            {
                              discussion.likes ||
                              0
                            }
                          </button>

                          <button
                            className="btn btn-xs btn-ghost"
                            type="button"
                          >
                            💬{' '}
                            {
                              discussion.commentsCount ||
                              0
                            }
                          </button>

                        </div>

                      </div>

                    )
                  }
                )}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          PREVIOUS / NEXT
      ===================================================== */}

      <div className="flex items-center justify-between mt-6">

        <button
          className="btn btn-outline"
          disabled={!previous}
          onClick={() => {
            if (previous) {
              navigate(
                `/problem/${previous._id}`
              )
            }
          }}
        >
          ← Previous
        </button>

        <button
          className="btn btn-outline"
          disabled={!next}
          onClick={() => {
            if (next) {
              navigate(
                `/problem/${next._id}`
              )
            }
          }}
        >
          Next →
        </button>

      </div>

    </div>
  )
}

export default Problem