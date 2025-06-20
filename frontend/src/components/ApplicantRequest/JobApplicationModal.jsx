import React, { useState } from 'react';
import ConfirmationDialog from '../../components/ApplicantRequest/ConfirmationDialog.jsx';
import ContactInfo from '../../components/ApplicantRequest/ContactInfo.jsx';
import ResumeUpload from '../../components/ApplicantRequest/ResumeUpload.jsx';
import Questions from '../../components/ApplicantRequest/Questions.jsx';
// import { ChevronLeft } from 'lucide-react';

const JobApplicationModal = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState('contact');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [userData, setUserData] = useState({
        profileImage: "https://via.placeholder.com/80",
        name: "Windha Kusuma Dewi",
        phone: "1234567890",
        email: "asdfghj@gmail.com",
        address: "Bogor",
        linkedin: "linkedin.com/in/yourprofile",
        resume: null,
        motivation: "",
        cover: "",
        salary: "",
        availableStartDate: ""
    });

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
        setUserData(prev => ({ ...prev, resume: file }));
    };

    const handleQuestionChange = (name, value) => {
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        console.log("Application submitted:", userData);
        onClose();
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
            <div className="bg-white rounded-lg max-w-md w-full mx-auto shadow-xl">
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