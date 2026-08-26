import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../../services/api";

function AdminRoute() {

    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {

        const checkAdmin = async () => {

            try {

                const response = await api.get("/user/profile");

                const user =
                    response.data?.user ||
                    response.data?.data ||
                    response.data?.result ||
                    response.data;

                setIsAdmin(user?.role === "admin");

            } catch (error) {

                console.error(
                    "Admin authentication error:",
                    error
                );

                setIsAdmin(false);

            } finally {

                setLoading(false);

            }

        };

        checkAdmin();

    }, []);

    // Wait while checking authentication
    if (loading) {

        return (
            <div
                style={{
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8b9bb4"
                }}
            >
                Checking admin access...
            </div>
        );

    }

    // Not an admin → normal profile
    if (!isAdmin) {

        return <Navigate to="/profile" replace />;

    }

    // Admin → render requested admin page
    return <Outlet />;

}

export default AdminRoute;