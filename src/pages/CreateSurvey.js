import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import QuestionEditor from '../components/QuestionEditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { WandSparkles } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

// Initial structure for a new survey
const initialSurveyState = {
    title: '',
    description: '',
    status: 'draft',
    is_public: false,
    questions: [], // Array to hold all question objects
};

// Initial structure for a new question
const initialNewQuestion = {
    question_text: '',
    question_type: 'multiple_choice' ,
    is_required: false,
    options: [{ option_text: '' }],
    isGenerated: false
};

const NavigationHandler = ({ onNavigate }) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClick = (event) => {
            const link = event.target.closest('a');
            if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('/')) {
                event.preventDefault();
                onNavigate(link.getAttribute('href'));
            }
        };

        document.querySelector('.mainNav').addEventListener('click', handleClick);
        return () => {
            document.querySelector('.mainNav').removeEventListener('click', handleClick);
        };
    }, [location, navigate, onNavigate]);

    return null;
};

export const CreateSurvey = () => {
    const navigate = useNavigate();
    const { niceUrl } = useParams();
    const [survey, setSurvey] = useState(initialSurveyState);
    const [isDirty, setIsDirty] = useState(false);
    const { showConfirmation, confirmNavigation, cancelNavigation, handleBlockedNavigation } = useUnsavedChanges(isDirty);

    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dropIndex, setDropIndex] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [publishedInfo, setPublishedInfo] = useState({ visible: false, niceUrl: null });
    const [isGenerating, setIsGenerating] = useState(false);
    const [editingNiceUrl, setEditingNiceUrl] = useState(null);
    const [modeLabel, setModeLabel] = useState('Create');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const loadForEdit = async () => {
            if (!niceUrl) return;
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`/api/surveys/${niceUrl}/edit`, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
                const s = res.data;

                const mapped = {
                    title: s.title || '',
                    description: s.description || '',
                    status: s.status || 'draft',
                    is_public: !!s.is_public,
                    questions: (s.Questions || []).map(q => ({
                        question_text: q.question_text,
                        question_type: q.question_type,
                        is_required: !!q.is_required,
                        question_order: q.question_order || 0,
                        options: (q.Options || []).map(o => ({ option_text: o.option_text }))
                    }))
                };

                setSurvey(mapped);
                setEditingNiceUrl(niceUrl);
                setModeLabel('Edit');
            } catch (err) {
                console.error('Failed to load survey for edit', err);
                alert('Failed to load survey for editing. You may not have permission.');
                navigate('/userdash');
            }
        };
        loadForEdit();
    }, [niceUrl, navigate]);

    const saveOrderToServer = async () => {
        if (!editingNiceUrl) return;
        try {
            const token = localStorage.getItem('token');
            const questionsToSave = survey.questions.map((q, i) => {
                const qq = { ...q, question_order: i + 1 };
                if (qq.options && qq.options.length) {
                    qq.options = qq.options.map((opt, oi) => ({ ...opt, option_order: oi + 1 }));
                }
                return qq;
            });

            await axios.put(`/api/surveys/${editingNiceUrl}`, { ...survey, questions: questionsToSave }, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
        } catch (err) {
            console.error('Failed to persist question order on exit preview', err?.response?.data || err);
        }
    };

    const handleSurveyDetailChange = (e) => {
        setIsDirty(true);
        setSurvey(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleIsPublicChange = (checked) => {
        setIsDirty(true);
        setSurvey(prev => ({
            ...prev,
            is_public: checked,
        }));
    };

    // Handler to Add a New Question
    const handleAddQuestion = (type = 'multiple_choice') => {
        setIsDirty(true);
        const newQuestion = {
            ...initialNewQuestion,
            question_type: type,
            question_order: survey.questions.length + 1,
        };

        setSurvey(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion],
        }));
    };

    // Handler for changes within a specific question (text, type, required status)
    const handleQuestionChange = (questionIndex, field, value) => {
        setIsDirty(true);
        const updatedQuestions = survey.questions.map((q, index) => {
            if (index === questionIndex) {
                // If the type changes, reset options if necessary
                if (field === 'question_type' && (value === 'short_answer')) {
                    return { ...q, [field]: value, options: [] };
                }
                return { ...q, [field]: value };
            }
            return q;
        });

        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };

    // Handler to remove a question
    const handleRemoveQuestion = (questionIndex) => {
        setIsDirty(true);
        const updatedQuestions = survey.questions
            .filter((_, index) => index !== questionIndex)
            .map((q, index) => ({
                ...q,
                question_order: index + 1,
            }));

        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleMoveQuestionUp = (questionIndex) => {
        if (questionIndex === 0) return;
        setIsDirty(true);
        const updatedQuestions = [...survey.questions];
        [updatedQuestions[questionIndex - 1], updatedQuestions[questionIndex]] =
            [updatedQuestions[questionIndex], updatedQuestions[questionIndex - 1]];
        const reorderedQuestions = updatedQuestions.map((q, index) => ({
            ...q,
            question_order: index + 1
        }));
        setSurvey(prev => ({ ...prev, questions: reorderedQuestions }));
    };

    const handleMoveQuestionDown = (questionIndex) => {
        if (questionIndex === survey.questions.length - 1) return;
        setIsDirty(true);
        const updatedQuestions = [...survey.questions];
        [updatedQuestions[questionIndex], updatedQuestions[questionIndex + 1]] =
            [updatedQuestions[questionIndex + 1], updatedQuestions[questionIndex]];
        const reorderedQuestions = updatedQuestions.map((q, index) => ({
            ...q,
            question_order: index + 1
        }));
        setSurvey(prev => ({ ...prev, questions: reorderedQuestions }));
    };

    const handleAddOption = (questionIndex) => {
        setIsDirty(true);
        const updatedQuestions = survey.questions.map((q, index) => {
            if (index === questionIndex) {
                const newOption = { option_text: `` };
                return { ...q, options: [...q.options, newOption] };
            }
            return q;
        });
        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        setIsDirty(true);
        const updatedQuestions = survey.questions.map((q, index) => {
            if (index === questionIndex) {
                const updatedOptions = q.options.map((opt, optIndex) => {
                    if (optIndex === optionIndex) {
                        return { ...opt, option_text: value };
                    }
                    return opt;
                });
                return { ...q, options: updatedOptions };
            }
            return q;
        });
        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };

    const handleRemoveOption = (questionIndex, optionIndex) => {
        setIsDirty(true);
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
            const simpleQuestionList = survey.questions.map(q => ({
                question_text: q.question_text
            }));
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
            setSurvey(prev => ({
                ...prev,
                questions: [...prev.questions, ...newBatch]
            }));
            setIsDirty(true);
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
        setIsDirty(true);
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

    const handleSave = async (status) => {
        setIsSaving(true);
        const missingRequired = survey.questions.some((q) => {
            if (!q.is_required) return false;
            if (q.question_type === 'short_answer') {
                return !q.question_text || q.question_text.trim() === '';
            }
            if (['multiple_choice', 'checkbox'].includes(q.question_type)) {
                if (!q.options || q.options.length === 0) return true;
                return q.options.some(opt => !opt.option_text || opt.option_text.trim() === '');
            }
            return false;
        });

        if (missingRequired) {
            alert('Please make sure required questions and their options are filled out before saving.');
            setIsSaving(false);
            return;
        }

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
            let response;
            if (editingNiceUrl) {
                const token = localStorage.getItem('token');
                response = await axios.put(`/api/surveys/${editingNiceUrl}`, dataToSend, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true });
                if (status === 'published') {
                    const nice = editingNiceUrl;
                    setPublishedInfo({ visible: true, niceUrl: nice });
                    setTimeout(() => setPublishedInfo({ visible: false, niceUrl: null }), 12000);
                } else {
                    alert(`Survey updated!`);
                    setIsDirty(false);
                    navigate('/userdash');
                    return;
                }
            } else {
                response = await axios.post("/api/surveys", dataToSend, { withCredentials: true });
                const nice = response.data && response.data.nice_url ? response.data.nice_url : null;
                if (status === 'published' && nice) {
                    setPublishedInfo({ visible: true, niceUrl: nice });
                    setTimeout(() => setPublishedInfo({ visible: false, niceUrl: null }), 12000);
                } else {
                    alert(`Survey saved as ${status}!`);
                    setIsDirty(false);
                    navigate('/userdash');
                    return;
                }
            }
            setIsDirty(false);
        } catch (error) {
            console.error("Survey create/update failed:", error.response?.data || error);
            const errorMessage = error.response?.data?.error || error.response?.data?.details || "Failed to save survey. Check the console for details.";
            alert(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNavigate = (path) => {
        if (!handleBlockedNavigation({ pathname: path })) {
            // Navigation is blocked, the dialog will be shown
        } else {
            navigate(path);
        }
    };

    if (isPreviewMode) {

        return (
            <div className="survey-preview-page p-8">
                <button className="bg-gray-200 p-2 rounded" onClick={async () => { await saveOrderToServer(); setIsPreviewMode(false); }}>
                    &larr; Back to Builder
                </button>
                <h1 className="text-3xl mt-4">{survey.title || "Untitled Survey"}</h1>
                <p className="text-gray-600 mb-6">{survey.description}</p>
                {survey.questions.map((q, index) => (
                    <React.Fragment key={`frag-${index}`}>
                        {dropIndex === index && (
                            <div key={`insert-${index}`} className="h-1 bg-indigo-500 my-1 rounded transition-all" />
                        )}
                        <div
                            key={index}
                            className={`question-display mb-4 p-4 border rounded bg-white ${draggingIndex === index ? 'opacity-80 ring-2 ring-indigo-300 shadow-lg' : ''}`}
                            draggable
                            onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(index)); setDraggingIndex(index); }}
                            onDragEnd={() => { setDraggingIndex(null); setDropIndex(null); }}
                            onDragOver={(e) => { e.preventDefault(); const rect = e.currentTarget.getBoundingClientRect(); const offset = e.clientY - rect.top; const before = offset < rect.height / 2; setDropIndex(before ? index : index + 1); }}
                            onDragLeave={() => setDropIndex(null)}
                            onDrop={(e) => {
                                e.preventDefault();
                                const src = Number(e.dataTransfer.getData('text/plain'));
                                const dest = dropIndex !== null ? dropIndex : index;
                                if (Number.isNaN(src) || src === dest || src + 1 === dest) {
                                    setDraggingIndex(null); setDropIndex(null); return;
                                }
                                const newQuestions = [...survey.questions];
                                const [moved] = newQuestions.splice(src, 1);
                                const adjustedDest = src < dest ? dest - 1 : dest;
                                newQuestions.splice(adjustedDest, 0, moved);
                                const reordered = newQuestions.map((qq, i) => ({ ...qq, question_order: i + 1 }));
                                setSurvey(prev => ({ ...prev, questions: reordered }));
                                setDraggingIndex(null); setDropIndex(null);
                            }}
                        >
                            <div className="flex items-start justify-between">
                                <p className="font-semibold">Q{index + 1}. {q.question_text} {q.is_required && <span className="text-red-500">*</span>}</p>
                                <span className="text-sm text-gray-400">drag</span>
                            </div>
                            {['multiple_choice', 'checkbox'].includes(q.question_type) && q.options.map((opt, optIndex) => (
                                <div key={optIndex} className="ml-4">
                                    <input type={q.question_type === 'multiple_choice' ? 'radio' : 'checkbox'} disabled name={`q-${index}`} className="mr-2" />
                                    {opt.option_text}
                                </div>
                            ))}
                            {q.question_type === 'short_answer' && (
                                <textarea disabled placeholder="Short answer text box" rows="3" className="w-full border p-2 mt-2"></textarea>
                            )}
                        </div>
                    </React.Fragment>
                ))}
                {dropIndex === survey.questions.length && (
                    <div className="h-1 bg-indigo-500 my-1 rounded transition-all" />
                )}
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <NavigationHandler onNavigate={handleNavigate} />
            <AlertDialog open={showConfirmation} onOpenChange={cancelNavigation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to leave? Your changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelNavigation}>Cancel and Continue Editing</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmNavigation}>Continue without Saving</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {publishedInfo.visible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-white border shadow-lg rounded-lg p-6 max-w-lg w-full mx-4 text-center pointer-events-auto">
                        <h2 className="text-xl font-semibold mb-2">Here is your survey</h2>
                        <p className="text-sm text-gray-600 mb-4">Send this link to your friends to get answers:</p>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <code className="bg-gray-100 px-3 py-1 rounded select-all">{`https://${window.location.host}/survey/${publishedInfo.niceUrl}`}</code>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={async () => { try { await navigator.clipboard.writeText(`https://${window.location.host}/survey/${publishedInfo.niceUrl}`); } catch (err) { console.error('Copy failed', err); } }}>Copy Link</button>
                            <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => { setPublishedInfo({ visible: false, niceUrl: null }); navigate('/userdash'); }}>Done</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{modeLabel} Survey</h1>
                {editingNiceUrl && <span className="text-sm text-gray-500">Editing: {editingNiceUrl}</span>}
            </div>
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                    <CardTitle>Survey Details</CardTitle>
                    <CardDescription>Create or edit your survey. Add questions and manage options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Survey Title</Label>
                        <Input id="title" name="title" placeholder="Add your title here" value={survey.title} onChange={handleSurveyDetailChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Survey Description</Label>
                        <Textarea id="description" name="description" placeholder="What is the purpose of this survey" value={survey.description} onChange={handleSurveyDetailChange} rows={4} />
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
            <div className="flex space-x-2">
                <Button onClick={() => handleAddQuestion('multiple_choice')}>+ Multiple Choice</Button>
                <Button onClick={() => handleAddQuestion('checkbox')}>+ Checkbox</Button>
                <Button onClick={() => handleAddQuestion('short_answer')}>+ Short Answer</Button>
            </div>
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
                        <div>
                            <p className="text-gray-900">Ready to save your survey?</p>
                            <p className="text-gray-600">{survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''} added</p>
                        </div>
                        <div className="flex space-x-3 mb-4">
                            <button onClick={() => setIsPreviewMode(true)} className="bg-[#415a77] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#1b263b]">
                                Preview Survey
                            </button>
                            <button onClick={() => handleSave('draft')} disabled={isSaving} className="bg-gray-400 text-white py-2 px-4 rounded-lg shadow-md">
                                {isSaving ? 'Saving Draft...' : 'Save Draft'}
                            </button>
                            <button onClick={() => handleSave('published')} disabled={isSaving || !survey.title || survey.questions.length === 0} className="bg-[#0d1b2a] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#1b263b]">
                                Publish Survey
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};