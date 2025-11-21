// src/pages/Home.js
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const [listOfSurveys, setListOfSurveys] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurveys = async () => {

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get("/api/surveys", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setListOfSurveys(response.data);
            } catch (error) {
                console.error("Failed to grab surveys", error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            }
        };

        fetchSurveys();
    }, [navigate]);

    return (
        <div className="container mx-auto mt-10 p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-text-main mb-2">Welcome to Pollarity</h1>
                <p className="text-text-muted text-lg">The place to have all YOUR questions answered</p>
            </div>

            <div className="overflow-x-auto shadow-md sm:rounded-lg bg-background-paper">
                <table className="w-full text-sm text-left text-text-muted">
                    <thead className="text-xs text-text-main uppercase bg-background border-b border-gray-200">
                    <tr>
                        <th scope="col" className="px-6 py-3">Survey Title</th>
                        <th scope="col" className="px-6 py-3">Created By</th>
                        <th scope="col" className="px-6 py-3">Created On</th>
                    </tr>
                    </thead>
                    <tbody>
                    {listOfSurveys.map((survey) => (
                        <tr key={survey.survey_id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">
                                {survey.title}
                            </td>
                            <td className="px-6 py-4">
                                {survey.User ? `${survey.User.first_name} ${survey.User.last_name}` : 'Unknown'}
                            </td>
                            <td className="px-6 py-4">
                                {new Date(survey.createdAt).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                    {listOfSurveys.length === 0 && (
                        <tr>
                            <td colSpan="3" className="px-6 py-4 text-center">No surveys found.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Home;