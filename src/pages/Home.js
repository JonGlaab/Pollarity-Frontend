import axios from 'axios';
import { useEffect, useState } from 'react';
// import { useNavigate } from "react-router-dom";

export const Home = (props) => {
    const [listOfSurveys, setListOfSurveys] = useState([]);

    // let navigate = useNavigate();

    useEffect(() => {
    const fetchSurveys = async () => {
        try {
        const response = await axios.get("http://Pollarity/surveys",  {
            withCredentials: true,}
            );
        setListOfSurveys(response.data);
        } catch (error) {
        console.error("failed to grab surveys", error);
        }
    };

    fetchSurveys();
    }, []);

    return (
        <div className="container">
            <h1>Welcome to Pollarity</h1>
            <p>The place to have all YOUR questions answered</p>
            <div className="surveyContainer">
                <table className="SurveyTable">
                <thead>
                    <tr>
                    <th>Survey</th>
                    <th>Created by</th>
                    <th>Created on</th>
                    </tr>
                </thead>

                <tbody>
                    {listOfSurveys.map((survey) => (
                    <tr key={survey.id}>
                        <td>{survey.title}</td>
                        <td>{new Date(survey.createdAt).toLocaleString()}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
    );
}

export default Home;