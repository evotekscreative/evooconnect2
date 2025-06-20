import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BlogFormStepper from '../../components/Blog/BlogFormStepper';
import TitleStep from '../../components/Blog/TitleStep';
import CategoryStep from '../../components/Blog/CategoryStep';
import ContentStep from '../../components/Blog/ContentStep';
import PreviewStep from '../../components/Blog/PreviewStep';

const MAX_CHARACTERS = 1500;

function CreateBlog() {
  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    images: [],
    date: new Date().toLocaleDateString(),
  });
  const [charCount, setCharCount] = useState(0);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: "", message: "" });

  const steps = [
    { id: 1, label: 'Title' },
    { id: 2, label: 'Category' },
    { id: 3, label: 'Content' },
    { id: 4, label: 'Preview' },
  ];

  const handleStepChange = (direction) => {
    if (direction === 'next') {
      setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length));
    } else {
      setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
    }
  };

  // Fungsi untuk menghitung karakter dari HTML (CKEditor)
  const countCharacters = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent.length;
  };

  const handleFormChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    if (field === "content") {
      setCharCount(countCharacters(value));
    }
  };

  const handleSubmit = async () => {
    if (charCount > MAX_CHARACTERS) {
      setAlertInfo({
        show: true,
        type: "error",
        message: `Content exceeds maximum ${MAX_CHARACTERS} characters!`,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('content', formData.content);

      if (formData.images.length > 0 && formData.images[0].file) {
        formDataToSend.append('image', formData.images[0].file);
      }

      const response = await axios.post(
        apiUrl + '/api/blogs',
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const blogSlug = response.data.data.slug;

      navigate(`/blog-detail/${blogSlug}`, {
        state: { showPublishedToast: true }
      });
      window.scrollTo(0, 0);
      setAlertInfo({
        show: true,
        type: "success",
        message: "Successfully created blog!",
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: "error",
        message: "Failed to create blog!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      navigate('/blog');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TitleStep
            title={formData.title}
            onTitleChange={(value) => handleFormChange('title', value)}
            onNext={() => handleStepChange('next')}
            onCancel={handleCancel}
          />
        );
      case 2:
        return (
          <CategoryStep
            category={formData.category}
            onCategoryChange={(value) => handleFormChange('category', value)}
            onNext={() => handleStepChange('next')}
            onPrev={() => handleStepChange('prev')}
          />
        );
      case 3:
        return (
          <>
            <ContentStep
              content={formData.content}
              images={formData.images}
              onContentChange={(value) => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = value;
                const count = tempDiv.textContent.length;
                if (count <= MAX_CHARACTERS) {
                  handleFormChange('content', value);
                }
              }}
              onImagesChange={(value) => handleFormChange('images', value)}
              onNext={() => handleStepChange('next')}
              onPrev={() => handleStepChange('prev')}
            />
            {/* <div className={`text-sm mt-2 text-right ${charCount > MAX_CHARACTERS ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
              {charCount}/{MAX_CHARACTERS} characters
            </div> */}
          </>
        );
      case 4:
        return (
          <PreviewStep
            formData={formData}
            onSubmit={handleSubmit}
            onPrev={() => handleStepChange('prev')}
            isSubmitting={isSubmitting}
            isDisabled={charCount > MAX_CHARACTERS}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BlogFormStepper steps={steps} currentStep={currentStep} />
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateBlog;
