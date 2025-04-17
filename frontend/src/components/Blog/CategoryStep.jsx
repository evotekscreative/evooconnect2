import { useState } from 'react';

function CategoryStep({ category, onCategoryChange, onNext, onPrev }) {
    const [error, setError] = useState('');
    
    const categories = [
      'Fashion', 'Beauty', 'Travel', 'Lifestyle', 'Personal', 'Technology',
      'Health', 'Fitness', 'Healthcare', 'SaaS Services', 'Business',
      'Education', 'Food & Recipes', 'Love & Relationships', 'Alternative Topics',
      'Eco-Friendly Living', 'Music', 'Automotive', 'Marketing', 'Internet Services',
      'Finance', 'Sports', 'Entertainment', 'Productivity', 'Hobbies',
      'Parenting', 'Pets', 'Photography', 'Farming', 'Art',
      'Homemade', 'Science', 'Games', 'History', 'Self-Development',
      'News & Current Affairs'
    ];
  
    const handleChange = (e) => {
      onCategoryChange(e.target.value);
      setError('');
    };
  
    const handleNext = () => {
      if (!category) {
        setError('Please select a category for your blog');
        return;
      }
      onNext();
    };
  
    return (
      <div className="py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a category for your blog</h2>
        <p className="text-gray-600 mb-6">
          Choosing the right category helps readers find your content.
        </p>
        
        <div className="mb-6">
          <label htmlFor="blog-category" className="block mb-2 font-medium text-gray-700">
            Blog Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="blog-category"
              className={`w-full px-4 py-3 rounded-md border ${error ? 'border-red-500' : 'border-gray-300'} 
                focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black appearance-none`}
              value={category}
              onChange={handleChange}
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 flex justify-between">
          <button
            type="button"
            onClick={onPrev}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition"
          >
            Previous
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
  
  export default CategoryStep;