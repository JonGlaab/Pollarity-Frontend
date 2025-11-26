import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SurveyExportMenu } from '../components/SurveyExportMenu';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { AlertTriangle, Lock } from 'lucide-react';

const BannedUser = () => {
    const [surveys, setSurveys] = useState([]);

    useEffect(() => {
        const fetchSurveys = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get("/api/surveys/mine", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setSurveys(response.data.filter(s => s.status === 'closed') || []);
            } catch (error) {
                console.error("Failed to fetch surveys", error);
            }
        };
        fetchSurveys();
    }, []);

    return (
        <div className="min-h-screen bg-red-50 p-8 flex flex-col items-center">
            <div className="max-w-3xl w-full space-y-8">

                {/* Warning Banner */}
                <div className="bg-white border-l-4 border-red-500 p-6 rounded shadow-lg flex items-start gap-4">
                    <AlertTriangle className="text-red-500 w-12 h-12 shrink-0" />
                    <div>
                        <h1 className="text-2xl font-bold text-red-700 mb-2">Account Suspended</h1>
                        <p className="text-gray-600">
                            Your account has been banned due to a violation of our terms.
                            Your published surveys have been closed. You may still access your data below.
                        </p>
                    </div>
                </div>


                <Card>
                    <CardHeader>
                        <CardTitle>Your Data Archive</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {surveys.length === 0 ? (
                            <p className="text-gray-500 italic">No closed surveys found.</p>
                        ) : (
                            <div className="space-y-4">
                                {surveys.map(s => (
                                    <div key={s.survey_id} className="flex justify-between items-center p-4 border rounded bg-gray-50">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                                <Lock size={14} /> {s.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {s.question_count} Questions • Closed on {new Date(s.updatedAt || Date.now()).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <SurveyExportMenu
                                            surveyId={s.survey_id}
                                            surveyTitle={s.title}
                                            buttonSize="sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BannedUser;