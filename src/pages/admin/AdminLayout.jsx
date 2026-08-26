import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout() {
    return (
        <div className="admin-layout">

            {/* ==========================================
                ADMIN SIDEBAR
            ========================================== */}

            <aside className="admin-sidebar">

                {/* BRAND */}

                <div className="admin-sidebar-brand">

                    <div className="admin-sidebar-logo">
                        &lt;/&gt;
                    </div>

                    <div>
                        <div className="admin-sidebar-title">
                            NEXUS<span>.</span>
                        </div>

                        <div className="admin-sidebar-subtitle">
                            ADMIN PANEL
                        </div>
                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="admin-sidebar-nav">

                    <div className="admin-sidebar-section">
                        MANAGEMENT
                    </div>


                    {/* DASHBOARD */}

                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `admin-sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="admin-sidebar-icon">
                            ◈
                        </span>

                        <span>
                            Dashboard
                        </span>

                    </NavLink>


                    {/* PROBLEMS */}

                    <NavLink
                        to="/admin/problems"
                        className={({ isActive }) =>
                            `admin-sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="admin-sidebar-icon">
                            ▤
                        </span>

                        <span>
                            Problems
                        </span>

                    </NavLink>


                    {/* USERS */}

                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                            `admin-sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="admin-sidebar-icon">
                            ◎
                        </span>

                        <span>
                            Users
                        </span>

                    </NavLink>


                    {/* SUBMISSIONS */}

                    <NavLink
                        to="/admin/submissions"
                        className={({ isActive }) =>
                            `admin-sidebar-link ${
                                isActive ? "active" : ""
                            }`
                        }
                    >

                        <span className="admin-sidebar-icon">
                            ◫
                        </span>

                        <span>
                            Submissions
                        </span>

                    </NavLink>

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="admin-sidebar-bottom">

                    <div className="admin-sidebar-status">

                        <span className="admin-status-dot"></span>

                        <div>

                            <div className="admin-status-title">
                                Admin Access
                            </div>

                            <div className="admin-status-text">
                                Authorized
                            </div>

                        </div>

                    </div>


                    <NavLink
                        to="/problems"
                        className="admin-back-platform"
                    >
                        ← Back to Platform
                    </NavLink>

                </div>

            </aside>


            {/* ==========================================
                ADMIN CONTENT
            ========================================== */}

            <section className="admin-layout-content">

                {/* TOP BAR */}

                <div className="admin-layout-topbar">

                    <div className="admin-layout-topbar-title">
                        NEXUS Admin
                    </div>

                    <div className="admin-layout-topbar-status">

                        <span className="admin-online-dot"></span>

                        Administrator

                    </div>

                </div>


                {/* PAGE CONTENT */}

                <main className="admin-layout-page">

                    <Outlet />

                </main>

            </section>

        </div>
    );
}

export default AdminLayout;