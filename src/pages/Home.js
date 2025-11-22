// src/pages/Home.js
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SAMPLE_SURVEYS = [
    {
        survey_id: 'demo-1',
        title: 'Customer Satisfaction (Demo)',
        createdAt: new Date().toISOString(),
        User: { first_name: 'Demo', last_name: 'Author' },
        questions: [
            { id: 'd1q1', type: 'rating', question: 'How satisfied are you with our product?', required: true },
            { id: 'd1q2', type: 'multiple-choice', question: 'Which feature do you use the most?', options: ['Search','Profiles','Notifications'], required: true },
            { id: 'd1q3', type: 'text', question: 'Any additional feedback?', required: false }
        ]
    },
    {
        survey_id: 'demo-2',
        title: 'Event Interest (Demo)',
        createdAt: new Date().toISOString(),
        User: { first_name: 'Demo', last_name: 'Organizer' },
        questions: [
            { id: 'd2q1', type: 'checkbox', question: 'Which event types interest you?', options: ['Music','Workshops','Networking'], required: true },
            { id: 'd2q2', type: 'text', question: 'What would you like to see at our events?', required: false }
        ]
    }
];

export const Home = () => {

    //const [surveys, setSurveys] = useState([]);


    const [listOfSurveys, setListOfSurveys] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurveys = async () => {

            const token = localStorage.getItem("token");

            if (!token) {
                // No token: show message prompting login — server requires auth for surveys
                setListOfSurveys([]);
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
        <>
        <div className="container mx-auto mt-10 p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-text-main mb-2">Welcome to Pollarity</h1>
                <p className="text-text-muted text-lg">The place to have all YOUR questions answered</p>
            </div>

                         <div className="min-h-screen bg-[#e0e1dd]">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(listOfSurveys && listOfSurveys.length > 0 ? listOfSurveys : SAMPLE_SURVEYS).map((s) => (
                            <div key={s.survey_id} className="bg-white rounded-lg shadow p-4">
                                <h3 className="text-xl font-semibold">{s.title}</h3>
                                <p className="text-sm text-gray-500">By {s.User?.first_name} {s.User?.last_name}</p>
                                <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">{s.questions ? s.questions.length : 0} question{s.questions && s.questions.length !== 1 ? 's' : ''}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate('/userdash', { state: { survey: s, fromHome: true } })}
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
                        ))}
                    </div>
            </main>
        
            </div>
        </div>
        </>
    );
}

export default Home;

