import React, { useState } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom";
import TermsModal from '../components/TermsModal';

function Register() {
    let navigate = useNavigate();
    const [isModalOpen, setModalOpen] = useState(false);

    const initialValues = {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreedToTerms: false
    };

    const validationSchema = Yup.object().shape({
        first_name: Yup.string().min(2).max(100).required("First name is required"),
        last_name: Yup.string().min(2).max(100).required("Last name is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required'),
        agreedToTerms: Yup.boolean().oneOf([true], "You must accept the terms of service to register.")
    });

    const onSubmit = async (data, { setSubmitting }) => {
        try {
            const response = await axios.post("/api/auth/register", data);

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                navigate("/");
            }else {
                navigate("/login");
            }
        } catch (error) {
            console.error("Registration Error", error);
            const message = error.response?.data?.message || error.response?.data?.error || "Registration failed";
            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8'>

            <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
                {({ isSubmitting, setFieldValue, values }) => (
                    <>
                        <Form className='max-w-md w-full space-y-6 bg-background-paper p-10 rounded-xl shadow-lg'>
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-text-main">Create Account</h2>
                                <p className="mt-2 text-sm text-text-muted">
                                    Join Pollarity today
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-text-muted">First Name</label>
                                        <Field
                                            name="first_name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary bg-surface text-text-main"
                                        />
                                        <ErrorMessage name="first_name" component="span" className='text-status-error text-xs' />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-text-muted">Last Name</label>
                                        <Field
                                            name="last_name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary bg-surface text-text-main"
                                        />
                                        <ErrorMessage name="last_name" component="span" className='text-status-error text-xs' />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-muted">Email</label>
                                    <Field
                                        type="email"
                                        name="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary bg-surface text-text-main"
                                    />
                                    <ErrorMessage name="email" component="span" className='text-status-error text-xs' />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-muted">Password</label>
                                    <Field
                                        type="password"
                                        name="password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary bg-surface text-text-main"
                                    />
                                    <ErrorMessage name="password" component="span" className='text-status-error text-xs' />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-muted">Confirm Password</label>
                                    <Field
                                        type="password"
                                        name="confirmPassword"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondary bg-surface text-text-main"
                                    />
                                    <ErrorMessage name="confirmPassword" component="span" className='text-status-error text-xs' />
                                </div>


                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={values.agreedToTerms}
                                        readOnly
                                        className="h-4 w-4 text-secondary border-gray-300 rounded cursor-pointer accent-secondary"
                                        onClick={() => setModalOpen(true)}
                                    />
                                    <label className="ml-2 block text-sm text-text-main">
                                        I agree to the{' '}
                                        <span
                                            onClick={() => setModalOpen(true)}
                                            className="text-secondary font-bold cursor-pointer hover:underline"
                                        >
                                            Terms of Service
                                        </span>
                                        {' '}and confirm I am 16+.
                                    </label>
                                </div>
                                <ErrorMessage name="agreedToTerms" component="div" className='text-status-error text-xs' />
                            </div>


                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-content bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Signing Up..." : "Sign Up"}
                            </button>

                            <p className="mt-2 text-center text-sm text-text-muted">
                                Already have an account?{' '}
                                <span
                                    onClick={() => navigate('/login')}
                                    className="font-medium text-secondary hover:text-primary cursor-pointer"
                                >
                                    Sign in
                                </span>
                            </p>
                        </Form>


                        <TermsModal
                            isOpen={isModalOpen}
                            onClose={() => {setModalOpen(false); setFieldValue('agreedToTerms', false)}}
                            onAgree={() => {
                                setFieldValue('agreedToTerms', true);
                                setModalOpen(false);
                            }}
                        />
                    </>
                )}
            </Formik>
        </div>
    );
}

export default Register;