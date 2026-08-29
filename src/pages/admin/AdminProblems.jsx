import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./AdminProblems.css";

function AdminProblems() {
    const navigate = useNavigate();

    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // FETCH ALL PROBLEMS
    // ==========================================

    const fetchProblems = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/problem/getAllProblem"
            );

            console.log(
                "Admin Problems:",
                response.data
            );

            /*
             * Depending on the backend response,
             * problems may be returned directly
             * or inside data/problems/result.
             */
            const problemData =
                response.data?.problems ||
                response.data?.data ||
                response.data?.result ||
                response.data;

            setProblems(
                Array.isArray(problemData)
                    ? problemData
                    : []
            );
        } catch (err) {
            console.error(
                "Fetch Problems Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to fetch problems"
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // LOAD PROBLEMS
    // ==========================================

    useEffect(() => {
        fetchProblems();
    }, []);

    // ==========================================
    // DELETE PROBLEM
    // ==========================================

    const handleDelete = async (problemId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this problem?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/problem/delete/${problemId}`
            );

            console.log(
                "Problem deleted:",
                problemId
            );

            // Remove deleted problem immediately
            setProblems((currentProblems) =>
                currentProblems.filter(
                    (problem) =>
                        problem._id !== problemId
                )
            );
        } catch (err) {
            console.error(
                "Delete Problem Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                err.message ||
                "Failed to delete problem"
            );
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="admin-problems-page">
                <div className="admin-problems-loading">
                    Loading problems...
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="admin-problems-page">
                <div className="admin-problems-error">
                    <h2>
                        Unable to load problems
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={fetchProblems}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="admin-problems-page">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="admin-problems-header">

                <div>
                    <div className="admin-problems-eyebrow">
                        PROBLEM MANAGEMENT
                    </div>

                    <h1>
                        Problems<span>.</span>
                    </h1>

                    <p>
                        Create, edit and manage coding
                        problems.
                    </p>
                </div>

                <button
                    className="admin-create-button"
                    onClick={() =>
                        navigate(
                            "/admin/problems/create"
                        )
                    }
                >
                    + Create Problem
                </button>

            </div>

            {/* ==================================
                PROBLEM COUNT
            ================================== */}

            <div className="admin-problems-summary">

                <span>
                    Total Problems
                </span>

                <strong>
                    {problems.length}
                </strong>

            </div>

            {/* ==================================
                PROBLEM LIST
            ================================== */}

            <div className="admin-problems-table">

                <div className="admin-problems-table-header">

                    <span>
                        PROBLEM
                    </span>

                    <span>
                        DIFFICULTY
                    </span>

                    <span>
                        TAGS
                    </span>

                    <span>
                        ACTION
                    </span>

                </div>

                {problems.length === 0 ? (

                    <div className="admin-no-problems">
                        No problems found.
                    </div>

                ) : (

                    problems.map((problem) => (

                        <div
                            className="admin-problem-row"
                            key={problem._id}
                        >

                            {/* ==================================
                                PROBLEM
                            ================================== */}

                            <div className="admin-problem-title">

                                <strong>
                                    {problem.title}
                                </strong>

                                <small>
                                    ID: {problem._id}
                                </small>

                            </div>

                            {/* ==================================
                                DIFFICULTY
                            ================================== */}

                            <div>

                                <span
                                    className={
                                        `admin-difficulty admin-${problem.difficulty}`
                                    }
                                >
                                    {problem.difficulty
                                        ? problem.difficulty
                                            .charAt(0)
                                            .toUpperCase() +
                                        problem.difficulty.slice(1)
                                        : "Unknown"
                                    }
                                </span>

                            </div>

                            {/* ==================================
                                TAGS
                            ================================== */}

                            <div className="admin-problem-tags">

                                {problem.tags?.length > 0 ? (

                                    problem.tags.map(
                                        (tag, index) => (

                                            <span
                                                key={index}
                                            >
                                                {tag}
                                            </span>

                                        )
                                    )

                                ) : (

                                    <span>
                                        —
                                    </span>

                                )}

                            </div>

                            {/* ==================================
                                ACTIONS
                            ================================== */}

                            <div className="admin-problem-actions">

                                <button
                                    className="admin-edit-button"
                                    onClick={() =>
                                        navigate(
                                            `/admin/problems/${problem._id}/edit`
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    className="admin-delete-button"
                                    onClick={() =>
                                        handleDelete(
                                            problem._id
                                        )
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>
    );
}

export default AdminProblems;