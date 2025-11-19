import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom";

function Login() {

    let navigate = useNavigate();
    const initialValues = {
        password: "",
        userEmail: ""
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email("Invalid email").max(360).required("You must input a valid email"),
        password: Yup.string().min(6).max(50).required("password is required") 
    });  

    const onSubmit = async (data) => {
        try {
            await axios.post("http://Pollarity/register", data);

            console.log("User registered");
            navigate("/login/");
            
        } catch (error) {
            console.error("Registration error:", error);
            alert(error.response?.data?.error || "Registration failed"); }
    };

    return (
        <div className='loginPage'> 
            <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
            <Form className='formContainer'>

                <label>Email</label>
                <ErrorMessage name="userEmail" component="span" className='error' />
                <Field id="login" name="userEmail" placeholder="you@email.com" />

                <label>Password</label>
                <ErrorMessage name="password" component="span" className='error' />
                <Field type="password" id="login" name="password" placeholder="password" />
                <button type="submit">Login</button>

            </Form>
            </Formik>     
        </div>
  );
}

export default Login;