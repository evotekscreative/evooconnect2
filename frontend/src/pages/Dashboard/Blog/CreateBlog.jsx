import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogFormStepper from '../../../components/Blog/BlogFormStepper';
import TitleStep from '../../../components/Blog/TitleStep';
import CategoryStep from '../../../components/Blog/CategoryStep';
import ContentStep from '../../../components/Blog/ContentStep';
import PreviewStep from '../../../components/Blog/PreviewStep';
import logo from '../../../assets/img/logo1.png'
 


BlogFormStepper
function CreateBlog() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    images: []
  });

  const steps = [
    { id: 1, label: 'Title' },
    { id: 2, label: 'Category' },
    { id: 3, label: 'Content' },
    { id: 4, label: 'Preview' }
  ];

  const handleStepChange = (direction) => {
    if (direction === 'next') {
      setCurrentStep(prevStep => Math.min(prevStep + 1, steps.length));
    } else {
      setCurrentStep(prevStep => Math.max(prevStep - 1, 1));
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Here you would typically send the data to your API
    try {
      console.log('Submitting blog post:', formData);
      // Mock API call
      // await axios.post('/api/blogs', formData);
      
      // On success
      alert('Blog post created successfully!');
      navigate('/blog');
    } catch (error) {
      console.error('Error creating blog post:', error);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      navigate('/blog');
    }
  };

  const renderStepContent = () => {
    switch(currentStep) {
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
          <ContentStep 
            content={formData.content}
            images={formData.images}
            onContentChange={(value) => handleFormChange('content', value)}
            onImagesChange={(value) => handleFormChange('images', value)}
            onNext={() => handleStepChange('next')}
            onPrev={() => handleStepChange('prev')}
          />
        );
      case 4:
        return (
          <PreviewStep 
            formData={formData}
            onSubmit={handleSubmit}
            onPrev={() => handleStepChange('prev')}
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
          {/* Stepper */}
          <BlogFormStepper steps={steps} currentStep={currentStep} />
          
          {/* Form Content */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
}


export default CreateBlog;