import { useState } from 'react';

function TitleStep({ title, onTitleChange, onNext, onCancel }) {
  const [error, setError] = useState('');
  const maxLength = 50;

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      onTitleChange(value);
      setError('');
    }
  };

  const handleNext = () => {
    if (!title.trim()) {
      setError('Please enter a title for your blog');
      return;
    }
    onNext();
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose a name for your blog</h2>
      <p className="text-gray-600 mb-6">
        This is the title that will be displayed at the top of your Blog.
      </p>
      
      <div className="mb-6">
        <label htmlFor="blog-title" className="block mb-2 font-medium text-gray-700">
          Blog Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="blog-title"
          className={`w-full px-4 py-3 rounded-md border ${error ? 'border-red-500' : 'border-gray-300'} 
            focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black`}
          placeholder="Enter your blog title"
          value={title}
          onChange={handleChange}
          maxLength={maxLength}
        />
        <div className="flex justify-between mt-2">
          <span className={`text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || ''}
          </span>
          <span className="text-sm text-gray-500">{title.length}/{maxLength}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200 mt-8 pt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="btn-primary text-white px-6 py-2.5 rounded-md font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TitleStep;