import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QuestionEditor from '../components/QuestionEditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { WandSparkles } from 'lucide-react';

// ... (Keep initialSurveyState and initialNewQuestion as is) ...
const initialSurveyState = {
    title: '',
    description: '',
    status: 'draft',
    is_public: false,
    questions: [],
};

const initialNewQuestion = {
    question_text: 'Untitled Question',
    question_type: 'multiple_choice',
    is_required: false,
    options: [{ option_text: 'Option 1' }],
    isGenerated: false
};

export const CreateSurvey = () => {
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(initialSurveyState);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);

    // --- NEW: Listen for Navbar Events ---
    useEffect(() => {
        const handleAddEvent = (event) => {
            if (event.detail && event.detail.type) {
                handleAddQuestion(event.detail.type);
                // Scroll to bottom smoothly to see new question
                setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
            }
        };

        window.addEventListener('add-question-event', handleAddEvent);
        return () => window.removeEventListener('add-question-event', handleAddEvent);
    }, [survey.questions]); // Re-bind if survey state structure changes implies new refs needed, but simple dependency is fine
    // -------------------------------------

    // ... (Keep all your handlers: detailChange, publicChange, questionChange, remove, move, etc.) ...
    const handleSurveyDetailChange = (e) => {
        setSurvey(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleIsPublicChange = (checked) => {
        setSurvey(prev => ({ ...prev, is_public: checked }));
    };
    const handleAddQuestion = (type = 'multiple_choice') => {
        const newQuestion = {
            ...initialNewQuestion,
            question_type: type,
            question_order: survey.questions.length + 1,
        };
        setSurvey(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    };
    const handleQuestionChange = (questionIndex, field, value) => {
        const updatedQuestions = survey.questions.map((q, index) => {
            if (index === questionIndex) {
                if (field === 'question_type' && (value === 'short_answer')) {
                    return { ...q, [field]: value, options: [] };
                }
                return { ...q, [field]: value };
            }
            return q;
        });
        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };
    const handleRemoveQuestion = (questionIndex) => {
        const updatedQuestions = survey.questions
            .filter((_, index) => index !== questionIndex)
            .map((q, index) => ({ ...q, question_order: index + 1 }));
        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };
    const handleMoveQuestionUp = (questionIndex) => {
        if (questionIndex === 0) return;
        const updatedQuestions = [...survey.questions];
        [updatedQuestions[questionIndex - 1], updatedQuestions[questionIndex]] =
            [updatedQuestions[questionIndex], updatedQuestions[questionIndex - 1]];
        const reordered = updatedQuestions.map((q, i) => ({ ...q, question_order: i + 1 }));
        setSurvey(prev => ({ ...prev, questions: reordered }));
    };
    const handleMoveQuestionDown = (questionIndex) => {
        if (questionIndex === survey.questions.length - 1) return;
        const updatedQuestions = [...survey.questions];
        [updatedQuestions[questionIndex], updatedQuestions[questionIndex + 1]] =
            [updatedQuestions[questionIndex + 1], updatedQuestions[questionIndex]];
        const reordered = updatedQuestions.map((q, i) => ({ ...q, question_order: i + 1 }));
        setSurvey(prev => ({ ...prev, questions: reordered }));
    };
    const handleAddOption = (questionIndex) => {
        const updatedQuestions = survey.questions.map((q, index) => {
            if (index === questionIndex) {
                const newOption = { option_text: `Option ${q.options.length + 1}` };
                return { ...q, options: [...q.options, newOption] };
            }
            return q;
        });
        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };
    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updatedQuestions = survey.questions.map((q, index) => {
            if (index === questionIndex) {
                const updatedOptions = q.options.map((opt, optIndex) => {
                    if (optIndex === optionIndex) return { ...opt, option_text: value };
                    return opt;
                });
                return { ...q, options: updatedOptions };
            }
            return q;
        });
        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };
    const handleRemoveOption = (questionIndex, optionIndex) => {
        const updatedQuestions = survey.questions.map((q, index) => {
            if (index === questionIndex) {
                const updatedOptions = q.options.filter((_, optIndex) => optIndex !== optionIndex);
                return { ...q, options: updatedOptions };
            }
            return q;
        });
        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };

    // ... (Keep AI Handlers: handleAutoGenerate, Refine, Accept, Discard) ...
    const handleAutoGenerate = async () => {
        if (!survey.title) return alert("Please enter a title first!");
        setIsGenerating(true);
        try {
            const simpleQuestionList = survey.questions.map(q => ({ question_text: q.question_text }));
            const res = await axios.post('/api/ai/generate', {
                title: survey.title,
                description: survey.description,
                existing_questions: simpleQuestionList
            });
            const newBatch = res.data.map((q, i) => ({
                ...q,
                question_order: survey.questions.length + i + 1,
                is_required: q.is_required || false,
                isGenerated: true
            }));
            setSurvey(prev => ({ ...prev, questions: [...prev.questions, ...newBatch] }));
        } catch (err) {
            console.error("AI Error", err);
            alert("Failed to generate questions. Try again.");
        } finally {
            setIsGenerating(false);
        }
    };
    const handleRefineQuestion = async (index) => {
        const currentQuestion = survey.questions[index];
        if (!currentQuestion.question_text) return;
        try {
            const res = await axios.post('/api/ai/refine', {
                question: {
                    question_text: currentQuestion.question_text,
                    question_type: currentQuestion.question_type,
                    options: currentQuestion.options
                },
                survey_title: survey.title,
                survey_description: survey.description
            });
            const updatedQuestions = [...survey.questions];
            updatedQuestions[index] = {
                ...updatedQuestions[index],
                aiSuggestion: res.data.result
            };
            setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
        } catch (error) {
            console.error("Refine error", error);
            alert("Failed to fetch suggestion.");
        }
    };
    const handleAcceptSuggestion = (index) => {
        const updatedQuestions = [...survey.questions];
        const q = updatedQuestions[index];
        if (q.aiSuggestion) {
            updatedQuestions[index] = {
                ...q,
                question_text: q.aiSuggestion.question_text,
                options: q.aiSuggestion.options || q.options,
                isGenerated: true,
                aiSuggestion: null
            };
            setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
        }
    };
    const handleDiscardSuggestion = (index) => {
        const updatedQuestions = [...survey.questions];
        updatedQuestions[index] = { ...updatedQuestions[index], aiSuggestion: null };
        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };

    // ... (Keep handleSave) ...
    const handleSave = async (status) => {
        setIsSaving(true);
        const questionsToSave = survey.questions.map((q, index) => {
            const questionData = { ...q, question_order: index + 1 };
            if (questionData.options && questionData.options.length > 0) {
                questionData.options = questionData.options.map((opt, optIndex) => ({
                    ...opt,
                    option_order: optIndex + 1
                }));
            }
            return questionData;
        });
        const dataToSend = { ...survey, status, questions: questionsToSave };
        try {
            const response = await axios.post("/api/surveys", dataToSend, { withCredentials: true });
            alert(`Survey saved as ${status}!`);
            if (status === 'published') {
                navigate(`/survey/${response.data.nice_url}`);
            } else {
                navigate('/userdash');
            }
        } catch (error) {
            console.error("Survey creation failed:", error);
            alert("Failed to save survey.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isPreviewMode) {
        return (
            <div className="survey-preview-page p-8">
                <button className="bg-gray-200 p-2 rounded" onClick={() => setIsPreviewMode(false)}>Back</button>
                <h1 className="text-3xl mt-4">{survey.title}</h1>
                {/* Preview logic... */}
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                    <CardTitle>Survey Details</CardTitle>
                    <CardDescription>Create or edit your survey. Add questions via the Navigation Bar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Survey Title</Label>
                        <Input id="title" name="title" placeholder="Survey Title" value={survey.title} onChange={handleSurveyDetailChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Survey Description</Label>
                        <Textarea id="description" name="description" placeholder="Description..." value={survey.description} onChange={handleSurveyDetailChange} rows={4} />
                    </div>
                    <div className="pt-2">
                        <Button onClick={handleAutoGenerate} disabled={isGenerating || !survey.title} type="button" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none shadow-md hover:shadow-lg transition-all">
                            {isGenerating ? <><span className="animate-spin mr-2">✨</span> Dreaming...</> : <><WandSparkles className="mr-2" size={16}/> Auto-Generate 5 Questions</>}
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                        <Checkbox id="is_public" checked={survey.is_public} onCheckedChange={handleIsPublicChange} />
                        <Label htmlFor="is_public">Make survey public</Label>
                    </div>
                </CardContent>
            </Card>



            <div className="space-y-3">
                {survey.questions.map((q, index) => (
                    <QuestionEditor
                        key={index}
                        question={q}
                        index={index}
                        totalQuestions={survey.questions.length}
                        handleQuestionChange={handleQuestionChange}
                        handleRemoveQuestion={handleRemoveQuestion}
                        handleMoveQuestionUp={handleMoveQuestionUp}
                        handleMoveQuestionDown={handleMoveQuestionDown}
                        handleAddOption={handleAddOption}
                        handleOptionChange={handleOptionChange}
                        handleRemoveOption={handleRemoveOption}
                        handleRefineQuestion={handleRefineQuestion}
                        handleAcceptSuggestion={handleAcceptSuggestion}
                        handleDiscardSuggestion={handleDiscardSuggestion}
                    />
                ))}
                {survey.questions.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
                        Use the "Add Question" button in the top right to start.
                    </div>
                )}
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">{survey.questions.length} questions</p>
                        <div className="flex space-x-3 mb-4">
                            <button onClick={() => setIsPreviewMode(true)} className="bg-[#415a77] text-white py-2 px-4 rounded-lg shadow-md">Preview</button>
                            <button onClick={() => handleSave('draft')} disabled={isSaving} className="bg-gray-400 text-white py-2 px-4 rounded-lg shadow-md">Save Draft</button>
                            <button onClick={() => handleSave('published')} disabled={isSaving || !survey.title} className="bg-[#0d1b2a] text-white py-2 px-4 rounded-lg shadow-md">Publish</button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};