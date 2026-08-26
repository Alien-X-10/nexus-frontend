import { BrowserRouter, Routes, Route } from "react-router-dom";

// =====================================================
// NORMAL USER LAYOUT
// =====================================================

import MainLayout from "./layouts/MainLayout";

// =====================================================
// NORMAL USER PAGES
// =====================================================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Problems from "./pages/Problems";
import Problem from "./pages/Problem";
import Profile from "./pages/Profile";
import SubmissionDetails from "./pages/SubmissionDetails";

// =====================================================
// ADMIN LAYOUT
// =====================================================

import AdminLayout from "./pages/admin/AdminLayout";

// =====================================================
// ADMIN PAGES
// =====================================================

import Admin from "./pages/admin/Admin";
import AdminProblems from "./pages/admin/AdminProblems";
import CreateProblem from "./pages/admin/CreateProblem";
import EditProblem from "./pages/admin/EditProblem";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminSubmissionDetails from "./pages/admin/AdminSubmissionDetails";

// =====================================================
// ADMIN PROTECTION
// =====================================================

import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* =====================================================
                    NORMAL USER ROUTES
                    ===================================================== */}

                <Route
                    path="/"
                    element={
                        <MainLayout>
                            <Home />
                        </MainLayout>
                    }
                />

                <Route
                    path="/login"
                    element={
                        <MainLayout>
                            <Login />
                        </MainLayout>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <MainLayout>
                            <Register />
                        </MainLayout>
                    }
                />

                <Route
                    path="/problems"
                    element={
                        <MainLayout>
                            <Problems />
                        </MainLayout>
                    }
                />

                <Route
                    path="/problem/:id"
                    element={
                        <MainLayout>
                            <Problem />
                        </MainLayout>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <MainLayout>
                            <Profile />
                        </MainLayout>
                    }
                />

                <Route
                    path="/submission/:submissionId"
                    element={
                        <MainLayout>
                            <SubmissionDetails />
                        </MainLayout>
                    }
                />


                {/* =====================================================
                    ADMIN ROUTES

                    AdminProtectedRoute
                            ↓
                    AdminLayout
                            ↓
                    Admin pages

                    ===================================================== */}

                <Route
                    element={<AdminProtectedRoute />}
                >

                    <Route
                        path="/admin"
                        element={<AdminLayout />}
                    >

                        {/* =================================================
                            ADMIN DASHBOARD
                            ================================================= */}

                        <Route
                            index
                            element={<Admin />}
                        />


                        {/* =================================================
                            ADMIN PROBLEMS
                            ================================================= */}

                        <Route
                            path="problems"
                            element={<AdminProblems />}
                        />


                        {/* =================================================
                            CREATE PROBLEM
                            ================================================= */}

                        <Route
                            path="problems/create"
                            element={<CreateProblem />}
                        />


                        {/* =================================================
                            UPDATE PROBLEM
                            ================================================= */}

                        <Route
                            path="problems/:id/edit"
                            element={<EditProblem />}
                        />


                        {/* =================================================
                            ADMIN USERS
                            ================================================= */}

                        <Route
                            path="users"
                            element={<AdminUsers />}
                        />


                        {/* =================================================
                            ADMIN SUBMISSIONS
                            ================================================= */}

                        <Route
                            path="submissions"
                            element={<AdminSubmissions />}
                        />


                        {/* =================================================
                            ADMIN SUBMISSION DETAILS
                            ================================================= */}

                        <Route
                            path="submissions/:submissionId"
                            element={<AdminSubmissionDetails />}
                        />

                    </Route>

                </Route>

            </Routes>

        </BrowserRouter>

    );
}

export default App;