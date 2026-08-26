import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {

    const [loading, setLoading] =
        useState(true);

    const [isAdmin, setIsAdmin] =
        useState(false);


    useEffect(() => {

        const checkAdmin = async () => {

            try {

                const response = await fetch(
                    "http://localhost:3000/user/profile",
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    setIsAdmin(false);
                    return;
                }

                const data =
                    await response.json();

                setIsAdmin(
                    data?.user?.role === "admin"
                );

            }
            catch (err) {

                console.error(
                    "Admin Authentication Error:",
                    err
                );

                setIsAdmin(false);

            }
            finally {

                setLoading(false);

            }

        };

        checkAdmin();

    }, []);


    // =====================================================
    // CHECKING AUTHENTICATION
    // =====================================================

    if (loading) {

        return (

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "18px"
                }}
            >
                Checking admin access...
            </div>

        );

    }


    // =====================================================
    // NOT ADMIN
    // =====================================================

    if (!isAdmin) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // =====================================================
    // ADMIN
    // =====================================================

    return <Outlet />;

}

export default AdminProtectedRoute;