import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QuestionEditor from '../components/QuestionEditor';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
// Badge not required here; question summaries removed

//<Button variant="secondary" onClick={() => navigate('/survey/preview', { state: { survey } })}>Preview</Button>
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
    question_text: 'Untitled Question',
    question_type: 'multiple_choice',
    is_required: false,
    options: [{ option_text: 'Option 1' }], // Start with one option for MC/Checkbox
};

export const CreateSurvey = () => {
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(initialSurveyState);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    // Handler for Survey Title and Description
    const handleSurveyDetailChange = (e) => {
        setSurvey(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleIsPublicChange = (checked) => {
        setSurvey(prev => ({
            ...prev,
            is_public: checked,
        }));
    };

    // Handler to Add a New Question
    const handleAddQuestion = (type = 'multiple_choice') => {
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
        const updatedQuestions = survey.questions
            .filter((_, index) => index !== questionIndex)
            .map((q, index) => ({
                ...q,
                question_order: index + 1, // Reorder after removal
            }));

        setSurvey(prev => ({ ...prev, questions: updatedQuestions }));
    };

    // Handler to move a question up (decrease order)
    const handleMoveQuestionUp = (questionIndex) => {
        if (questionIndex === 0) return; // Can't move first question up

        const updatedQuestions = [...survey.questions];
        [updatedQuestions[questionIndex - 1], updatedQuestions[questionIndex]] = 
        [updatedQuestions[questionIndex], updatedQuestions[questionIndex - 1]];

        // Update question_order for all questions
        const reorderedQuestions = updatedQuestions.map((q, index) => ({
            ...q,
            question_order: index + 1
        }));

        setSurvey(prev => ({ ...prev, questions: reorderedQuestions }));
    };

    // Handler to move a question down (increase order)
    const handleMoveQuestionDown = (questionIndex) => {
        if (questionIndex === survey.questions.length - 1) return; // Can't move last question down

        const updatedQuestions = [...survey.questions];
        [updatedQuestions[questionIndex], updatedQuestions[questionIndex + 1]] = 
        [updatedQuestions[questionIndex + 1], updatedQuestions[questionIndex]];

        // Update question_order for all questions
        const reorderedQuestions = updatedQuestions.map((q, index) => ({
            ...q,
            question_order: index + 1
        }));

        setSurvey(prev => ({ ...prev, questions: reorderedQuestions }));
    };

    // Handler to save the survey (POST request)
    const handleSave = async (status) => {
        setIsSaving(true);
        
        // Ensure all questions have correct question_order and options have correct option_order
        const questionsToSave = survey.questions.map((q, index) => {
            const questionData = {
                ...q,
                question_order: index + 1, // Ensure order is sequential starting from 1
            };

            // Ensure options have correct option_order if they exist
            if (questionData.options && questionData.options.length > 0) {
                questionData.options = questionData.options.map((opt, optIndex) => ({
                    ...opt,
                    option_order: optIndex + 1
                }));
            }

            return questionData;
        });

        const dataToSend = {
            ...survey,
            status,
            questions: questionsToSave
        };

        try {
            const response = await axios.post("/api/surveys", dataToSend, {
                withCredentials: true
            });

            alert(`Survey saved as ${status}!`);
            navigate(`/survey/${response.data.survey_id}/edit`);

        } catch (error) {
            console.error("Survey creation failed:", error.response?.data || error);
            const errorMessage = error.response?.data?.error || error.response?.data?.details || "Failed to save survey. Check the console for details.";
            alert(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Handler to add a new option to a specific question
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

// Handler to change the text of a specific option
    const handleOptionChange = (questionIndex, optionIndex, value) => {
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

// Handler to remove a specific option
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

    if (isPreviewMode) {
        // Simple Preview Mode
        return (
            <div className="survey-preview-page p-8">
                <button className="bg-gray-200 p-2 rounded" onClick={() => setIsPreviewMode(false)}>
                    &larr; Back to Builder
                </button>
                <h1 className="text-3xl mt-4">{survey.title || "Untitled Survey"}</h1>
                <p className="text-gray-600 mb-6">{survey.description}</p>

                {survey.questions.map((q, index) => (
                    <div key={index} className="question-display mb-4 p-4 border rounded">
                        <p className="font-semibold">Q{index + 1}. {q.question_text} {q.is_required && <span className="text-red-500">*</span>}</p>

                        {['multiple_choice', 'checkbox'].includes(q.question_type) && q.options.map((opt, optIndex) => (
                            <div key={optIndex} className="ml-4">
                                <input
                                    type={q.question_type === 'multiple_choice' ? 'radio' : 'checkbox'}
                                    disabled
                                    name={`q-${index}`}
                                    className="mr-2"
                                />
                                {opt.option_text}
                            </div>
                        ))}
                        {q.question_type === 'short_answer' && (
                            <textarea disabled placeholder="Short answer text box" rows="3" className="w-full border p-2 mt-2"></textarea>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    // Survey Builder Mode (The main view)
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                    <CardTitle>Survey Details</CardTitle>
                    <CardDescription>Create or edit your survey. Add questions and manage options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Survey Title</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Add your title here"
                            value={survey.title}
                            onChange={handleSurveyDetailChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Survey Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="What is the purpose of this survey"
                            value={survey.description}
                            onChange={handleSurveyDetailChange}
                            rows={4}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_public"
                            checked={survey.is_public}
                            onCheckedChange={handleIsPublicChange}
                        />
                        <Label htmlFor="is_public">Make survey public</Label>
                    </div>
                </CardContent>
            </Card>

            {/* Question summaries removed to avoid miniature duplicates; editors below remain */}

            <div className="flex space-x-2">
                <Button onClick={() => handleAddQuestion('multiple_choice')}>+ Multiple Choice</Button>
                <Button onClick={() => handleAddQuestion('checkbox')}>+ Checkbox</Button>
                <Button onClick={() => handleAddQuestion('short_answer')}>+ Short Answer</Button>
            </div>

            {/* Render the detailed QuestionEditor components for editing */}
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
                    />
                ))}

                {survey.questions.length === 0 && (
                    <p className="text-gray-500 italic">No questions yet. Use the buttons above to get started.</p>
                )}
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900">Ready to save your survey?</p>
                            <p className="text-gray-600">{survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''} added</p>
                        </div>
                                {/* Action Buttons */}
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
