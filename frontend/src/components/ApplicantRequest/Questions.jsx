import React, { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import ConfirmationDialog from '../../components/ApplicantRequest/ConfirmationDialog.jsx';

const Questions = ({ userData, onBack, onSubmit, onQuestionChange, onClose }) => {
    const [formData, setFormData] = useState({
        motivation: '',
        cover: '',
        salary: '',
        availableStartDate: ''
    });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (onQuestionChange) onQuestionChange(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    const handleClose = () => {
        setShowConfirmDialog(true);
    };

    const handleSaveAndClose = () => {
        setShowConfirmDialog(false);
        onClose();
    };

    const handleDiscard = () => {
        setShowConfirmDialog(false);
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-start justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mt-10 max-h-[90vh] flex flex-col animate-slide-down">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={onBack}
                                className="p-1 rounded-full hover:bg-gray-100 mr-2"
                                aria-label="Back"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-800">Questions</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="overflow-y-auto p-6 flex-1">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-4">Additional Questions</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
                                        Motivation Letter*
                                    </label>
                                    <textarea
                                        id="motivation"
                                        name="motivation"
                                        value={formData.motivation}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cover" className="block text-sm font-medium text-gray-700 mb-2">
                                        Cover Letter*
                                    </label>
                                    <textarea
                                        id="cover"
                                        name="cover"
                                        value={formData.cover}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <label htmlFor="salary" className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            Expected Salary*
                                        </label>
                                        <input
                                            id="salary"
                                            type="number"
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="availableStartDate" className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                            Available Start Date*
                                        </label>
                                        <input
                                            id="availableStartDate"
                                            type="date"
                                            name="availableStartDate"
                                            value={formData.availableStartDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t">
                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={onBack}
                                className="px-5 py-2 text-sm border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-sm bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors"
                            >
                                Submit Application
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {showConfirmDialog && (
                <ConfirmationDialog
                    onConfirm={handleSaveAndClose}
                    onCancel={handleDiscard}
                    onDiscard={onClose}
                />
            )}
        </div>
    );
};

export default Questions;