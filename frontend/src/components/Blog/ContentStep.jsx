import { useState, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function ContentStep({ content, images, onContentChange, onImagesChange, onNext, onPrev }) {
  const [contentError, setContentError] = useState('');
  const [imageError, setImageError] = useState('');
  const [charCount, setCharCount] = useState(content?.length || 0);
  const maxLength = 1500;
  const fileInputRef = useRef(null);

  const handleContentChange = (event, editor) => {
    const data = editor.getData();
    onContentChange(data);
    setCharCount(data.replace(/<[^>]*>/g, '').length);
    setContentError('');
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const invalidFile = files.find(file => !file.type.startsWith('image/'));
    if (invalidFile) {
      setImageError('Only image files are allowed');
      return;
    }

    const updatedImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    onImagesChange([...images, ...updatedImages]);
    setImageError('');
  };

  const handleRemoveImage = (indexToRemove) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  };

  const handleNext = () => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();

    let hasError = false;

    if (!plainText) {
      setContentError('Please write some content for your blog');
      hasError = true;
    } else {
      setContentError('');
    }

    if (images.length === 0) {
      setImageError('Please upload image for your blog');
      hasError = true;
    } else {
      setImageError('');
    }

    if (!hasError) {
      onNext();
    }
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Write your blog content</h2>
      <p className="text-gray-600 mb-6">
        Express your ideas and share your knowledge with the world.
      </p>

      {/* CKEditor */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Blog Content <span className="text-red-500">*</span>
        </label>
        <div className="border rounded-md overflow-hidden text-black">
          <CKEditor
            editor={ClassicEditor}
            data={content}
            onChange={handleContentChange}
            config={{
              toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-500">{charCount}/{maxLength} characters</span>
        </div>
        {contentError && <p className="mt-2 text-sm text-red-500">{contentError}</p>}
      </div>

      {/* Preview Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Images */}
      <div className="mt-8 mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Add Images <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center mb-2">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 transition"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload Images
            </div>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
          <span className="ml-3 text-sm text-gray-500">Upload at least one image</span>
        </div>
        {imageError && <p className="text-sm text-red-500 mt-1">{imageError}</p>}
      </div>

      {/* Navigation */}
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
          Preview
        </button>
      </div>
    </div>
  );
}

export default ContentStep;
