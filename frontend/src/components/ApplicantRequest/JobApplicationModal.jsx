import React, { useState, useEffect } from 'react';
import ConfirmationDialog from '../../components/ApplicantRequest/ConfirmationDialog.jsx';
import ContactInfo from '../../components/ApplicantRequest/ContactInfo.jsx';
import ResumeUpload from '../../components/ApplicantRequest/ResumeUpload.jsx';
import Questions from '../../components/ApplicantRequest/Questions.jsx';
import axios from 'axios';
// import { ChevronLeft } from 'lucide-react';

const JobApplicationModal = ({ onClose, jobVacancyId, onApplied, setHasApplied }) => {
    const [currentStep, setCurrentStep] = useState('contact');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [userData, setUserData] = useState({
        profileImage: "https://via.placeholder.com/80",
        name: "",
        phone: "",
        email: "",
        address: "",
        linkedin: "",
        resume: null,
        motivation: "",
        cover: "",
        salary: "",
        availableStartDate: ""
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setUserData(prev => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                profileImage: user.photo
                    ? `${import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000"}/${user.photo.replace(/^\/+/, "")}`
                    : "https://via.placeholder.com/80",
                address: user.location || "",
                linkedin: user.socials?.linkedin || "",
            }));
        }
        fetchUserCV();
    }, []);

    const fetchUserCV = async () => {
        const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
        const token = localStorage.getItem("token");
        
        try {
            const response = await fetch(`${apiUrl}/api/user/cv`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.code === 200 && data.data) {
                // Create a mock file object from existing CV data
                const existingCV = {
                    name: data.data.original_filename,
                    size: data.data.file_size,
                    lastModified: new Date(data.data.uploaded_at).getTime(),
                    path: data.data.cv_file_path,
                    isExisting: true
                };
                
                setUserData(prev => ({
                    ...prev,
                    resume: existingCV,
                    existing_cv_path: data.data.cv_file_path
                }));
            }
        } catch (error) {
            console.error('Error fetching user CV:', error);
        }
    };

    const handleNext = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            if (currentStep === 'contact') setCurrentStep('resume');
            else if (currentStep === 'resume') setCurrentStep('questions');
        }, 500);
    };

    const handleBack = () => {
        if (currentStep === 'resume') setCurrentStep('contact');
        else if (currentStep === 'questions') setCurrentStep('resume');
    };

    const handleResumeChange = (file) => {
        setUserData(prev => ({ 
            ...prev, 
            resume: file,
            existing_cv_path: file && !file.isExisting ? undefined : prev.existing_cv_path
        }));
    };

    const handleQuestionChange = (name, value) => {
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";
        const token = localStorage.getItem("token");
        const formData = new FormData();

        formData.append("contact_phone", userData.phone);
        formData.append("contact_email", userData.email);
        formData.append("contact_address", userData.address);
        formData.append("contact_linkedin", userData.linkedin);
        formData.append("motivation_letter", userData.motivation);
        formData.append("cover_letter", userData.cover);
        formData.append("expected_salary", userData.salary ? Number(userData.salary) : 0);
        formData.append("available_start_date", userData.availableStartDate);

        if (userData.resume) {
            if (userData.resume.isExisting) {
                // Use existing CV
                formData.append("existing_cv_path", userData.resume.path);
            } else {
                // New CV upload - existing_cv_path will be removed automatically
                formData.append("cv_file", userData.resume);
            }
        }

        try {
            const response = await axios.post(
                `${apiUrl}/api/job-applications/${jobVacancyId}/apply`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (response.status === 201) {
                if (setHasApplied) setHasApplied(true);
                if (onApplied) onApplied();
                else onClose();
            }
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.data === "You have already applied to this job"
            ) {
                if (setHasApplied) setHasApplied(true);
                if (onApplied) onApplied();
                else onClose();
            } else {
                alert("Failed to submit application. Please try again.");
            }
            console.error(error);
            if (error.response) {
                console.log('API error detail:', error.response.data);
            }
        }
    };  
    const handleRequestClose = () => {
        setShowConfirmDialog(true);
    };

    const handleDiscard = () => {
        setShowConfirmDialog(false);
        onClose(); // Ini akan menutup semua modal dan kembali ke job profile
    };

    const renderStep = () => {
        switch (currentStep) {
            case 'contact':
                return <ContactInfo userData={userData} onNext={handleNext} isSubmitting={isSubmitting} onClose={handleRequestClose} />;
            case 'resume':
                return (
                    <ResumeUpload
                        userData={userData}
                        onBack={handleBack}
                        onNext={handleNext}
                        onResumeChange={handleResumeChange}
                        isSubmitting={isSubmitting}
                        onClose={handleRequestClose}
                    />
                );
            case 'questions':
                return (
                    <Questions
                        userData={userData}
                        onBack={handleBack}
                        onSubmit={handleSubmit}
                        onQuestionChange={handleQuestionChange}
                        onClose={handleRequestClose}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-auto shadow-xl overflow-y-auto max-h-[90vh]">
                {renderStep()}
            </div>

            {showConfirmDialog && (
                <ConfirmationDialog
                    onConfirm={() => setShowConfirmDialog(false)}
                    onDiscard={handleDiscard}
                />
            )}
        </div>
    );
};

export default JobApplicationModal;