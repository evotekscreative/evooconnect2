import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function PreviewStep({ formData, onSubmit, onPrev, isSubmitting }) {
  const { title, category, content, images, date } = formData;
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="py-7 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {images.length > 0 && (
              <div className="relative overflow-hidden w-full aspect-[4/3]">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image.preview}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover flex-shrink-0"
                    />
                  ))}
                </div>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/70 text-gray-800 rounded-full p-2 shadow hover:bg-white transition"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/70 text-gray-800 rounded-full p-2 shadow hover:bg-white transition"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="p-6">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {category}
              </span>
              <h2 className="text-2xl font-semibold mt-3">{title}</h2>
              <p className="text-xs text-gray-400 mb-4 mt-1">
                Published on: {date}
              </p>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onPrev}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="btn-primary text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition"
            >
              {isSubmitting ? "Publishing..." : "Publish Blog"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewStep;
