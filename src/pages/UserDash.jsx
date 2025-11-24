
import { Tabs, TabsContent, TabsList, TabsTrigger,} from "../components/ui/tabs";
import { ClipboardList } from "lucide-react";

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { SurveyForm } from '../components/SurveyForm';
import { SurveyResults } from '../components/SurveyResults';

import { Button } from '../components/ui/button';

export const UserDash = () => {

    const [surveys, setSurveys] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [activeView, setActiveView] = useState("browse");

  const handleViewResults = (survey) => {
    const fetchResults = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      try {
        const res = await axios.get(`/api/surveys/${survey.survey_id}/results`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const payload = res.data;
        // Transform server results into the shape SurveyResults expects (with data arrays)
        const transformed = {
          title: payload.survey.title,
          description: payload.survey.description,
          responses: payload.survey.total_submissions,
          questions: payload.results.map(q => {
            if (['multiple_choice', 'checkbox'].includes(q.question_type)) {
              const total = q.answers.reduce((sum, a) => sum + (a.count || 0), 0) || 0;
              const data = q.answers.map(a => ({ option: a.option_text, count: a.count || 0, percentage: total ? Math.round((a.count || 0) / total * 100) : 0 }));
              return { question: q.question_text, type: q.question_type === 'multiple_choice' ? 'multiple-choice' : 'checkbox', data };
            } else if (q.question_type === 'short_answer') {
              return { question: q.question_text, type: 'text', data: q.answers || [] };
            }
            return { question: q.question_text, type: q.question_type, data: [] };
          })
        };

        setSelectedSurvey(transformed);
        setActiveView('results');
      } catch (err) {
        console.error('Failed to fetch results', err);
        toast.error('Failed to load results');
      }
    };

    fetchResults();
  };

  // Download helper: fetch export endpoint as blob and trigger browser download
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

  // Prompt user (via toast) to choose CSV or Excel
  const handleExportPrompt = (survey) => {
    // Use a simple custom toast with action buttons and a cancel
    const toastId = `export-prompt-${survey.survey_id}-${Date.now()}`;
    toast(`${survey.title} — Choose export format`, {
      id: toastId,
      action: (
        <div className="flex gap-2">
          <Button onClick={() => { downloadExport(survey.survey_id, 'csv'); toast.dismiss && toast.dismiss(toastId); }} size="sm">CSV</Button>
          <Button onClick={() => { downloadExport(survey.survey_id, 'excel'); toast.dismiss && toast.dismiss(toastId); }} size="sm">Excel</Button>
          <Button variant="ghost" onClick={() => { toast.dismiss && toast.dismiss(toastId); }} size="sm">Cancel</Button>
        </div>
      )
    });
  };

  const [downloadingAll, setDownloadingAll] = useState(false);

  const handleExportAll = async (surveysToExport, format) => {
    setDownloadingAll(true);
    try {
      // Export sequentially to avoid overwhelming server/browser
      for (const s of surveysToExport) {
        // await each download so they're processed one at a time
        // note: downloadExport shows its own toasts
        // eslint-disable-next-line no-await-in-loop
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
    const location = useLocation();

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

      // If navigated from Home with a survey to take, open it
      useEffect(() => {
        if (location && location.state && location.state.survey) {
          setSelectedSurvey(location.state.survey);
          setActiveView('take');
        }
      }, [location]);

 return (
  <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl">
                <ClipboardList className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-blue-900">Survey Hub</h1>
                <p className="text-gray-600">
                  Create, share, and analyze surveys
                </p>
              </div>
            </div>
          </div>
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
                  {surveys.filter(s => s.status === 'published' || s.status === 'open').length === 0 && (
                    <div className="col-span-full text-center text-gray-500">No published surveys yet.</div>
                  )}
                  {surveys.filter(s => s.status === 'published' || s.status === 'open').map(s => (
                    <div key={s.survey_id} className="p-4 border rounded-lg bg-white">
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                      <p className="text-sm text-gray-500">Questions: {s.question_count}</p>
                      <div className="mt-3 flex gap-2">
                        <Button onClick={() => navigate(`/survey/${s.nice_url}`)}>Open</Button>
                        <Button variant="outline" onClick={() => handleClose(s.nice_url)}>Close</Button>
                        <Button variant="ghost" onClick={() => handleViewResults(s)}>Results</Button>
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
                  {surveys.filter(s => s.status === 'draft').map(s => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {surveys.filter(s => s.status === 'closed').length === 0 && (
                    <div className="col-span-full text-center text-gray-500">No past surveys yet.</div>
                  )}
                  {surveys.filter(s => s.status === 'closed').map(s => (
                    <div key={s.survey_id} className="p-4 border rounded-lg bg-white">
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                      <p className="text-sm text-gray-500">Questions: {s.question_count}</p>
                      <div className="mt-3 flex gap-2">
                        <Button onClick={() => handleViewResults(s)}>View Results</Button>
                        <Button variant="outline" onClick={() => handleExportPrompt(s)}>Export Data</Button>
                      </div>
                    </div>
                  ))}
                  {/* Export All control - appears as a full-width control at the bottom of closed tab */}
                  {surveys.filter(s => s.status === 'closed').length > 0 && (
                    <div className="col-span-full flex justify-end">
                      <Button variant="ghost" onClick={() => handleExportAllPrompt(surveys.filter(s => s.status === 'closed'))} disabled={downloadingAll}>
                        {downloadingAll ? 'Exporting...' : 'Export All'}
                      </Button>
                    </div>
                  )}
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
              <SurveyResults survey={selectedSurvey} />
            </div>
          ) : null}
        </main>
          
        </div>
           </>
    );
}

export default UserDash;