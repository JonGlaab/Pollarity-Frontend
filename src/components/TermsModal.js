import React from 'react';
import { termsOfService } from '../data/terms';

const TermsModal = ({ isOpen, onClose, onAgree }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="relative p-5 border w-11/12 md:w-1/2 shadow-2xl rounded-lg bg-white">
                <div className="mt-3">
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Terms of Service</h3>
                    <div className="mt-2 px-6 py-4 text-left h-64 overflow-y-scroll bg-gray-50 rounded border border-gray-200 text-gray-600 text-sm">
                        {termsOfService.map((section, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                                <h4 className="font-bold text-gray-800 mb-1">{section.title}</h4>
                                <p>{section.content}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-6 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onAgree}
                            className="px-4 py-2 bg-[#415a77] text-white text-base font-medium rounded-md shadow-sm hover:bg-[#1b263b] focus:outline-none transition-colors"
                        >
                            I Agree
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;