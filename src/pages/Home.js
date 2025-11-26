// src/pages/Home.js
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {

    const [listOfSurveys, setListOfSurveys] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const response = await axios.get("/api/surveys");
                setListOfSurveys(response.data);
            } catch (error) {
                console.error("Failed to grab surveys", error);
            }
        };

        fetchSurveys();
    }, [navigate]);

    console.log("Surveys from API:", listOfSurveys);

    return (
        <>
        <div className="container mx-auto mt-10 p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-text-main mb-2">Welcome to Pollarity</h1>
                <p className="text-text-muted text-lg">The place to have all YOUR questions answered</p>
            </div>

                         <div className="min-h-screen bg-[#e0e1dd]">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listOfSurveys.map((s) => {
                            const obj = s && s.dataValues ? s.dataValues : s || {};
                            const count = obj.question_count ?? obj.questionCount ?? (obj.Questions ? obj.Questions.length : (obj.questions ? obj.questions.length : 0));
                            const author = obj.author ?? (obj.User ? `${obj.User.first_name || ''} ${obj.User.last_name || ''}`.trim() : 'Unknown');
                            return (
                                <div key={obj.survey_id || obj.id} className="bg-white rounded-lg shadow p-4">
                                    <h3 className="text-xl font-semibold">{obj.title}</h3>

                                    <p className="text-sm text-gray-500">By {author}</p>
                                    <p className="text-xs text-gray-400">{obj.createdAt ? new Date(obj.createdAt).toLocaleDateString() : ''}</p>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-gray-600 text-sm">{`${count} question${count !== 1 ? 's' : ''}`}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/survey/${obj.nice_url}`) }
                                                className="bg-blue-600 text-white px-3 py-1 rounded"
                                            >
                                                Answer
                                            </button>
                                            {!localStorage.getItem('token') && (
                                                <button onClick={() => navigate('/login')} className="bg-green-600 text-white px-3 py-1 rounded">Login</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
            </main>
        
            </div>
        </div>
        </>
    );
}

export default Home;