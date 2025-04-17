import { useState } from 'react';
import axios from 'axios';

function CreatePost({ onPostCreated }) {
  const [activeTab, setActiveTab] = useState('story');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const visibilityOptions = [
    { key: 'public', label: 'Public', icon: 'globe' },
    { key: 'connections', label: 'Connections', icon: 'users' },
    { key: 'private', label: 'Private', icon: 'lock' }
  ];

  const handleVisibilityChange = (key) => {
    setVisibility(visibility === key ? '' : key);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Generate preview URLs
    const previews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() || !visibility) {
      alert('Please add content and select visibility.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', activeTab);
      formData.append('visibility', visibility);
      
      // Add images if any
      files.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });
      
      const response = await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.status === 'success') {
        // Reset form
        setContent('');
        setVisibility('');
        setFiles([]);
        setPreviewImages([]);
        
        // Notify parent component
        if (onPostCreated) onPostCreated(response.data.data);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-4 p-4">
      <div className="mb-4">
        <ul className="flex border-b">
          <li className="mr-1">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'story' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-200' 
                : 'text-gray-500 hover:text-blue-600 bg-white'}`}
              onClick={() => setActiveTab('story')}
            >
              Share a story
            </button>
          </li>
          <li>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'article' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-200' 
                : 'text-gray-500 hover:text-blue-600 bg-white '}`}
              onClick={() => setActiveTab('article')}
            >
              Write an article
            </button>
          </li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea 
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder={activeTab === 'story' ? "What's on your mind?" : "Write your article title and content..."}
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>
        
        {/* Image Preview Section */}
        {previewImages.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {previewImages.map((url, index) => (
              <div key={index} className="relative w-24 h-24">
                <img 
                  src={url} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-full object-cover rounded" 
                />
                <button 
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
                  onClick={() => {
                    setPreviewImages(previewImages.filter((_, i) => i !== index));
                    setFiles(files.filter((_, i) => i !== index));
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <label className="cursor-pointer text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100">
              <input 
                type="file" 
                multiple 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </label>
            
            <div className="flex">
              {visibilityOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`p-2 rounded-full ${
                    visibility === option.key 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleVisibilityChange(option.key)}
                  title={option.label}
                >
                  {option.icon === 'globe' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {option.icon === 'users' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                  {option.icon === 'lock' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !content.trim() || !visibility}
            className={`btn-primary text-white px-6 py-2 rounded-md font-medium ${
              (!content.trim() || !visibility) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;