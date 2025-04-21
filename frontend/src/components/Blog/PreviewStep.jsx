function PreviewStep({ formData, onSubmit, onPrev }) {
    const { title, category, content, images } = formData;
    
    return (
      <div className="py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Preview Your Blog Post</h2>
        <p className="text-gray-600 mb-6">
          Review your blog post before publishing.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Title</h3>
            <div className="mt-2 text-xl font-bold text-gray-900">{title}</div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Category</h3>
            <div className="mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {category}
              </span>
            </div>
          </div>
          
          {images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Content</h3>
            <div 
              className="prose max-w-none mt-2 p-4 bg-white rounded-md border border-gray-200 text-black"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
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
            onClick={onSubmit}
            className="btn-primary text-white px-6 py-2.5 rounded-md font-medium"
          >
            Publish Blog
          </button>
        </div>
      </div>
    );
  }
  
  export default PreviewStep;