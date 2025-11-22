// src/pages/Home.js
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';

import { SurveyList } from '../components/SurveyList';
import { CreateSurvey } from '../components/CreateSurvey';
import { SurveyForm } from '../components/SurveyForm';
import { SurveyResults } from '../components/SurveyResults';

import { Button } from '../components/ui/button';

export const Home = () => {

    const [surveys, setSurveys] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [activeView, setActiveView] = useState("browse");

    const handleTakeSurvey = (survey) => {
    setSelectedSurvey(survey);
    setActiveView("take");
  };

  const handleViewResults = (survey) => {
    setSelectedSurvey(survey);
    setActiveView("results");
  };

  const handleSurveySubmit = () => {
    if (selectedSurvey) {
      setSurveys(
        surveys.map((s) =>
          s.id === selectedSurvey.id
            ? { ...s, responses: (s.responses || 0) + 1 }
            : s,
        ),
      );
    }
    setActiveView("browse");
    setSelectedSurvey(null);
  };

   const handleSaveDraft = (survey) => {
    setDrafts([
      ...drafts,
      {
        ...survey,
        id: `d${Date.now()}`,
        status: "draft",
        createdBy: "me",
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleCreateSurvey = (survey) => {
    setSurveys([
      ...surveys,
      {
        ...survey,
        id: Date.now().toString(),
        responses: 0,
        status: "published",
        createdBy: "me",
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handlePublishDraft = (draftId) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (draft) {
      setSurveys([
        ...surveys,
        {
          ...draft,
          id: Date.now().toString(),
          status: "published",
          responses: 0,
        },
      ]);
      setDrafts(drafts.filter((d) => d.id !== draftId));
    }
  };

  const handleDeleteDraft = (draftId) => {
    setDrafts(drafts.filter((d) => d.id !== draftId));
  };

  const handleEditDraft = (draft) => {
    setSelectedSurvey(draft);
  };

  const handleCloseSurvey = (surveyId) => {
    setSurveys(
      surveys.map((s) =>
        s.id === surveyId ? { ...s, status: "closed" } : s,
      ),
    );
  };

  const handleBack = () => {
    setActiveView("browse");
    setSelectedSurvey(null);
  };

    const [listOfSurveys, setListOfSurveys] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurveys = async () => {

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/");
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
        {activeView === "browse" ? (
          <Tabs defaultValue="available" className="space-y-6">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4">
              <TabsTrigger value="available">
                Available Surveys
              </TabsTrigger>
              <TabsTrigger value="closed">
                Past Surveys
              </TabsTrigger>
              <TabsTrigger value="create">
                Create Survey
              </TabsTrigger>
              <TabsTrigger value="drafts">
                Drafts
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="available"
              className="space-y-6"
            >
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-gray-900">
                  Available Surveys
                </h2>
                <p className="text-gray-600 mt-2">
                  Browse and participate in surveys or view
                  their results
                </p>
              </div>
              <SurveyList
                surveys={surveys.filter(
                  (s) => s.status === "published",
                )}
                onTakeSurvey={handleTakeSurvey}
                onViewResults={handleViewResults}
              />
            </TabsContent>

            <TabsContent value="closed" className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-gray-900">Past Surveys</h2>
                <p className="text-gray-600 mt-2">
                  Surveys you have created that are now closed
                </p>
              </div>
              <SurveyList
                surveys={surveys.filter(
                  (s) =>
                    s.status === "closed" &&
                    s.createdBy === "me",
                )}
                onTakeSurvey={handleTakeSurvey}
                onViewResults={handleViewResults}
                isPastSurveys={true}
              />
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-gray-900">
                  Create a Survey
                </h2>
                <p className="text-gray-600 mt-2">
                  Design your own survey with custom questions
                </p>
              </div>
              <CreateSurvey
                onCreate={handleCreateSurvey}
                onSaveDraft={handleSaveDraft}
              />
            </TabsContent>

            <TabsContent value="drafts" className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-gray-900">
                  Draft Surveys
                </h2>
                <p className="text-gray-600 mt-2">
                  Continue working on your unfinished surveys
                </p>
              </div>
              <SurveyList
                surveys={drafts}
                onTakeSurvey={handleTakeSurvey}
                onViewResults={handleViewResults}
                isDrafts={true}
                onPublishDraft={handlePublishDraft}
                onDeleteDraft={handleDeleteDraft}
                onEditDraft={handleEditDraft}
              />
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
        </div>
        </>
    );
}

export default UserDash;