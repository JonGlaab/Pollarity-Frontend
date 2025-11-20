import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QuestionEditor from '../components/QuestionEditor';

// Initial structure for a new survey
const initialSurveyState = {
    title: '',
    description: '',
    status: 'draft',
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

    // Handler for Survey Title and Description
    const handleSurveyDetailChange = (e) => {
        setSurvey(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
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

    // Handler to save the survey (POST request)
    const handleSave = async (status) => {
        setIsSaving(true);
        const dataToSend = { ...survey, status };

        try {
            const response = await axios.post("/api/surveys", dataToSend, {
                withCredentials: true
            });

            alert(`Survey saved as ${status}!`);
            navigate(`/survey/${response.data.survey_id}/edit`);

        } catch (error) {
            console.error("Survey creation failed:", error.response?.data || error);
            alert("Failed to save survey. Check the console for details.");
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
        <div className="container">
            <h1 className="text-4xl font-bold">Build Your Survey</h1>
            <p className="text-gray-600 mb-6">Create or edit your survey. Add questions, choose types, set required fields, and manage options.</p>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-8">
                <button onClick={() => setIsPreviewMode(true)} className="bg-blue-500 text-white p-2 rounded">
                    Preview Survey
                </button>
                <button onClick={() => handleSave('draft')} disabled={isSaving} className="bg-green-500 text-white p-2 rounded">
                    {isSaving ? 'Saving Draft...' : 'Save Draft'}
                </button>
                <button onClick={() => handleSave('published')} disabled={isSaving || !survey.title || survey.questions.length === 0} className="bg-purple-500 text-white p-2 rounded">
                    Publish Survey
                </button>
            </div>

            <div className="survey-details mb-8 border p-6 rounded shadow">
                <h2 className="text-2xl mb-4">Survey Details</h2>
                <input
                    type="text"
                    name="title"
                    placeholder="Survey Title"
                    value={survey.title}
                    onChange={handleSurveyDetailChange}
                    className="w-full p-2 border rounded mb-3"
                />
                <textarea
                    name="description"
                    placeholder="Describe the purpose of this survey"
                    value={survey.description}
                    onChange={handleSurveyDetailChange}
                    rows="4"
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="questions-section">
                <h2 className="text-2xl mb-4">Questions ({survey.questions.length})</h2>
                <div className="flex space-x-2 mb-6">
                    <button onClick={() => handleAddQuestion('multiple_choice')} className="bg-gray-700 text-white p-2 rounded">+ Multiple Choice</button>
                    <button onClick={() => handleAddQuestion('checkbox')} className="bg-gray-700 text-white p-2 rounded">+ Checkbox</button>
                    <button onClick={() => handleAddQuestion('short_answer')} className="bg-gray-700 text-white p-2 rounded">+ Short Answer</button>
                </div>

                {survey.questions.map((q, index) => (
                    <QuestionEditor
                        key={index}
                        question={q}
                        index={index}
                        handleQuestionChange={handleQuestionChange}
                        handleRemoveQuestion={handleRemoveQuestion}
                        handleAddOption={handleAddOption}
                        handleOptionChange={handleOptionChange}
                        handleRemoveOption={handleRemoveOption}
                    />
                ))}

                {survey.questions.length === 0 && (
                    <p className="text-gray-500 italic">No questions yet. Use the buttons above to get started.</p>
                )}
            </div>
        </div>
    );
};
