import React, { useState } from 'react';
import { WandSparkles, Check, X, ArrowRight } from 'lucide-react';

const QuestionEditor = ({
                            question,
                            index,
                            totalQuestions,
                            handleQuestionChange,
                            handleRemoveQuestion,
                            handleMoveQuestionUp,
                            handleMoveQuestionDown,
                            handleAddOption,
                            handleOptionChange,
                            handleRemoveOption,
                            handleRefineQuestion,
                            handleAcceptSuggestion,
                            handleDiscardSuggestion
                        }) => {
    const [isRefining, setIsRefining] = useState(false);

    const onRefineClick = async () => {
        setIsRefining(true);
        await handleRefineQuestion(index);
        setIsRefining(false);
    };

    const isOptionQuestion = ['multiple_choice', 'checkbox'].includes(question.question_type);

    if (question.aiSuggestion) {
        return (
            <div className="mb-6 p-1 border-2 border-indigo-200 rounded-lg shadow-lg bg-indigo-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-indigo-100 p-3 flex justify-between items-center border-b border-indigo-200">
                    <div className="flex items-center gap-2 text-indigo-800 font-bold">
                        <WandSparkles size={18} />
                        <span>AI Suggestion</span>
                    </div>
                    <div className="text-xs text-indigo-600">Review changes</div>
                </div>

                <div className="flex flex-col md:flex-row">

                    <div className="flex-1 p-4 bg-white border-r border-gray-200 opacity-60">
                        <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Original</h4>
                        <div className="p-2 border rounded bg-gray-50 text-gray-700 mb-3 text-sm">
                            {question.question_text}
                        </div>
                        {question.options && question.options.map((opt, i) => (
                            <div key={i} className="text-xs text-gray-500 ml-2 mb-1">• {opt.option_text}</div>
                        ))}
                        <button
                            onClick={() => handleDiscardSuggestion(index)}
                            className="mt-4 w-full py-2 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 text-sm transition-colors"
                        >
                            <X size={14} /> Keep Original
                        </button>
                    </div>


                    <div className="hidden md:flex flex-col justify-center items-center p-2 text-indigo-300">
                        <ArrowRight size={20} />
                    </div>


                    <div className="flex-1 p-4 bg-white">
                        <h4 className="text-xs uppercase text-indigo-600 font-bold mb-2">✨ Polished</h4>
                        <div className="p-2 border border-indigo-200 rounded bg-indigo-50 text-indigo-900 mb-3 text-sm font-medium">
                            {question.aiSuggestion.question_text}
                        </div>
                        {question.aiSuggestion.options && question.aiSuggestion.options.map((opt, i) => (
                            <div key={i} className="text-xs text-indigo-700 ml-2 mb-1">• {opt.option_text}</div>
                        ))}
                        <button
                            onClick={() => handleAcceptSuggestion(index)}
                            className="mt-4 w-full py-2 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-bold shadow-sm transition-colors"
                        >
                            <Check size={14} /> Use AI Version
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className={`question-editor mb-6 p-4 border-2 rounded-lg shadow-md bg-white ${question.isGenerated ? 'border-indigo-200 bg-indigo-50/10' : ''}`}>
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">Question {index + 1}</h3>


                    {question.isGenerated ? (
                        <span className="ml-2 flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 select-none">
                           <Check size={10} /> AI Locked
                        </span>
                    ) : (

                        question.question_text && question.question_text.length > 5 && (
                            <button
                                onClick={onRefineClick}
                                disabled={isRefining}
                                className="ml-2 flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded-full hover:bg-indigo-100 transition-all"
                                title="Refine with AI (One-time use)"
                            >
                                {isRefining ? <span className="animate-spin">✨</span> : <WandSparkles size={12} />}
                                {isRefining ? "Polishing..." : "Refine"}
                            </button>
                        )
                    )}


                    <div className="flex flex-col space-y-1 ml-2">
                        <button onClick={() => handleMoveQuestionUp(index)} disabled={index === 0} className="text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed">↑</button>
                        <button onClick={() => handleMoveQuestionDown(index)} disabled={index === totalQuestions - 1} className="text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed">↓</button>
                    </div>
                </div>
                <button onClick={() => handleRemoveQuestion(index)} className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">Remove</button>
            </div>

            <input
                type="text"
                value={question.question_text}
                placeholder="Enter question text (e.g., 'What is your favorite color?')"
                onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                className="w-full p-2 border rounded mb-3"
            />


            <div className="flex items-center space-x-4 mb-3">
                <label>Type:</label>
                <select
                    value={question.question_type}
                    onChange={(e) => handleQuestionChange(index, 'question_type', e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="short_answer">Short Answer</option>
                </select>

                <label>
                    <input
                        type="checkbox"
                        checked={question.is_required}
                        onChange={(e) => handleQuestionChange(index, 'is_required', e.target.checked)}
                        className="mr-1"
                    />
                    Required
                </label>
            </div>

            {isOptionQuestion && (
                <div className="options-section mt-4 p-3 bg-gray-50 border rounded">
                    <h4 className="font-medium mb-2">Options:</h4>
                    {(!question.options || question.options.length === 0) ? (
                        <p className="text-sm italic text-gray-500 mb-2">No options yet. Add an option below.</p>
                    ) : (
                        question.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2 mb-2">
                                <input type={question.question_type === 'multiple_choice' ? 'radio' : 'checkbox'} disabled className="mr-2" />
                                <input
                                    type="text"
                                    value={opt.option_text || ''}
                                    placeholder={`Option ${optIndex + 1}`}
                                    onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                                    className="flex-grow p-1 border rounded"
                                />
                                <button onClick={() => handleRemoveOption(index, optIndex)} className="text-red-400 hover:text-red-600 text-lg px-2">&times;</button>
                            </div>
                        ))
                    )}
                    <button onClick={() => handleAddOption(index)} className="text-sm text-blue-500 hover:text-blue-700 hover:underline mt-2 px-2 py-1 rounded hover:bg-blue-50">+ Add Option</button>
                </div>
            )}

            {question.question_type === 'short_answer' && (
                <div className="mt-4 p-3 bg-gray-50 border rounded">
                    <textarea disabled placeholder="Users will type their answer here." rows="2" className="w-full border p-2"></textarea>
                </div>
            )}
        </div>
    );
};

export default QuestionEditor;