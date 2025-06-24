import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, HelpCircle, X } from 'lucide-react';
import ConfirmationDialog from '../../components/ApplicantRequest/ConfirmationDialog.jsx';

const ContactInfo = ({ onNext, isSubmitting, onClose, userData, onContactChange }) => {
    const [contactData, setContactData] = useState({
        profileImage: "https://via.placeholder.com/80",
        title: "Software Engineer",
        name: "",
        headline: "",
        location: "",
        phone: "",
        email: "",
        address: "",
        linkedin: ""
    });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setContactData(prev => ({
                ...prev,
                name: user.name || "",
                headline: user.headline || "",
                location: user.location || "",
                phone: user.phone || "",
                email: user.email || "",
                address: user.location || "",
                linkedin: user.socials?.linkedin || "",
                profileImage: user.photo
                    ? `${import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"}/${user.photo.replace(/^\/+/, "")}`
                    : "https://via.placeholder.com/80",
            }));
        }
    }, []);

    // Tambahkan handler untuk input LinkedIn
    const handleLinkedinChange = (e) => {
        setContactData(prev => ({
            ...prev,
            linkedin: e.target.value
        }));
        if (onContactChange) {
            onContactChange('linkedin', e.target.value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onContactChange) {
            onContactChange('linkedin', contactData.linkedin);
        }
        onNext();
    };

    const handleClose = () => {
        setShowConfirmDialog(true);
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-start justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mt-10 max-h-[90vh] flex flex-col animate-slide-down overflow-y-auto max-h-[80vh]">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-xl font-semibold text-gray-800">Apply for {contactData.title}</h1>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-6">Contact Info</h3>

                    <div className="mb-6 flex items-start gap-4">
                        <img
                            src={contactData.profileImage}
                            alt="Profile"
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                        />
                        <div>
                            <p className="font-medium text-gray-900">{contactData.name}</p>
                            <p className="text-gray-500 text-sm mt-1">{contactData.headline}</p>
                            <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                {contactData.location}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5 text-gray-500" />
                                    Phone*
                                </label>
                                <div className="p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50">
                                    {contactData.phone}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5 text-gray-500" />
                                    Email*
                                </label>
                                <div className="p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50">
                                    {contactData.email}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                    Address*
                                </label>
                                <div className="p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50">
                                    {contactData.address}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1">
                                    LinkedIn Profile*
                                </label>
                                <input
                                    type="url"
                                    className="p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 w-full"
                                    value={contactData.linkedin}
                                    onChange={handleLinkedinChange}
                                    placeholder="Enter your LinkedIn profile URL"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-xs text-gray-500 mb-4 flex items-start gap-1.5">
                                <HelpCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
                                <span>Submitting won't change your profile</span>
                            </p>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-5 py-2 text-sm bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors ${
                                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isSubmitting ? 'Processing...' : 'Next'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

           {showConfirmDialog && (
                <ConfirmationDialog
                    onConfirm={() => setShowConfirmDialog(false)}
                    onDiscard={onClose} // Langsung panggil onClose
                />
            )}
        </div>
    );
};

export default ContactInfo;