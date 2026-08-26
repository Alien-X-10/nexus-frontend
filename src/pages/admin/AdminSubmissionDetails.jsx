import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "./AdminSubmissionDetails.css";


function AdminSubmissionDetails() {

    const { submissionId } = useParams();

    const navigate = useNavigate();

    const [submission, setSubmission] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // FETCH SUBMISSION
    // =====================================================

    const fetchSubmission = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await fetch(
                `http://localhost:3000/admin/submissions/${submissionId}`,
                {
                    credentials: "include"
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load submission"
                );

            }


            setSubmission(
                data.submission
            );

        }
        catch (err) {

            console.error(
                "Admin Submission Details Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load submission"
            );

        }
        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchSubmission();

    }, [submissionId]);


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

        return (
            names[status] ||
            status ||
            "Unknown"
        );

    };


    const getStatusClass = (status) => {

        switch (status) {

            case "accepted":
                return "detail-status-accepted";

            case "pending":
                return "detail-status-pending";

            default:
                return "detail-status-error";

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

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleString(
            undefined,
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-submission-details-page">

                <div className="admin-submission-details-loading">

                    Loading submission...

                </div>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="admin-submission-details-page">

                <div className="admin-submission-details-error">

                    <h2>
                        Unable to load submission
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/submissions"
                            )
                        }
                    >
                        ← Back to Submissions
                    </button>

                </div>

            </div>

        );

    }


    if (!submission) {
        return null;
    }


    const user =
        submission.userId;

    const problem =
        submission.problemId;


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-submission-details-page">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="admin-submission-details-header">

                <div>

                    <div className="admin-submission-details-eyebrow">
                        SUBMISSION DETAILS
                    </div>

                    <h1>
                        Submission<span>.</span>
                    </h1>

                    <p>
                        Inspect the complete submission result.
                    </p>

                </div>


                <button
                    className="admin-submission-back"
                    onClick={() =>
                        navigate(
                            "/admin/submissions"
                        )
                    }
                >
                    ← Back
                </button>

            </div>


            {/* ================================================= */}
            {/* SUBMISSION ID */}
            {/* ================================================= */}

            <div className="admin-submission-id-card">

                <span>
                    SUBMISSION ID
                </span>

                <code>
                    {submission._id}
                </code>

            </div>


            {/* ================================================= */}
            {/* OVERVIEW */}
            {/* ================================================= */}

            <div className="admin-submission-detail-grid">


                {/* USER */}

                <div className="admin-detail-card">

                    <div className="admin-detail-label">
                        USER
                    </div>

                    <div className="admin-detail-value">

                        {user
                            ? `${user.firstName} ${user.lastName}`
                            : "Unknown User"}

                    </div>

                    <div className="admin-detail-secondary">

                        {user?.emailId || "—"}

                    </div>

                </div>


                {/* PROBLEM */}

                <div className="admin-detail-card">

                    <div className="admin-detail-label">
                        PROBLEM
                    </div>

                    <div className="admin-detail-value">

                        {problem?.title ||
                            "Unknown Problem"}

                    </div>

                    <div className="admin-detail-secondary">

                        {problem?.difficulty ||
                            "—"}

                    </div>

                </div>


                {/* LANGUAGE */}

                <div className="admin-detail-card">

                    <div className="admin-detail-label">
                        LANGUAGE
                    </div>

                    <div className="admin-detail-value">

                        {formatLanguage(
                            submission.language
                        )}

                    </div>

                </div>


                {/* STATUS */}

                <div className="admin-detail-card">

                    <div className="admin-detail-label">
                        STATUS
                    </div>

                    <span
                        className={
                            `admin-detail-status ${
                                getStatusClass(
                                    submission.status
                                )
                            }`
                        }
                    >

                        {formatStatus(
                            submission.status
                        )}

                    </span>

                </div>


            </div>


            {/* ================================================= */}
            {/* PERFORMANCE */}
            {/* ================================================= */}

            <div className="admin-performance-grid">


                <div className="admin-performance-card">

                    <span>
                        TEST CASES
                    </span>

                    <strong>

                        {submission.testCasesPassed ??
                            0}

                        {" / "}

                        {submission.testCasesTotal ??
                            0}

                    </strong>

                </div>


                <div className="admin-performance-card">

                    <span>
                        RUNTIME
                    </span>

                    <strong>

                        {submission.runtime != null
                            ? `${submission.runtime} ms`
                            : "—"}

                    </strong>

                </div>


                <div className="admin-performance-card">

                    <span>
                        MEMORY
                    </span>

                    <strong>

                        {submission.memory != null
                            ? `${submission.memory} KB`
                            : "—"}

                    </strong>

                </div>


                <div className="admin-performance-card">

                    <span>
                        SUBMITTED
                    </span>

                    <strong>

                        {formatDate(
                            submission.createdAt
                        )}

                    </strong>

                </div>


            </div>


            {/* ================================================= */}
            {/* ERROR MESSAGE */}
            {/* ================================================= */}

            {submission.errorMessage && (

                <div className="admin-error-card">

                    <div className="admin-code-section-title">
                        ERROR MESSAGE
                    </div>

                    <pre>
                        {submission.errorMessage}
                    </pre>

                </div>

            )}


            {/* ================================================= */}
            {/* CODE */}
            {/* ================================================= */}

            <div className="admin-code-card">

                <div className="admin-code-header">

                    <div>

                        <div className="admin-code-section-title">
                            SUBMITTED CODE
                        </div>

                        <div className="admin-code-language">

                            {formatLanguage(
                                submission.language
                            )}

                        </div>

                    </div>

                </div>


                <pre className="admin-submitted-code">

                    <code>
                        {submission.code}
                    </code>

                </pre>

            </div>


            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <div className="admin-submission-details-footer">

                <Link
                    to="/admin/submissions"
                    className="admin-submission-back-link"
                >
                    ← Back to all submissions
                </Link>

            </div>


        </div>

    );

}


export default AdminSubmissionDetails;