import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Admin.css";

function Admin() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // LOAD ADMIN DASHBOARD
    // ==========================================
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/admin/dashboard");

                console.log("Admin Dashboard:", response.data);

                setData(response.data);
            } catch (err) {
                console.error(
                    "Admin Dashboard Error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load admin dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    // ==========================================
    // LOADING
    // ==========================================
    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    Loading Admin Dashboard...
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================
    if (error) {
        return (
            <div className="admin-page">
                <div className="admin-error">
                    <h2>
                        Unable to load dashboard
                    </h2>

                    <p>
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // DATA
    // ==========================================
    const users = data?.users || {};
    const problems = data?.problems || {};
    const submissions = data?.submissions || {};

    const acceptanceRate =
        submissions.total > 0
            ? Math.round(
                (submissions.accepted / submissions.total) * 100
            )
            : 0;

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="admin-page">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="admin-header">

                <div>

                    <div className="admin-eyebrow">
                        ADMIN CONTROL CENTER
                    </div>

                    <h1>
                        Admin Dashboard
                        <span>.</span>
                    </h1>

                    <p>
                        Manage your coding platform from one place.
                    </p>

                </div>

                <button
                    className="admin-refresh"
                    onClick={() => window.location.reload()}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ==================================
                STAT CARDS
            ================================== */}

            <div className="admin-stat-grid">

                {/* USERS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-label">
                        Total Users
                    </div>

                    <div className="admin-stat-value">
                        {users.total ?? 0}
                    </div>

                    <div className="admin-stat-description">
                        {users.admins ?? 0} admin
                    </div>

                </div>


                {/* PROBLEMS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-label">
                        Problems
                    </div>

                    <div className="admin-stat-value">
                        {problems.total ?? 0}
                    </div>

                    <div className="admin-stat-description">
                        {problems.easy ?? 0} easy
                    </div>

                </div>


                {/* SUBMISSIONS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-label">
                        Submissions
                    </div>

                    <div className="admin-stat-value">
                        {submissions.total ?? 0}
                    </div>

                    <div className="admin-stat-description">
                        {submissions.accepted ?? 0} accepted
                    </div>

                </div>


                {/* ACCEPTANCE */}

                <div className="admin-stat-card">

                    <div className="admin-stat-label">
                        Acceptance
                    </div>

                    <div className="admin-stat-value admin-success">
                        {acceptanceRate}%
                    </div>

                    <div className="admin-stat-description">
                        Platform rate
                    </div>

                </div>

            </div>


            {/* ==================================
                OVERVIEW GRID
            ================================== */}

            <div className="admin-overview-grid">


                {/* ==================================
                    PROBLEM OVERVIEW
                ================================== */}

                <div className="admin-panel">

                    <div className="admin-panel-header">

                        <h2>
                            Problem Overview
                        </h2>

                        <p>
                            Current problem distribution.
                        </p>

                    </div>


                    <div className="admin-list">

                        <div className="admin-list-row">

                            <span className="difficulty-easy">
                                Easy
                            </span>

                            <strong>
                                {problems.easy ?? 0}
                            </strong>

                        </div>


                        <div className="admin-list-row">

                            <span className="difficulty-medium">
                                Medium
                            </span>

                            <strong>
                                {problems.medium ?? 0}
                            </strong>

                        </div>


                        <div className="admin-list-row">

                            <span className="difficulty-hard">
                                Hard
                            </span>

                            <strong>
                                {problems.hard ?? 0}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    SUBMISSION OVERVIEW
                ================================== */}

                <div className="admin-panel">

                    <div className="admin-panel-header">

                        <h2>
                            Submission Overview
                        </h2>

                        <p>
                            Current platform submissions.
                        </p>

                    </div>


                    <div className="admin-list">

                        <div className="admin-list-row">

                            <span>
                                Accepted
                            </span>

                            <strong className="submission-accepted">
                                {submissions.accepted ?? 0}
                            </strong>

                        </div>


                        <div className="admin-list-row">

                            <span>
                                Wrong Answer
                            </span>

                            <strong className="submission-wrong">
                                {submissions.wrong ?? 0}
                            </strong>

                        </div>


                        <div className="admin-list-row">

                            <span>
                                Pending
                            </span>

                            <strong className="submission-pending">
                                {submissions.pending ?? 0}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Admin;