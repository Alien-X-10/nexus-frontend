import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

import "./AdminUsers.css";


function AdminUsers() {

    const navigate = useNavigate();


    // =====================================================
    // USERS
    // =====================================================

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =====================================================
    // SEARCH / FILTER / SORT
    // =====================================================

    const [searchTerm, setSearchTerm] = useState("");

    const [roleFilter, setRoleFilter] = useState("all");

    const [statusFilter, setStatusFilter] = useState("all");

    const [sortBy, setSortBy] = useState("newest");


    // =====================================================
    // PAGINATION
    // =====================================================

    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 10;


    // =====================================================
    // SELECTED USER
    // =====================================================

    const [selectedUser, setSelectedUser] = useState(null);

    const [showUserDetails, setShowUserDetails] = useState(false);

    const [loadingDetails, setLoadingDetails] = useState(false);


    // =====================================================
    // ACTION STATES
    // =====================================================

    const [actionLoading, setActionLoading] = useState(false);

    const [actionError, setActionError] = useState("");

    const [showDeleteConfirm, setShowDeleteConfirm] =
        useState(false);

    const [showRoleConfirm, setShowRoleConfirm] =
        useState(false);

    const [showSuspendConfirm, setShowSuspendConfirm] =
        useState(false);


    // =====================================================
    // FETCH USERS
    // =====================================================

    const fetchUsers = async () => {

        try {

            setLoading(true);

            setError("");

            // const response = await fetch(
            //     "http://localhost:3000/admin/users",
            //     {
            //         credentials: "include"
            //     }
            // );

            // const data = await response.json();

            // if (!response.ok) {

            //     throw new Error(
            //         data.message ||
            //         "Failed to load users"
            //     );

            // }

            // setUsers(data.users || []);

            const response = await api.get("/admin/users");

            setUsers(response.data?.users || []);

        }
        catch (err) {

            console.error(
                "Fetch Users Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load users"
            );

        }
        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchUsers();

    }, []);


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {

        if (!date) {

            return "—";

        }

        return new Date(date).toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    };


    // =====================================================
    // DATE + TIME FORMAT
    // =====================================================

    const formatDateTime = (date) => {

        if (!date) {

            return "—";

        }

        return new Date(date).toLocaleString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // =====================================================
    // SEARCH / FILTER / SORT
    // =====================================================

    const filteredUsers = useMemo(() => {

        const search =
            searchTerm
                .trim()
                .toLowerCase();


        let result = users.filter((user) => {

            // ---------------------------------------------
            // NAME
            // ---------------------------------------------

            const firstName =
                (user.firstName || "")
                    .toLowerCase();

            const lastName =
                (user.lastName || "")
                    .toLowerCase();

            const fullName =
                `${firstName} ${lastName}`;


            // ---------------------------------------------
            // EMAIL
            // ---------------------------------------------

            const email =
                (user.emailId || "")
                    .toLowerCase();


            // ---------------------------------------------
            // ID
            // ---------------------------------------------

            const id =
                (user._id || "")
                    .toLowerCase();


            // ---------------------------------------------
            // SEARCH
            // ---------------------------------------------

            const matchesSearch =
                !search ||
                fullName.includes(search) ||
                email.includes(search) ||
                id.includes(search);


            // ---------------------------------------------
            // ROLE
            // ---------------------------------------------

            const matchesRole =
                roleFilter === "all" ||
                user.role === roleFilter;


            // ---------------------------------------------
            // STATUS
            // ---------------------------------------------

            const userStatus =
                user.status || "active";

            const matchesStatus =
                statusFilter === "all" ||
                userStatus === statusFilter;


            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus
            );

        });


        // =================================================
        // SORT
        // =================================================

        result = [...result].sort((a, b) => {

            switch (sortBy) {

                case "newest":

                    return (
                        new Date(b.createdAt || 0) -
                        new Date(a.createdAt || 0)
                    );


                case "oldest":

                    return (
                        new Date(a.createdAt || 0) -
                        new Date(b.createdAt || 0)
                    );


                case "name-asc":

                    return (
                        `${a.firstName || ""} ${a.lastName || ""}`
                            .localeCompare(
                                `${b.firstName || ""} ${b.lastName || ""}`
                            )
                    );


                case "name-desc":

                    return (
                        `${b.firstName || ""} ${b.lastName || ""}`
                            .localeCompare(
                                `${a.firstName || ""} ${a.lastName || ""}`
                            )
                    );


                case "most-solved":

                    return (
                        (b.solvedCount || 0) -
                        (a.solvedCount || 0)
                    );


                case "most-submissions":

                    return (
                        (b.submissionCount || 0) -
                        (a.submissionCount || 0)
                    );


                default:

                    return 0;

            }

        });


        return result;

    }, [
        users,
        searchTerm,
        roleFilter,
        statusFilter,
        sortBy
    ]);


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredUsers.length /
            usersPerPage
        )
    );


    useEffect(() => {

        if (currentPage > totalPages) {

            setCurrentPage(totalPages);

        }

    }, [
        currentPage,
        totalPages
    ]);


    useEffect(() => {

        setCurrentPage(1);

    }, [
        searchTerm,
        roleFilter,
        statusFilter,
        sortBy
    ]);


    const startIndex =
        (currentPage - 1) *
        usersPerPage;


    const endIndex =
        startIndex +
        usersPerPage;


    const currentUsers =
        filteredUsers.slice(
            startIndex,
            endIndex
        );


    // =====================================================
    // SUMMARY STATISTICS
    // =====================================================

    const totalUsers =
        users.length;


    const totalAdmins =
        users.filter(
            (user) =>
                user.role === "admin"
        ).length;


    const totalNormalUsers =
        users.filter(
            (user) =>
                user.role === "user"
        ).length;


    const activeUsers =
        users.filter(
            (user) =>
                (user.status || "active") === "active"
        ).length;


    const suspendedUsers =
        users.filter(
            (user) =>
                user.status === "suspended"
        ).length;


    // =====================================================
    // GET USER DETAILS
    // =====================================================

    const openUserDetails = async (user) => {

        try {

            setSelectedUser(user);

            setShowUserDetails(true);

            setLoadingDetails(true);

            setActionError("");


            /*
             * This endpoint will be created on the backend:
             *
             * GET /admin/users/:userId
             *
             * Until then, we use the user object
             * already loaded from /admin/users.
             */

            // const response = await fetch(
            //     `http://localhost:3000/admin/users/${user._id}`,
            //     {
            //         credentials: "include"
            //     }
            // );

            const response = await api.get(
                `/admin/users/${user._id}`
            );


            if (response.ok) {

                const data =
                    await response.json();

                if (data.user) {

                    setSelectedUser(
                        data.user
                    );

                }

            }

        }
        catch (err) {

            console.error(
                "User Details Error:",
                err
            );

            /*
             * We still keep the user selected.
             * This means the basic information
             * from the table remains available.
             */

        }
        finally {

            setLoadingDetails(false);

        }

    };


    // =====================================================
    // CHANGE ROLE
    // =====================================================

    const changeUserRole = async () => {
        if (!selectedUser) {
            return;
        }
        try {
            setActionLoading(true);
            setActionError("");
            const newRole =
                selectedUser.role === "admin"
                    ? "user"
                    : "admin";
            /*
             * Backend endpoint to create:
             *
             * PATCH /admin/users/:userId/role
             */

            // const response = await fetch(
            //     `http://localhost:3000/admin/users/${selectedUser._id}/role`,
            //     {
            //         method: "PATCH",

            //         credentials: "include",

            //         headers: {
            //             "Content-Type":
            //                 "application/json"
            //         },

            //         body: JSON.stringify({
            //             role: newRole
            //         })
            //     }
            // );

            const response = await api.patch(
    `/admin/users/${selectedUser._id}/role`,
    {
        role: newRole
    }
);
//  const data =
                // await response.json();

             const data = response.data;


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to change user role"
                );

            }


            setShowRoleConfirm(false);

            setShowUserDetails(false);

            await fetchUsers();

        }
        catch (err) {

            console.error(
                "Change Role Error:",
                err
            );

            setActionError(
                err.message ||
                "Failed to change user role"
            );

        }
        finally {

            setActionLoading(false);

        }

    };


    // =====================================================
    // SUSPEND / ACTIVATE USER
    // =====================================================

    const toggleUserStatus = async () => {

        if (!selectedUser) {

            return;

        }


        try {

            setActionLoading(true);

            setActionError("");


            const currentStatus =
                selectedUser.status ||
                "active";


            const newStatus =
                currentStatus === "active"
                    ? "suspended"
                    : "active";


            /*
             * Backend endpoint to create:
             *
             * PATCH /admin/users/:userId/status
             */

            // const response = await fetch(
            //     `http://localhost:3000/admin/users/${selectedUser._id}/status`,
            //     {
            //         method: "PATCH",

            //         credentials: "include",

            //         headers: {
            //             "Content-Type":
            //                 "application/json"
            //         },

            //         body: JSON.stringify({
            //             status: newStatus
            //         })
            //     }
            // );

            const response = await api.patch(
    `/admin/users/${selectedUser._id}/status`,
    {
        status: newStatus
    }
);
// const data =
            //     await response.json();

            const data = response.data;


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update user status"
                );

            }


            setShowSuspendConfirm(false);

            setShowUserDetails(false);

            await fetchUsers();

        }
        catch (err) {

            console.error(
                "Update User Status Error:",
                err
            );

            setActionError(
                err.message ||
                "Failed to update user status"
            );

        }
        finally {

            setActionLoading(false);

        }

    };


    // =====================================================
    // DELETE USER
    // =====================================================

    const deleteUser = async () => {

        if (!selectedUser) {

            return;

        }


        try {

            setActionLoading(true);

            setActionError("");


            /*
             * Backend endpoint to create:
             *
             * DELETE /admin/users/:userId
             */

            // const response = await fetch(
            //     `http://localhost:3000/admin/users/${selectedUser._id}`,
            //     {
            //         method: "DELETE",

            //         credentials: "include"
            //     }
            // );


            // const data =
            //     await response.json();

            const response = await api.delete(
                `/admin/users/${selectedUser._id}`
            );

            const data = response.data;


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to delete user"
                );

            }


            setShowDeleteConfirm(false);

            setShowUserDetails(false);

            setSelectedUser(null);

            await fetchUsers();

        }
        catch (err) {

            console.error(
                "Delete User Error:",
                err
            );

            setActionError(
                err.message ||
                "Failed to delete user"
            );

        }
        finally {

            setActionLoading(false);

        }

    };


    // =====================================================
    // RESET FILTERS
    // =====================================================

    const resetFilters = () => {

        setSearchTerm("");

        setRoleFilter("all");

        setStatusFilter("all");

        setSortBy("newest");

        setCurrentPage(1);

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-users-page">

                <div className="admin-users-loading">

                    Loading users...

                </div>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="admin-users-page">

                <div className="admin-users-error">

                    <h2>
                        Unable to load users
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={fetchUsers}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (

        <div className="admin-users-page">


            {/* =================================================
                HEADER
                ================================================= */}

            <div className="admin-users-header">

                <div>

                    <div className="admin-users-eyebrow">
                        USER MANAGEMENT
                    </div>

                    <h1>
                        Users<span>.</span>
                    </h1>

                    <p>
                        View and manage registered users.
                    </p>

                </div>


                <button
                    className="admin-users-refresh"
                    onClick={fetchUsers}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* =================================================
                SUMMARY CARDS
                ================================================= */}

            <div
                className="admin-users-summary"
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px"
                }}
            >

                <div>

                    <span>
                        Total Users
                    </span>

                    <strong>
                        {totalUsers}
                    </strong>

                </div>


                <div>

                    <span>
                        Normal Users
                    </span>

                    <strong>
                        {totalNormalUsers}
                    </strong>

                </div>


                <div>

                    <span>
                        Admins
                    </span>

                    <strong>
                        {totalAdmins}
                    </strong>

                </div>


                <div>

                    <span>
                        Active
                    </span>

                    <strong>
                        {activeUsers}
                    </strong>

                </div>


                <div>

                    <span>
                        Suspended
                    </span>

                    <strong>
                        {suspendedUsers}
                    </strong>

                </div>

            </div>


            {/* =================================================
                SEARCH / FILTER / SORT
                ================================================= */}

            <div
                className="admin-users-controls"
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "minmax(250px, 1fr) repeat(3, minmax(150px, 180px)) auto",
                    gap: "12px",
                    marginBottom: "16px"
                }}
            >

                {/* SEARCH */}

                <input
                    type="text"
                    placeholder="Search name, email or ID..."
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
                    }
                    style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid #334155",
                        background: "#0f172a",
                        color: "white",
                        outline: "none"
                    }}
                />


                {/* ROLE */}

                <select
                    value={roleFilter}
                    onChange={(e) =>
                        setRoleFilter(e.target.value)
                    }
                    style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid #334155",
                        background: "#0f172a",
                        color: "white"
                    }}
                >

                    <option value="all">
                        All Roles
                    </option>

                    <option value="user">
                        Users
                    </option>

                    <option value="admin">
                        Admins
                    </option>

                </select>


                {/* STATUS */}

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                    style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid #334155",
                        background: "#0f172a",
                        color: "white"
                    }}
                >

                    <option value="all">
                        All Status
                    </option>

                    <option value="active">
                        Active
                    </option>

                    <option value="suspended">
                        Suspended
                    </option>

                </select>


                {/* SORT */}

                <select
                    value={sortBy}
                    onChange={(e) =>
                        setSortBy(e.target.value)
                    }
                    style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: "1px solid #334155",
                        background: "#0f172a",
                        color: "white"
                    }}
                >

                    <option value="newest">
                        Newest
                    </option>

                    <option value="oldest">
                        Oldest
                    </option>

                    <option value="name-asc">
                        Name A → Z
                    </option>

                    <option value="name-desc">
                        Name Z → A
                    </option>

                    <option value="most-solved">
                        Most Solved
                    </option>

                    <option value="most-submissions">
                        Most Submissions
                    </option>

                </select>


                {/* RESET */}

                <button
                    onClick={resetFilters}
                    style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border:
                            "1px solid #334155",
                        background:
                            "#111827",
                        color: "white",
                        cursor: "pointer"
                    }}
                >
                    Reset
                </button>

            </div>


            {/* =================================================
                RESULTS
                ================================================= */}

            <div
                style={{
                    marginBottom: "12px",
                    color: "#94a3b8",
                    fontSize: "14px"
                }}
            >

                Showing{" "}

                {filteredUsers.length === 0
                    ? 0
                    : startIndex + 1
                }

                {" – "}

                {Math.min(
                    endIndex,
                    filteredUsers.length
                )}

                {" of "}

                {filteredUsers.length}

                {" matching users"}

            </div>


            {/* =================================================
                USERS TABLE
                ================================================= */}

            <div className="admin-users-table">


                {/* HEADER */}

                <div
                    className="admin-users-table-header"
                    style={{
                        gridTemplateColumns:
                            "2fr 2fr 1fr .7fr .8fr 1.2fr 100px"
                    }}
                >

                    <span>
                        USER
                    </span>

                    <span>
                        EMAIL
                    </span>

                    <span>
                        ROLE
                    </span>

                    <span>
                        SOLVED
                    </span>

                    <span>
                        SUBMISSIONS
                    </span>

                    <span>
                        JOINED
                    </span>

                    <span>
                        ACTION
                    </span>

                </div>


                {/* EMPTY */}

                {currentUsers.length === 0 ? (

                    <div className="admin-no-users">

                        No users found.

                    </div>

                ) : (

                    currentUsers.map((user) => (

                        <div
                            className="admin-user-row"
                            key={user._id}
                            style={{
                                gridTemplateColumns:
                                    "2fr 2fr 1fr .7fr .8fr 1.2fr 100px"
                            }}
                        >


                            {/* USER */}

                            <div className="admin-user-info">

                                <div className="admin-user-avatar">

                                    {user.firstName
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "U"}

                                </div>


                                <div>

                                    <strong>

                                        {user.firstName}{" "}

                                        {user.lastName}

                                    </strong>

                                    <small>

                                        ID: {user._id}

                                    </small>

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="admin-user-email">

                                {user.emailId}

                            </div>


                            {/* ROLE */}

                            <div>

                                <span
                                    className={
                                        `admin-user-role ${user.role === "admin"
                                            ? "admin-role"
                                            : "user-role"
                                        }`
                                    }
                                >

                                    {user.role}

                                </span>

                            </div>


                            {/* SOLVED */}

                            <div className="admin-user-number">

                                {user.solvedCount ?? 0}

                            </div>


                            {/* SUBMISSIONS */}

                            <div className="admin-user-number">

                                {user.submissionCount ?? 0}

                            </div>


                            {/* JOINED */}

                            <div className="admin-user-date">

                                {formatDate(
                                    user.createdAt
                                )}

                            </div>


                            {/* ACTION */}

                            <div>

                                <button
                                    onClick={() =>
                                        openUserDetails(user)
                                    }
                                    style={{
                                        padding:
                                            "7px 10px",
                                        borderRadius:
                                            "6px",
                                        border:
                                            "1px solid #334155",
                                        background:
                                            "#111827",
                                        color:
                                            "white",
                                        cursor:
                                            "pointer"
                                    }}
                                >

                                    View

                                </button>

                            </div>

                        </div>

                    ))

                )}

            </div>


            {/* =================================================
                PAGINATION
                ================================================= */}

            {filteredUsers.length > 0 && (

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "center",
                        alignItems:
                            "center",
                        gap: "8px",
                        marginTop: "20px",
                        marginBottom: "20px",
                        flexWrap: "wrap"
                    }}
                >

                    <button
                        disabled={
                            currentPage === 1
                        }
                        onClick={() =>
                            setCurrentPage(
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


                    {Array.from(
                        {
                            length: totalPages
                        },
                        (_, index) =>
                            index + 1
                    ).map((page) => (

                        <button
                            key={page}
                            onClick={() =>
                                setCurrentPage(page)
                            }
                            style={{
                                minWidth:
                                    "38px",
                                background:
                                    currentPage === page
                                        ? "#4f46e5"
                                        : undefined
                            }}
                        >
                            {page}
                        </button>

                    ))}


                    <button
                        disabled={
                            currentPage ===
                            totalPages
                        }
                        onClick={() =>
                            setCurrentPage(
                                (page) =>
                                    Math.min(
                                        totalPages,
                                        page + 1
                                    )
                            )
                        }
                    >
                        Next →
                    </button>

                </div>

            )}


            {/* =================================================
                USER DETAILS MODAL
                ================================================= */}

            {showUserDetails &&
                selectedUser && (

                    <div
                        style={{
                            position:
                                "fixed",
                            inset: 0,
                            background:
                                "rgba(0,0,0,.65)",
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            zIndex: 1000,
                            padding:
                                "20px"
                        }}
                    >

                        <div
                            style={{
                                width:
                                    "min(900px, 100%)",
                                maxHeight:
                                    "90vh",
                                overflowY:
                                    "auto",
                                background:
                                    "#0f172a",
                                border:
                                    "1px solid #334155",
                                borderRadius:
                                    "14px",
                                padding:
                                    "28px",
                                color:
                                    "white"
                            }}
                        >


                            {/* MODAL HEADER */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    marginBottom:
                                        "24px"
                                }}
                            >

                                <div>

                                    <div
                                        style={{
                                            color:
                                                "#818cf8",
                                            fontSize:
                                                "12px",
                                            letterSpacing:
                                                "2px"
                                        }}
                                    >
                                        USER DETAILS
                                    </div>

                                    <h2>

                                        {
                                            selectedUser.firstName
                                        }{" "}

                                        {
                                            selectedUser.lastName
                                        }

                                    </h2>

                                </div>


                                <button
                                    onClick={() => {
                                        setShowUserDetails(
                                            false
                                        );

                                        setActionError(
                                            ""
                                        );
                                    }}
                                >
                                    ✕
                                </button>

                            </div>


                            {loadingDetails && (

                                <p>
                                    Loading detailed user
                                    information...
                                </p>

                            )}


                            {/* USER BASIC INFO */}

                            <div
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(180px, 1fr))",
                                    gap:
                                        "12px",
                                    marginBottom:
                                        "24px"
                                }}
                            >

                                <div>

                                    <small>
                                        Email
                                    </small>

                                    <p>
                                        {
                                            selectedUser.emailId
                                        }
                                    </p>

                                </div>


                                <div>

                                    <small>
                                        Role
                                    </small>

                                    <p>
                                        {
                                            selectedUser.role
                                        }
                                    </p>

                                </div>


                                <div>

                                    <small>
                                        Status
                                    </small>

                                    <p>
                                        {
                                            selectedUser.status ||
                                            "active"
                                        }
                                    </p>

                                </div>


                                <div>

                                    <small>
                                        Joined
                                    </small>

                                    <p>
                                        {
                                            formatDate(
                                                selectedUser.createdAt
                                            )
                                        }
                                    </p>

                                </div>

                            </div>


                            {/* STATISTICS */}

                            <div
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(150px, 1fr))",
                                    gap:
                                        "12px",
                                    marginBottom:
                                        "24px"
                                }}
                            >

                                <div>
                                    <small>
                                        Problems Solved
                                    </small>

                                    <h3>
                                        {
                                            selectedUser.solvedCount ??
                                            0
                                        }
                                    </h3>
                                </div>


                                <div>
                                    <small>
                                        Submissions
                                    </small>

                                    <h3>
                                        {
                                            selectedUser.submissionCount ??
                                            0
                                        }
                                    </h3>
                                </div>


                                <div>
                                    <small>
                                        Favorites
                                    </small>

                                    <h3>
                                        {
                                            selectedUser.favoriteCount ??
                                            0
                                        }
                                    </h3>
                                </div>


                                <div>
                                    <small>
                                        Acceptance Rate
                                    </small>

                                    <h3>
                                        {
                                            selectedUser.acceptanceRate ??
                                            0
                                        }%
                                    </h3>
                                </div>

                            </div>


                            {/* ACTION ERROR */}

                            {actionError && (

                                <div
                                    style={{
                                        padding:
                                            "12px",
                                        marginBottom:
                                            "16px",
                                        borderRadius:
                                            "8px",
                                        background:
                                            "rgba(239,68,68,.1)",
                                        color:
                                            "#f87171"
                                    }}
                                >

                                    {actionError}

                                </div>

                            )}


                            {/* ADMIN ACTIONS */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap:
                                        "10px",
                                    flexWrap:
                                        "wrap"
                                }}
                            >

                                {/* SUBMISSIONS */}

                                <button
                                    onClick={() => {

                                        /*
                                         * Eventually this can navigate
                                         * to a user-specific submission
                                         * page.
                                         */

                                        navigate(
                                            `/admin/submissions?userId=${selectedUser._id}`
                                        );

                                    }}
                                >

                                    View Submissions

                                </button>


                                {/* CHANGE ROLE */}

                                <button
                                    onClick={() =>
                                        setShowRoleConfirm(
                                            true
                                        )
                                    }
                                >

                                    {selectedUser.role ===
                                        "admin"
                                        ? "Make User"
                                        : "Make Admin"}

                                </button>


                                {/* SUSPEND */}

                                <button
                                    onClick={() =>
                                        setShowSuspendConfirm(
                                            true
                                        )
                                    }
                                >

                                    {
                                        (selectedUser.status ||
                                            "active") ===
                                            "active"
                                            ? "Suspend User"
                                            : "Activate User"
                                    }

                                </button>


                                {/* DELETE */}

                                <button
                                    onClick={() =>
                                        setShowDeleteConfirm(
                                            true
                                        )
                                    }
                                >

                                    Delete User

                                </button>

                            </div>


                            {/* =================================================
                                ROLE CONFIRMATION
                                ================================================= */}

                            {showRoleConfirm && (

                                <div
                                    style={{
                                        marginTop:
                                            "20px",
                                        padding:
                                            "20px",
                                        border:
                                            "1px solid #334155",
                                        borderRadius:
                                            "10px"
                                    }}
                                >

                                    <h3>
                                        Change User Role?
                                    </h3>

                                    <p>

                                        Change{" "}

                                        {
                                            selectedUser.firstName
                                        }

                                        {" "}
                                        {
                                            selectedUser.lastName
                                        }

                                        {" "}
                                        from{" "}

                                        <strong>
                                            {
                                                selectedUser.role
                                            }
                                        </strong>

                                        {" "}to{" "}

                                        <strong>

                                            {
                                                selectedUser.role ===
                                                    "admin"
                                                    ? "user"
                                                    : "admin"
                                            }

                                        </strong>
                                        ?

                                    </p>


                                    <div>

                                        <button
                                            onClick={() =>
                                                setShowRoleConfirm(
                                                    false
                                                )
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                        >
                                            Cancel
                                        </button>


                                        <button
                                            onClick={
                                                changeUserRole
                                            }
                                            disabled={
                                                actionLoading
                                            }
                                        >

                                            {actionLoading
                                                ? "Changing..."
                                                : "Confirm"
                                            }

                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* =================================================
                                SUSPEND CONFIRMATION
                                ================================================= */}

                            {showSuspendConfirm && (

                                <div
                                    style={{
                                        marginTop:
                                            "20px",
                                        padding:
                                            "20px",
                                        border:
                                            "1px solid #334155",
                                        borderRadius:
                                            "10px"
                                    }}
                                >

                                    <h3>

                                        {
                                            (selectedUser.status ||
                                                "active") ===
                                                "active"
                                                ? "Suspend User?"
                                                : "Activate User?"
                                        }

                                    </h3>

                                    <p>

                                        Are you sure you want to{" "}

                                        {
                                            (selectedUser.status ||
                                                "active") ===
                                                "active"
                                                ? "suspend"
                                                : "activate"
                                        }

                                        {" "}
                                        this account?

                                    </p>


                                    <button
                                        onClick={() =>
                                            setShowSuspendConfirm(
                                                false
                                            )
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        onClick={
                                            toggleUserStatus
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                    >

                                        {actionLoading
                                            ? "Updating..."
                                            : "Confirm"
                                        }

                                    </button>

                                </div>

                            )}


                            {/* =================================================
                                DELETE CONFIRMATION
                                ================================================= */}

                            {showDeleteConfirm && (

                                <div
                                    style={{
                                        marginTop:
                                            "20px",
                                        padding:
                                            "20px",
                                        border:
                                            "1px solid #ef4444",
                                        borderRadius:
                                            "10px"
                                    }}
                                >

                                    <h3>
                                        Delete User?
                                    </h3>

                                    <p>

                                        This will permanently
                                        delete{" "}

                                        <strong>

                                            {
                                                selectedUser.firstName
                                            }{" "}

                                            {
                                                selectedUser.lastName
                                            }

                                        </strong>

                                        .

                                        <br />

                                        This action should only
                                        be performed after
                                        confirming the data
                                        retention policy.

                                    </p>


                                    <button
                                        onClick={() =>
                                            setShowDeleteConfirm(
                                                false
                                            )
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        onClick={
                                            deleteUser
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                    >

                                        {actionLoading
                                            ? "Deleting..."
                                            : "Delete Permanently"
                                        }

                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                )}

        </div>

    );

}


export default AdminUsers;