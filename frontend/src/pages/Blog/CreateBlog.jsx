import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BlogFormStepper from '../../components/Blog/BlogFormStepper';
import TitleStep from '../../components/Blog/TitleStep';
import CategoryStep from '../../components/Blog/CategoryStep';
import ContentStep from '../../components/Blog/ContentStep';
import PreviewStep from '../../components/Blog/PreviewStep';

function CreateBlog() {
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

  const handleFormChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      // 1. Create Blog (tanpa image dulu)
      const createRes = await axios.post(
        'http://localhost:3000/api/blogs',
        {
          title: formData.title,
          category: formData.category,
          content: formData.content,
          date: formData.date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const blogId = createRes.data.data.id;
      const blogSlug = createRes.data.data.slug;
      let uploadedImagePath = '';

      // 2. Upload image (jika ada)
      if (formData.images.length > 0) {
        const formDataImage = new FormData();
        formData.images.forEach((img) => {
          if (img.file) {
            formDataImage.append('photos', img.file);
          }
        });

        const uploadRes = await axios.post(
          `http://localhost:3000/api/blogs/${blogId}/upload-photo`,
          formDataImage,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        uploadedImagePath = uploadRes.data.data.photo;

        // 3. Update blog dengan image path
        await axios.put(
          `http://localhost:3000/api/blogs/${blogId}`,
          {
            image: uploadedImagePath,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      navigate(`/blog-detail/${blogSlug}`, {
        state: { showPublishedToast: true }
      });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert('Failed to create blog post.');
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
            isSubmitting={isSubmitting}
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
