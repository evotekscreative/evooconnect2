import React from 'react';

const ConfirmationDialog = ({ onConfirm, onDiscard }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Are you sure you want to cancel this application?</h3>
                <p className="text-sm text-gray-600 mb-4">
                    If you choose to not save, your application will be discarded.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onDiscard}
                        className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;