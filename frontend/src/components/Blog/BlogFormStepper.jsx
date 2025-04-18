
function BlogFormStepper({ steps, currentStep }) {
    return (
      <div className="flex justify-between items-center w-full">
        {steps.map((step) => (
          <div key={step.id} className="flex-1 relative">
            {/* Line connector (except for the last step) */}
            {step.id !== steps.length && (
              <div className={`absolute top-1/2 left-1/2 w-full h-0.5 transform -translate-y-1/2 ${
                currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
            )}
            
            <div className="flex flex-col items-center relative z-10">
              {/* Circle indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              
              {/* Step label */}
              <div className={`mt-2 text-sm font-medium ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {step.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  export default BlogFormStepper;