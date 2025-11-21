// src/pages/Home.js
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { UISurveyCreate } from "./UISurveyCreate";
import { BrowseSurveys } from "./BrowseSurveys";
import { TakeSurvey } from "./TakeSurvey";
import { SurveyResultsPage } from "./SurveyResultsPage";

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
        <div className="container mx-auto mt-10 p-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-text-main mb-2">Welcome to Pollarity</h1>
                <p className="text-text-muted text-lg">The place to have all YOUR questions answered</p>
            </div>

             <div className="min-h-screen bg-[#e0e1dd]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeView === "browse" && (
              <BrowseSurveys
                  surveys={surveys}
                  drafts={drafts}
                  onTakeSurvey={handleTakeSurvey}
                  onViewResults={handleViewResults}
                  onPublishDraft={handlePublishDraft}
                  onDeleteDraft={handleDeleteDraft}
                  onEditDraft={handleEditDraft}
              />
          )}
          {activeView === "take" && selectedSurvey && (
              <TakeSurvey survey={selectedSurvey} onBack={handleBack} onSubmit={handleSurveySubmit} />
          )}
          {activeView === "results" && selectedSurvey && (
              <SurveyResultsPage survey={selectedSurvey} onBack={handleBack} />
          )}
          {activeView === "create" && (
              <UISurveyCreate onCreate={handleCreateSurvey} onSaveDraft={handleSaveDraft} />
          )}
        </main>
      </div>
        </div>
    );
}

export default Home;