import { useEffect, useState } from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import api from "../services/api";

import "./Navbar.css";


function Navbar() {

    const location = useLocation();

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [loadingUser, setLoadingUser] = useState(true);

    const [loggingOut, setLoggingOut] = useState(false);


    // ==========================================
    // GET LOGGED-IN USER
    // ==========================================

    useEffect(() => {

        const fetchUser = async () => {

            try {

                const response =
                    await api.get("/user/profile");

                console.log(
                    "Navbar Profile:",
                    response.data
                );


                /*
                 * Your profile API may return the user
                 * directly or inside user/data/result.
                 */

                const profile =
                    response.data?.user ||
                    response.data?.data ||
                    response.data?.result ||
                    response.data;


                setUser(profile);

            }
            catch (error) {

                // User is simply not logged in
                setUser(null);

            }
            finally {

                setLoadingUser(false);

            }

        };


        fetchUser();

    }, [location.pathname]);


    // ==========================================
    // ADMIN CHECK
    // ==========================================

    const isAdmin =
        user?.role === "admin";


    /*
     * Admin → /admin
     * Normal user → /profile
     */

    const profilePath =
        isAdmin
            ? "/admin"
            : "/profile";


    // ==========================================
    // ACTIVE LINK
    // ==========================================

    const isActive = (path) => {

        if (path === "/problems") {

            return (
                location.pathname === "/problems" ||
                location.pathname.startsWith("/problem/")
            );

        }


        if (path === "/profile") {

            return location.pathname.startsWith(
                "/profile"
            );

        }


        if (path === "/admin") {

            return location.pathname === "/admin";

        }


        if (path === "/login") {

            return location.pathname === "/login";

        }


        if (path === "/register") {

            return location.pathname === "/register";

        }


        return location.pathname === path;

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = async () => {

        try {

            setLoggingOut(true);


            await api.post("/user/logout");


            // Remove user from navbar immediately
            setUser(null);


            // Go to login page
            navigate("/login");

        }
        catch (error) {

            console.error(
                "Logout Error:",
                error
            );

        }
        finally {

            setLoggingOut(false);

        }

    };


    return (

        <nav className="nexus-navbar">


            {/* ==========================================
                LOGO
                ========================================== */}

            <div className="nexus-navbar-logo">

                <Link
                    to="/"
                    className="nexus-brand"
                >

                    <span className="nexus-brand-mark">

                        &lt;/&gt;

                    </span>

                    <span className="nexus-brand-text">

                        NEXUS<span>.</span>

                    </span>

                </Link>

            </div>


            {/* ==========================================
                NAVIGATION
                ========================================== */}

            <div className="nexus-navbar-links">


                {/* ========================================
                    PROBLEMS
                    ======================================== */}

                <Link
                    to="/problems"
                    className={`nexus-nav-link ${
                        isActive("/problems")
                            ? "active"
                            : ""
                    }`}
                >

                    <span className="nav-link-icon">

                        ⌘

                    </span>

                    <span>

                        Problems

                    </span>

                </Link>


                {/* ========================================
                    PROFILE / ADMIN
                    ======================================== */}

                {!loadingUser && user && (

                    <Link
                        to={profilePath}
                        className={`nexus-nav-link ${
                            isAdmin
                                ? (
                                    isActive("/admin")
                                        ? "active"
                                        : ""
                                )
                                : (
                                    isActive("/profile")
                                        ? "active"
                                        : ""
                                )
                        }`}
                    >

                        <span className="nav-link-icon">

                            ◉

                        </span>

                        <span>

                            Profile

                        </span>

                    </Link>

                )}


                {/* ========================================
                    DIVIDER
                    ======================================== */}

                <div className="nexus-nav-divider" />


                {/* ========================================
                    LOGGED OUT
                    ======================================== */}

                {!loadingUser && !user && (

                    <>

                        <Link
                            to="/login"
                            className={`nexus-login-link ${
                                isActive("/login")
                                    ? "active"
                                    : ""
                            }`}
                        >

                            Login

                        </Link>


                        <Link
                            to="/register"
                            className={`nexus-register-btn ${
                                isActive("/register")
                                    ? "register-active"
                                    : ""
                            }`}
                        >

                            <span>

                                Get Started

                            </span>

                            <span className="register-arrow">

                                →

                            </span>

                        </Link>

                    </>

                )}


                {/* ========================================
                    LOGGED IN → LOGOUT
                    ======================================== */}

                {!loadingUser && user && (

                    <button
                        type="button"
                        className="nexus-login-link"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: loggingOut
                                ? "default"
                                : "pointer",
                            font: "inherit",
                            opacity: loggingOut
                                ? 0.6
                                : 1
                        }}
                    >

                        {loggingOut
                            ? "Logging out..."
                            : "Logout"
                        }

                    </button>

                )}

            </div>

        </nav>

    );

}


export default Navbar;