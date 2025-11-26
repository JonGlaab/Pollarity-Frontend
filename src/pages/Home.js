// src/pages/Home.js
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Globe, Users } from 'lucide-react'; // Import icons

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
    }, []);

    return (
        <div className="bg-[#e0e1dd] min-h-screen">
            {/* Hero Section */}
            <section className="bg-[#778da9] text-white overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between py-12"> {/* Reduced padding */}
                        {/* Left: Text Content */}
                        <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0 z-10">
                            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
                                Welcome to Pollarity
                            </h1>
                            <p className="text-lg md:text-xl text-[#e0e1dd] max-w-xl mx-auto md:mx-0">
                                The place to have all YOUR questions answered.
                            </p>
                        </div>

                        {/* Right: Globe Illustration */}
                        <div className="md:w-1/2 flex items-center justify-center relative">
                            <div className="relative w-64 h-64 md:w-80 md:h-80 animate-float">
                                <Globe size="100%" className="text-[#415a77] opacity-30" strokeWidth={0.5} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 md:w-56 md:h-56 bg-[#1b263b] rounded-full opacity-20 animate-pulse"></div>
                                </div>
                                {/* People Icons */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-5">
                                    <Users size={40} className="text-white" />
                                </div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-5">
                                    <Users size={40} className="text-white" />
                                </div>
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5">
                                    <Users size={40} className="text-white" />
                                </div>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5">
                                    <Users size={40} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Surveys Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-3xl font-bold text-center text-[#0d1b2a] mb-8">
                    Explore Public Surveys
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listOfSurveys.map((s) => {
                        const obj = s && s.dataValues ? s.dataValues : s || {};
                        const count = obj.question_count ?? obj.questionCount ?? (obj.Questions ? obj.Questions.length : (obj.questions ? obj.questions.length : 0));
                        const author = obj.author ?? (obj.User ? `${obj.User.first_name || ''} ${obj.User.last_name || ''}`.trim() : 'Unknown');
                        return (
                            <div key={obj.survey_id || obj.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
                                <h3 className="text-xl font-semibold text-[#0d1b2a] mb-2">{obj.title}</h3>
                                <p className="text-sm text-[#415a77] mb-1">By {author}</p>
                                <p className="text-xs text-[#778da9] mb-4">{obj.createdAt ? new Date(obj.createdAt).toLocaleDateString() : ''}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#415a77] text-sm font-medium">{`${count} question${count !== 1 ? 's' : ''}`}</span>
                                    <Button
                                        onClick={() => navigate(`/survey/${obj.nice_url}`)}
                                        className="bg-[#1b263b] hover:bg-[#0d1b2a] text-white px-4 py-2 rounded-md"
                                    >
                                        Answer
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

export default Home;