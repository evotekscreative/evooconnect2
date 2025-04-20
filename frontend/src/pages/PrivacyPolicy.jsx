import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div>
      {/* Header Section */}
      <div className="bg-blue-600 py-[50px]">
        <div className="container mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-light text-white">
              <span className="font-bold">PRIVACY POLICY</span> OF EVOConnect
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Introduction */}
              <div id="intro" className="mb-6">
                <h2 className="text-xl font-semibold text-blue-600 mb-3">Introduction</h2>
                <p className="text-gray-700">
                  EVOConnect respects your privacy and is committed to protecting your personal data. This policy
                  explains how we collect, use, store, and protect users' personal data in accordance with the
                  Personal Data Protection Law No. 27 of 2022.
                </p>
              </div>

              {/* Legal Basis */}
              <div id="legal-basis" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Legal Basis for Data Processing</h3>
                <p className="text-gray-700">We collect and use personal data based on the following principles:</p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>User Consent: Data is collected with the explicit permission of the user.</li>
                  <li>Contract Performance: Data is required to provide job search and recruitment services.</li>
                  <li>Legal Obligations: Data is processed in accordance with applicable legal provisions.</li>
                  <li>Legitimate Interests: EVOConnect may process data to improve its services and user experience.</li>
                </ul>
              </div>

              {/* Data We Collect */}
              <div id="data-collection" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Data We Collect</h3>
                <p className="text-gray-700">
                  We collect personal data provided by users when registering or using EVOConnect services, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Professional profile information (work experience, skills, education, and CV)</li>
                  <li>Content uploaded on EVOConnect social media platforms</li>
                  <li>User activity data within the platform</li>
                </ul>
              </div>

              {/* Purpose of Data Use */}
              <div id="data-usage" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Purpose of Data Use</h3>
                <p className="text-gray-700">We use user personal data to:</p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>Facilitating the job search and recruitment process</li>
                  <li>Managing user interactions in social media features</li>
                  <li>Providing a better user experience with content and job recommendations</li>
                  <li>Improving security and preventing platform abuse</li>
                  <li>Answering questions and support requests</li>
                  <li>Comply with applicable legal obligations</li>
                </ul>
              </div>

              {/* User Obligations */}
              <div id="user-obligations" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">User Obligations</h3>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>Users are responsible for providing accurate and non-misleading information on the Evoconnect platform.</li>
                  <li>Users are required to maintain the confidentiality of their account data and not share their login credentials with any other party.</li>
                  <li>Users are prohibited from uploading content that is discriminatory, misleading, or violates professional ethical norms.</li>
                  <li>Users agree not to misuse other users' personal information obtained through the platform.</li>
                </ul>
              </div>

              {/* User Rights */}
              <div id="user-rights" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">User Rights</h3>
                <p className="text-gray-700">Users have the following rights:</p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>Access, update, or delete their personal data</li>
                  <li>Withdraw consent for data usage</li>
                  <li>Request information on how their data is used</li>
                </ul>
              </div>

              {/* Continue with other sections */}
              {/* Add other sections like Employer Obligations, Data Sharing, Data Protection, etc. */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;