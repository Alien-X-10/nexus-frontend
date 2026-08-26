import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "./AdminSubmissions.css";

function AdminSubmissions() {

    const [submissions, setSubmissions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [languageFilter, setLanguageFilter] =
        useState("All");


    // =====================================================
    // FETCH SUBMISSIONS
    // =====================================================

    const fetchSubmissions = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await fetch(
                "http://localhost:3000/admin/submissions",
                {
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load submissions"
                );

            }

            setSubmissions(
                data.submissions || []
            );

        }
        catch (err) {

            console.error(
                "Fetch Submissions Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load submissions"
            );

        }
        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchSubmissions();

    }, []);


    // =====================================================
    // STATUS
    // =====================================================

    const formatStatus = (status) => {

        const names = {

            accepted:
                "Accepted",

            wrong:
                "Wrong Answer",

            runtime_error:
                "Runtime Error",

            compile_error:
                "Compile Error",

            tle:
                "Time Limit Exceeded",

            mle:
                "Memory Limit Exceeded",

            pending:
                "Pending"

        };

        return names[status] || status || "Unknown";

    };


    const getStatusClass = (status) => {

        switch (status) {

            case "accepted":
                return "submission-status-accepted";

            case "pending":
                return "submission-status-pending";

            default:
                return "submission-status-error";

        }

    };


    // =====================================================
    // LANGUAGE
    // =====================================================

    const formatLanguage = (language) => {

        const languages = {

            "c++":
                "C++",

            java:
                "Java",

            javascript:
                "JavaScript"

        };

        return (
            languages[language] ||
            language ||
            "Unknown"
        );

    };


    // =====================================================
    // DATE
    // =====================================================

    const formatRelativeTime = (date) => {

        if (!date) {
            return "—";
        }

        const now =
            new Date();

        const created =
            new Date(date);

        const seconds =
            Math.floor(
                (now - created) / 1000
            );

        if (seconds < 60) {
            return "Just now";
        }

        const minutes =
            Math.floor(
                seconds / 60
            );

        if (minutes < 60) {
            return `${minutes} min ago`;
        }

        const hours =
            Math.floor(
                minutes / 60
            );

        if (hours < 24) {
            return `${hours} hr ago`;
        }

        const days =
            Math.floor(
                hours / 24
            );

        if (days < 30) {

            return `${days} day${days === 1
                ? ""
                : "s"
                } ago`;

        }

        return created.toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    };


    // =====================================================
    // FILTER
    // =====================================================

    const filteredSubmissions =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return submissions.filter(
                (submission) => {

                    const user =
                        submission.userId;

                    const problem =
                        submission.problemId;

                    const userName =
                        `${user?.firstName || ""} ${user?.lastName || ""
                            }`
                            .toLowerCase();

                    const email =
                        user?.emailId
                            ?.toLowerCase() || "";

                    const problemTitle =
                        problem?.title
                            ?.toLowerCase() || "";

                    const matchesSearch =
                        !searchValue ||
                        userName.includes(
                            searchValue
                        ) ||
                        email.includes(
                            searchValue
                        ) ||
                        problemTitle.includes(
                            searchValue
                        );

                    const matchesStatus =
                        statusFilter === "All" ||
                        submission.status ===
                        statusFilter;

                    const matchesLanguage =
                        languageFilter === "All" ||
                        submission.language ===
                        languageFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesLanguage
                    );

                }
            );

        }, [
            submissions,
            search,
            statusFilter,
            languageFilter
        ]);


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const clearFilters = () => {

        setSearch("");

        setStatusFilter("All");

        setLanguageFilter("All");

    };


    const hasFilters =
        search ||
        statusFilter !== "All" ||
        languageFilter !== "All";


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-submissions-page">

                <div className="admin-submissions-loading">

                    Loading submissions...

                </div>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="admin-submissions-page">

                <div className="admin-submissions-error">

                    <h2>
                        Unable to load submissions
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={fetchSubmissions}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-submissions-page">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="admin-submissions-header">

                <div>

                    <div className="admin-submissions-eyebrow">
                        SUBMISSION MANAGEMENT
                    </div>

                    <h1>
                        Submissions<span>.</span>
                    </h1>

                    <p>
                        Monitor code submissions across the platform.
                    </p>

                </div>

                <button
                    className="admin-submissions-refresh"
                    onClick={fetchSubmissions}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ================================================= */}
            {/* SUMMARY */}
            {/* ================================================= */}

            <div className="admin-submissions-summary">

                <div>

                    <span>
                        Total Submissions
                    </span>

                    <strong>
                        {submissions.length}
                    </strong>

                </div>


                <div>

                    <span>
                        Accepted
                    </span>

                    <strong className="summary-success">

                        {
                            submissions.filter(
                                (submission) =>
                                    submission.status ===
                                    "accepted"
                            ).length
                        }

                    </strong>

                </div>


                <div>

                    <span>
                        Pending
                    </span>

                    <strong className="summary-warning">

                        {
                            submissions.filter(
                                (submission) =>
                                    submission.status ===
                                    "pending"
                            ).length
                        }

                    </strong>

                </div>


                <div>

                    <span>
                        Showing
                    </span>

                    <strong>
                        {filteredSubmissions.length}
                    </strong>

                </div>

            </div>


            {/* ================================================= */}
            {/* FILTERS */}
            {/* ================================================= */}

            <div className="admin-submissions-filters">

                <input
                    type="text"
                    placeholder="Search user or problem..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />


                <select
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


                <select
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


                {hasFilters && (

                    <button
                        className="admin-submissions-clear"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>

                )}

            </div>


            {/* ================================================= */}
            {/* TABLE */}
            {/* ================================================= */}

            <div className="admin-submissions-table">


                <div className="admin-submissions-table-header">

                    <span>
                        USER
                    </span>

                    <span>
                        PROBLEM
                    </span>

                    <span>
                        LANGUAGE
                    </span>

                    <span>
                        STATUS
                    </span>

                    <span>
                        TEST CASES
                    </span>

                    <span>
                        RUNTIME
                    </span>

                    <span>
                        MEMORY
                    </span>

                    <span>
                        TIME
                    </span>

                    <span>
                        ACTION
                    </span>

                </div>


                {filteredSubmissions.length === 0 ? (

                    <div className="admin-no-submissions">

                        No submissions found.

                    </div>

                ) : (

                    filteredSubmissions.map(
                        (submission) => {

                            const user =
                                submission.userId;

                            const problem =
                                submission.problemId;

                            return (

                                <div
                                    className="admin-submission-row"
                                    key={
                                        submission._id
                                    }
                                >


                                    {/* USER */}

                                    <div>

                                        <strong>

                                            {
                                                user
                                                    ? `${user.firstName} ${user.lastName}`
                                                    : "Unknown User"
                                            }

                                        </strong>

                                        <small>

                                            {
                                                user?.emailId ||
                                                "—"
                                            }

                                        </small>

                                    </div>


                                    {/* PROBLEM */}

                                    <div>

                                        <strong>

                                            {
                                                problem?.title ||
                                                "Unknown Problem"
                                            }

                                        </strong>

                                        <small>

                                            {
                                                problem?.difficulty ||
                                                "—"
                                            }

                                        </small>

                                    </div>


                                    {/* LANGUAGE */}

                                    <div>

                                        {
                                            formatLanguage(
                                                submission.language
                                            )
                                        }

                                    </div>


                                    {/* STATUS */}

                                    <div>

                                        <span
                                            className={
                                                `submission-status ${getStatusClass(
                                                    submission.status
                                                )}`
                                            }
                                        >

                                            {
                                                formatStatus(
                                                    submission.status
                                                )
                                            }

                                        </span>

                                    </div>


                                    {/* TEST CASES */}

                                    <div className="admin-test-cases">

                                        {
                                            submission.testCasesPassed ??
                                            0
                                        }

                                        /

                                        {
                                            submission.testCasesTotal ??
                                            0
                                        }

                                    </div>


                                    {/* RUNTIME */}

                                    <div>

                                        {
                                            submission.runtime != null
                                                ? `${submission.runtime} ms`
                                                : "—"
                                        }

                                    </div>


                                    {/* MEMORY */}

                                    <div>

                                        {
                                            submission.memory != null
                                                ? `${submission.memory} KB`
                                                : "—"
                                        }

                                    </div>


                                    {/* TIME */}

                                    <div className="admin-submission-time">

                                        {
                                            formatRelativeTime(
                                                submission.createdAt
                                            )
                                        }

                                    </div>


                                    {/* ACTION */}

                                    <div>

                                        <Link
                                            to={`/admin/submissions/${submission._id}`}
                                            className="admin-submission-view"
                                        >
                                            View
                                        </Link>

                                    </div>


                                </div>

                            );

                        }
                    )

                )}

            </div>


        </div>

    );

}

export default AdminSubmissions;