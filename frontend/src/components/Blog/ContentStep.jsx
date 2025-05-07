import { useState, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function ContentStep({ content, images, onContentChange, onImagesChange, onNext, onPrev }) {
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleContentChange = (event, editor) => {
    const data = editor.getData();
    onContentChange(data);
    setError('');
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
  
    // Cek validasi gambar
    const invalidFile = files.find(file => !file.type.startsWith('image/'));
    if (invalidFile) {
      setError('Only image files are allowed');
      return;
    }
  
    // Konversi ke base64
    const toBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
    };
  
    const base64Images = await Promise.all(
      files.map(async (file) => {
        const base64 = await toBase64(file);
        return { base64, preview: URL.createObjectURL(file) };
      })
    );
  
    onImagesChange([...images, ...base64Images]);
  };
  
  
  const handleRemoveImage = (indexToRemove) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  };

  const handleNext = () => {
    if (!content.trim()) {
      setError('Please write some content for your blog');
      return;
    }
    onNext();
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Write your blog content</h2>
      <p className="text-gray-600 mb-6">
        Express your ideas and share your knowledge with the world.
      </p>

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
              toolbar: [
                'heading',
                '|',
                'bold',
                'italic',
                'link',
                'bulletedList',
                'numberedList',
                '|',
                'undo',
                'redo',
              ],
            }}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="mt-8 mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Upload Image
        </label>
        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 transition"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload Image
            </div>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
          <span className="ml-3 text-sm text-gray-500">
            Only one image allowed for this blog post
          </span>
        </div>

        {images.length > 0 && (
          <div className="mt-4 relative w-48">
            <img
              src={images[0].preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
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
          Preview
        </button>
      </div>
    </div>
  );
}

export default ContentStep;