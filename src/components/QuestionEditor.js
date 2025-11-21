import React from 'react';

// This component handles the editing of a single question and its options.
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
                            handleRemoveOption }) => {

    // TODO: Need to implement option handlers (add, remove, change text)

    const isOptionQuestion = ['multiple_choice', 'checkbox'].includes(question.question_type);

    return (
        <div className="question-editor mb-6 p-4 border-2 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                    {/* Reorder Buttons */}
                    <div className="flex flex-col space-y-1 ml-2">
                        <button
                            onClick={() => handleMoveQuestionUp(index)}
                            disabled={index === 0}
                            className="text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                            title="Move up"
                        >
                            ↑
                        </button>
                        <button
                            onClick={() => handleMoveQuestionDown(index)}
                            disabled={index === totalQuestions - 1}
                            className="text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                            title="Move down"
                        >
                            ↓
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => handleRemoveQuestion(index)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                >
                    Remove
                </button>
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

            {/* Options Section */}
            {isOptionQuestion && (
                <div className="options-section mt-4 p-3 bg-gray-50 border rounded">
                    <h4 className="font-medium mb-2">Options:</h4>

                    {(!question.options || question.options.length === 0) ? (
                        <p className="text-sm italic text-gray-500 mb-2">No options yet. Add an option below.</p>
                    ) : (
                        question.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2 mb-2">
                                {/* Radio/Checkbox icon placeholder */}
                                <input
                                    type={question.question_type === 'multiple_choice' ? 'radio' : 'checkbox'}
                                    disabled
                                    className="mr-2"
                                />

                                {/* Option Text Input */}
                                <input
                                    type="text"
                                    value={opt.option_text || ''}
                                    placeholder={`Option ${optIndex + 1}`}
                                    onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                                    className="flex-grow p-1 border rounded"
                                />

                                {/* Remove Option Button */}
                                <button
                                    onClick={() => handleRemoveOption(index, optIndex)}
                                    className="text-red-400 hover:text-red-600 text-lg px-2"
                                    title="Remove option"
                                >
                                    &times;
                                </button>
                            </div>
                        ))
                    )}

                    {/* Add Option button */}
                    <button
                        onClick={() => handleAddOption(index)}
                        className="text-sm text-blue-500 hover:text-blue-700 hover:underline mt-2 px-2 py-1 rounded hover:bg-blue-50"
                    >
                        + Add Option
                    </button>
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