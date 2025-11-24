
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
                      </div>
                    </div>
                  ))}
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