import { useEffect, useState } from "react";
import "./AdminProblems.css";
// import { useNavigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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

            const response = await fetch(
                "http://localhost:3000/problem/getAllProblem"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch problems"
                );
            }

            setProblems(data);

        } catch (err) {

            console.error(
                "Fetch Problems Error:",
                err
            );

            setError(err.message);

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

            const response = await fetch(
                `http://localhost:3000/problem/delete/${problemId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await response.text();

            if (!response.ok) {
                throw new Error(
                    data || "Failed to delete problem"
                );
            }

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

            alert(err.message);

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
                        Create, edit and manage coding problems.
                    </p>

                </div>


                <button
                    className="admin-create-button"
                    onClick={() =>
                        window.location.href = "/admin/problems/create"
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

                            {/* PROBLEM */}

                            <div className="admin-problem-title">

                                <strong>
                                    {problem.title}
                                </strong>

                                <small>
                                    ID: {problem._id}
                                </small>

                            </div>


                            {/* DIFFICULTY */}

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


                            {/* TAGS */}

                            <div className="admin-problem-tags">

                                {problem.tags?.length > 0
                                    ? problem.tags.map(
                                        (tag, index) => (
                                            <span
                                                key={index}
                                            >
                                                {tag}
                                            </span>
                                        )
                                    )
                                    : (
                                        <span>
                                            —
                                        </span>
                                    )
                                }

                            </div>


                            {/* ACTIONS */}

                            <div className="admin-problem-actions">

                                <button
                                    className="admin-edit-button"
                                    onClick={() =>
                                        navigate(`/admin/problems/${problem._id}/edit`)
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