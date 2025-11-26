import { Tabs, TabsContent, TabsList, TabsTrigger,} from "../components/ui/tabs";

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { SurveyForm } from '../components/SurveyForm';
import ResponseTrend from '../components/ResponseTrend';
import { SurveyExportMenu } from '../components/SurveyExportMenu';
import { SurveyResults } from '../components/SurveyResults';
import QuestionChart from '../components/QuestionChart';

import { Button } from '../components/ui/button';

export const UserDash = () => {

    const [surveys, setSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [activeView, setActiveView] = useState("browse");
    const [selectedClosedId, setSelectedClosedId] = useState(null);
    const [resultsCache, setResultsCache] = useState({});
    const [isResultsLoading, setIsResultsLoading] = useState(false);

    const handleViewResults = (survey) => {
        const fetchAndNavigate = async () => {
            await fetchResultsForSurvey(survey);
            setActiveView('results');
        };
        fetchAndNavigate();
    };

    const publishedSurveys = surveys.filter(s => s.status === 'published' || s.status === 'open');
    const draftSurveys = surveys.filter(s => s.status === 'draft');
    const closedSurveys = surveys.filter(s => s.status === 'closed');


    // Fetch results and set `selectedSurvey`
    const fetchResultsForSurvey = async (survey) => {
        if (!survey) return;
        const cached = resultsCache[survey.survey_id];
        if (cached) {
            setSelectedSurvey(cached);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Not authenticated');
            return;
        }

        setIsResultsLoading(true);
        try {
            const res = await axios.get(`/api/surveys/${survey.survey_id}/aggregates`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const payload = res.data;


            const transformed = {
                title: payload.survey_title || survey.title,
                description: '',
                responses: payload.kpis ? parseInt(payload.kpis.total_responses || 0, 10) : 0,
                unique_respondents: payload.kpis ? parseInt(payload.kpis.unique_respondents || 0, 10) : 0,
                first_response_at: payload.kpis ? payload.kpis.first_response_at : null,
                last_response_at: payload.kpis ? payload.kpis.last_response_at : null,
                submission_dates: payload.submission_dates || [],

                questions: (payload.questions || []).map(q => {
                    if (['multiple_choice', 'checkbox'].includes(q.question_type)) {
                        // Standardize option data
                        const data = (q.options || []).map(o => ({
                            option: o.option_text,
                            label: o.option_text,
                            count: o.count || 0,
                            value: o.count || 0,
                            percentage: o.percentage || 0
                        }));

                        return {
                            title: q.question_text,
                            type: q.question_type,
                            data: data,
                            cooccurrence: q.cooccurrence || []
                        };
                    } else if (q.question_type === 'short_answer') {
                        return {
                            title: q.question_text,
                            type: 'short_answer',
                            data: q.data || []
                        };
                    }
                    return { title: q.question_text, type: q.question_type, data: [] };
                })
            };

            setResultsCache(prev => ({ ...prev, [survey.survey_id]: transformed }));
            setSelectedSurvey(transformed);
        } catch (err) {
            console.error('Failed to fetch results', err);
            toast.error('Failed to load results');
        } finally {
            setIsResultsLoading(false);
        }
    };

    const selectClosedSurvey = async (survey) => {
        setSelectedClosedId(survey.survey_id);
        await fetchResultsForSurvey(survey);
    };

    const downloadExport = async (surveyId, format) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Not authenticated');
            return;
        }

        try {
            const res = await axios.get(`/api/surveys/${surveyId}/export/${format}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const disposition = res.headers['content-disposition'] || '';
            let filename = `survey_${surveyId}_results.${format === 'csv' ? 'csv' : 'xlsx'}`;
            const match = /filename="?(.*)"?/.exec(disposition);
            if (match && match[1]) filename = match[1];

            const blob = new Blob([res.data], { type: res.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`Downloaded ${filename}`);
        } catch (err) {
            console.error('Export failed', err);
            const message = err.response?.data?.error || 'Failed to export data';
            toast.error(message);
        }
    };

    const [downloadingAll, setDownloadingAll] = useState(false);

    const handleExportAll = async (surveysToExport, format) => {
        setDownloadingAll(true);
        try {
            for (const s of surveysToExport) {
                await downloadExport(s.survey_id, format);
            }
            toast.success('All exports completed');
        } catch (err) {
            console.error('Export all failed', err);
            toast.error('Failed to export all surveys');
        } finally {
            setDownloadingAll(false);
        }
    };

    const handleExportAllPrompt = (surveysList) => {
        if (!surveysList || surveysList.length === 0) {
            toast.error('No closed surveys to export');
            return;
        }

        const toastId = `export-all-prompt-${Date.now()}`;
        toast(`Export ${surveysList.length} survey(s) — choose format`, {
            id: toastId,
            action: (
                <div className="flex gap-2">
                    <Button onClick={() => { handleExportAll(surveysList, 'csv'); toast.dismiss && toast.dismiss(toastId); }} size="sm">CSV</Button>
                    <Button onClick={() => { handleExportAll(surveysList, 'excel'); toast.dismiss && toast.dismiss(toastId); }} size="sm">Excel</Button>
                    <Button variant="ghost" onClick={() => { toast.dismiss && toast.dismiss(toastId); }} size="sm">Cancel</Button>
                </div>
            )
        });
    };

    const handleSurveySubmit = () => {
        setActiveView("browse");
        setSelectedSurvey(null);
    };

    const handleClose = async (niceUrl) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Not authenticated');
            return;
        }

        try {
            await axios.post(`/api/surveys/${niceUrl}/close`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSurveys(prev => prev.map(s => s.nice_url === niceUrl ? { ...s, status: 'closed' } : s));
            toast.success('Survey closed');
        } catch (err) {
            console.error('Failed to close survey', err);
            toast.error('Failed to close survey');
        }
    };

    const handleBack = () => {
        setActiveView("browse");
        setSelectedSurvey(null);
    };

    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurveys = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await axios.get("/api/surveys/mine", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSurveys(response.data || []);
            } catch (error) {
                console.error("Failed to fetch your surveys", error);
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
            <div className="min-h-screen pt-10">

                <header className="bg-white border-b shadow-sm">
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {activeView === "browse" ? (
                        <Tabs defaultValue="open" className="space-y-6">
                            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3">
                                <TabsTrigger value="open">Published Surveys</TabsTrigger>
                                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                                <TabsTrigger value="closed">Past Surveys</TabsTrigger>
                            </TabsList>

                            <TabsContent value="open" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {publishedSurveys.length === 0 && (
                                        <div className="col-span-full text-center text-gray-500">No published surveys yet.</div>
                                    )}
                                    {publishedSurveys.map(s => (
                                        <div key={s.survey_id} className="p-4 border rounded-lg bg-white">
                                            <h3 className="text-lg font-semibold">{s.title}</h3>
                                            <p className="text-sm text-gray-500">Questions: {s.question_count}</p>
                                            <div className="mt-3 flex gap-2">
                                                <Button onClick={() => navigate(`/survey/${s.nice_url}`)}>Open</Button>
                                                <Button variant="outline" onClick={() => handleClose(s.nice_url)}>Close</Button>
                                                <Button variant="ghost" onClick={() => handleViewResults(s)}>Results</Button>
                                                {!s.has_answers && (
                                                    <Button variant="outline" onClick={() => navigate(`/survey/edit/${s.nice_url}`)}>Edit</Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="drafts" className="space-y-6">
                                <div className="text-center max-w-2xl mx-auto">
                                    <h2 className="text-gray-900">Draft Surveys</h2>
                                    <p className="text-gray-600 mt-2">Continue working on your unfinished surveys</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {draftSurveys.map(s => (
                                        <div key={s.survey_id} className="p-4 border rounded-lg bg-white">
                                            <h3 className="text-lg font-semibold">{s.title}</h3>
                                            <p className="text-sm text-gray-500">Questions: {s.question_count}</p>
                                            <div className="mt-3 flex gap-2">
                                                <Button onClick={() => navigate(`/survey/edit/${s.nice_url}`)}>Edit</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="closed" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="col-span-1">
                                        <h3 className="text-lg font-semibold mb-4">Past Surveys</h3>
                                        {closedSurveys.length === 0 && (
                                            <div className="text-gray-500">No past surveys yet.</div>
                                        )}

                                        <div className="space-y-3">
                                            {surveys
                                                .filter(s => s.status === 'closed')
                                                .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
                                                .map(s => (
                                                    <div
                                                        key={s.survey_id}
                                                        onClick={() => selectClosedSurvey(s)}
                                                        role="button"
                                                        className={`p-3 border rounded-lg bg-white cursor-pointer transition-shadow ${selectedClosedId === s.survey_id ? 'ring-2 ring-indigo-400 shadow-md' : 'hover:shadow-sm'}`}
                                                    >
                                                        <h4 className="font-semibold">{s.title}</h4>
                                                        <p className="text-sm text-gray-500">{new Date(s.publishedAt || s.createdAt).toLocaleDateString()}</p>
                                                        <p className="text-sm text-gray-500">Questions: {s.question_count}</p>
                                                        <div className="mt-2 flex gap-2">
                                                            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleViewResults(s); }}>Open Full Results</Button>
                                                            <div onClick={(e) => e.stopPropagation()}>
                                                                <SurveyExportMenu
                                                                    surveyId={s.survey_id}
                                                                    surveyTitle={s.title}
                                                                    buttonSize="sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>

                                        {closedSurveys.length > 0 && (
                                            <div className="mt-4">
                                                <Button variant="ghost" onClick={() => handleExportAllPrompt(closedSurveys)} disabled={downloadingAll}>
                                                    {downloadingAll ? 'Exporting...' : 'Export All'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                      <h3 className="text-lg font-semibold mb-4">Survey Results</h3>
                                        {isResultsLoading ? (
                                            <div className="flex items-center justify-center h-full p-8">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
                                            </div>
                                        ) : selectedSurvey ? (
                                            <div className="space-y-6">
                                                <ResponseTrend dates={selectedSurvey.submission_dates} />

                                                {selectedSurvey.questions?.map((q, i) => (
                                                    <div key={i} className="p-4 bg-white border rounded-lg">
                                                        <h4 className="font-semibold mb-2">{q.title}</h4>
                                                        {/* Pass type, data, and options explicitly to QuestionChart */}
                                                        <QuestionChart
                                                            type={q.type}
                                                            data={q.data}
                                                            options={{ responsive: true }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 bg-white border rounded-lg text-center text-gray-500">
                                                Select a survey on the left to view charts and analytics.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : activeView === "take" && selectedSurvey ? (
                        <div className="space-y-6">
                            <Button
                                onClick={handleBack}
                                variant="outline"
                            >
                                ← Back to Surveys
                            </Button>
                            <SurveyForm
                                survey={selectedSurvey}
                                onSubmit={handleSurveySubmit}
                            />
                        </div>
                    ) : activeView === "results" && selectedSurvey ? (
                        <div className="space-y-6">
                            <Button
                                onClick={handleBack}
                                variant="outline"
                            >
                                ← Back to Surveys
                            </Button>
                            <div className="p-4 bg-white border rounded-lg">
                                <SurveyResults survey={selectedSurvey} />
                            </div>
                        </div>
                    ) : null}
                </main>

            </div>
        </>
    );
}

export default UserDash;