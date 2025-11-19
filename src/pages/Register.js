import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom";

function Register() {

    let navigate = useNavigate();
    const initialValues = {
        firstName: "",
        lastName: "",
        DoB: "",
        email: "",  
        password: ""
    };

    const validationSchema = Yup.object().shape({
        userEmail: Yup.string().email("Invalid email").min(2).max(100).required("You must have a valid email"),
        firstName: Yup.string().min(2).max(100).required("first name required"),
        lastName: Yup.string().min(2).max(100).required("last name required"),
        password: Yup.string().min(8).required("password is required") 
    });

    const onSubmit = async (data) => {
    try {
        await axios.post("http://Pollarity/register", data);

        console.log("User registered");
        navigate("/login/");
        
    } catch (error) {
        alert(error.response?.data?.error || "Registration failed");
    }};

    return (
        <div className='registrationPage'> 
            <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
            <Form className='formContainer'>

                <label>First Name</label>
                <ErrorMessage name="firstName" component="span" className='error' />
                <Field id="register" name="firstName" />

                <label>Last Name</label>
                <ErrorMessage name="lastName" component="span" className='error' />
                <Field id="register" name="lastName" />

                <label>Email</label>
                <ErrorMessage name="email" component="span" className='error' />
                <Field type="email" id="register" name="email" placeholder="you@email.com" />

                <label>Password</label>
                <ErrorMessage name="password" component="span" className='error' />
                <Field type="password" id="register" name="password" placeholder="not 'password'" />

                <button type="submit">sign me up!</button>
            </Form>
            </Formik>     
        </div>
    );
}

export default Register;