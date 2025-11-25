import React, { useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useSearchParams } from "react-router-dom";

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);


const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

function Login() {
    let navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            localStorage.setItem("token", token);

            const decoded = parseJwt(token);
            if (decoded) {
                localStorage.setItem("role", decoded.role || "user");
                const firstName = decoded.first_name || decoded.firstName || decoded.given_name || decoded.name || "User";
                localStorage.setItem("user_name", firstName);
                localStorage.setItem("user_photo", decoded.user_photo_url || "");
            } else {
                localStorage.setItem("role", "user");
                localStorage.setItem("user_name", "User");
            }
            // -------------------------------------------------

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            window.dispatchEvent(new Event('authChange'));
            navigate("/", { replace: true });
        }
    }, [searchParams, navigate]);

    const initialValues = { email: "", password: "" };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string().required("Password is required")
    });

    const onSubmit = async (data, { setSubmitting }) => {
        try {
            const response = await axios.post("/api/auth/login", data);
            const { token, user } = response.data;

            if (token) {
                localStorage.setItem("token", token);
                localStorage.setItem("role", user?.role || 'user');

                if (user) {
                    // Check multiple fields for the first name here as well
                    const firstName = user.first_name || user.firstName || user.given_name || user.name || "User";
                    localStorage.setItem("user_name", firstName);
                    localStorage.setItem("user_photo", user.user_photo_url || "");
                }

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                window.dispatchEvent(new Event('authChange'));

                if (user?.role === 'admin') {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            alert(error.response?.data?.message || "Login failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        window.location.href = `${baseUrl}/api/auth/google`;
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8 bg-background-paper p-10 rounded-xl shadow-lg'>
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-text-main">Welcome Back</h2>
                    <p className="mt-2 text-sm text-text-muted">Sign in to continue to Pollarity</p>
                </div>

                <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                    {({ isSubmitting }) => (
                        <Form className="mt-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                                    <Field name="email" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary bg-surface text-text-main" placeholder="you@example.com"/>
                                    <ErrorMessage name="email" component="span" className='text-status-error text-xs mt-1' />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Password</label>
                                    <Field type="password" name="password" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary bg-surface text-text-main" placeholder="••••••••"/>
                                    <ErrorMessage name="password" component="span" className='text-status-error text-xs mt-1' />
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-content bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-50">
                                {isSubmitting ? "Signing in..." : "Sign In"}
                            </button>

                            <div className="relative flex items-center justify-center py-2">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="flex-shrink-0 mx-4 text-text-muted text-sm">Or continue with</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>

                            <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all">
                                <GoogleIcon />
                                Sign in with Google
                            </button>

                            <p className="mt-4 text-center text-sm text-text-muted">
                                Don't have an account?{' '}
                                <span onClick={() => navigate('/register')} className="font-medium text-secondary hover:text-primary cursor-pointer hover:underline">
                                    Sign up
                                </span>
                            </p>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default Login;