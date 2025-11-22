
import { Tabs, TabsContent, TabsList, TabsTrigger,} from "../components/ui/tabs";
import { ClipboardList } from "lucide-react";

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { SurveyList } from '../components/SurveyList';
// CreateSurvey moved to page-level; removed from UserDash tabs
import { SurveyForm } from '../components/SurveyForm';
import { SurveyResults } from '../components/SurveyResults';

import { Button } from '../components/ui/button';

const SAMPLE_SURVEYS = [
  {
    id: "1",
    title: "Student Feedback Survey",
    description: "Help us improve your learning experience",
    responses: 45,
    status: "published",
    createdBy: "me",
    createdAt: "2025-01-15",
    questions: [
      {
        id: "q1",
        type: "rating",
        question:
          "How would you rate the overall course quality?",
        required: true,
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "What is your preferred learning method?",
        options: [
          "Visual",
          "Auditory",
          "Reading/Writing",
          "Kinesthetic",
        ],
        required: true,
      },
      {
        id: "q3",
        type: "checkbox",
        question:
          "Which topics would you like to explore more? (Select all that apply)",
        options: [
          "Mathematics",
          "Science",
          "Literature",
          "History",
          "Arts",
        ],
        required: false,
      },
      {
        id: "q4",
        type: "text",
        question:
          "What suggestions do you have for improvement?",
        required: false,
      },
    ],
  },
  {
    id: "2",
    title: "Campus Facilities Survey",
    description: "Share your thoughts on campus amenities",
    responses: 32,
    status: "published",
    createdBy: "me",
    createdAt: "2025-02-01",
    questions: [
      {
        id: "q1",
        type: "rating",
        question:
          "How satisfied are you with the library facilities?",
        required: true,
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "How often do you use the campus cafeteria?",
        options: [
          "Daily",
          "Weekly",
          "Monthly",
          "Rarely",
          "Never",
        ],
        required: true,
      },
      {
        id: "q3",
        type: "text",
        question:
          "What new facilities would you like to see on campus?",
        required: false,
      },
    ],
  },
  {
    id: "3",
    title: "Event Planning Survey",
    description: "Help us plan better campus events",
    responses: 67,
    status: "closed",
    createdBy: "me",
    createdAt: "2024-12-10",
    questions: [
      {
        id: "q1",
        type: "checkbox",
        question:
          "What types of events interest you? (Select all that apply)",
        options: [
          "Music Concerts",
          "Sports Events",
          "Cultural Festivals",
          "Academic Workshops",
          "Social Gatherings",
        ],
        required: true,
      },
      {
        id: "q2",
        type: "multiple-choice",
        question: "What is your preferred time for events?",
        options: [
          "Weekday Evenings",
          "Weekend Mornings",
          "Weekend Afternoons",
          "Weekend Evenings",
        ],
        required: true,
      },
      {
        id: "q3",
        type: "text",
        question:
          "Any specific event ideas you would like to share?",
        required: false,
      },
    ],
  },
];

const SAMPLE_DRAFTS = [
  {
    id: "d1",
    title: "Technology Preferences Survey",
    description: "Understanding student technology needs",
    status: "draft",
    createdBy: "me",
    createdAt: "2025-03-10",
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question:
          "What device do you primarily use for studying?",
        options: ["Laptop", "Desktop", "Tablet", "Smartphone"],
        required: true,
      },
      {
        id: "q2",
        type: "text",
        question:
          "What software tools would you like the school to provide?",
        required: false,
      },
    ],
  },
  {
    id: "d2",
    title: "Extracurricular Activities Survey",
    description: "Help us plan new clubs and activities",
    status: "draft",
    createdBy: "me",
    createdAt: "2025-03-15",
    questions: [
      {
        id: "q1",
        type: "checkbox",
        question: "Which activities interest you?",
        options: [
          "Sports",
          "Music",
          "Drama",
          "Debate",
          "Coding Club",
        ],
        required: true,
      },
    ],
  },
];

export const UserDash = () => {

    const [surveys, setSurveys] = useState(SAMPLE_SURVEYS);
    const [drafts, setDrafts] = useState(SAMPLE_DRAFTS);
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
    const location = useLocation();

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
            <Tabs defaultValue="available" className="space-y-6">
              <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3">
                <TabsTrigger value="available">
                  Available Surveys
                </TabsTrigger>
                <TabsTrigger value="closed">
                  Past Surveys
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

              {/* Create tab removed; survey creation handled on separate page */}

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
           </>
    );
}

export default UserDash;