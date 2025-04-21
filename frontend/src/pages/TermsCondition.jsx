import React from 'react';

const TermsCondition = () => {
  return (
    <div>
      {/* Header Section */}
      <div className="bg-blue-600 py-[50px]">
        <div className="container mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-light text-white">
              <span className="font-bold">REGULATIONS </span> AND <span className="font-bold">TERMS </span> OF EVOConnect
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
                  Welcome to EVOConnect! EVOConnect is a platform for job seekers and companies to discover and fill job opportunities managed by Evolusi Kreatif Solusi. This platform is designed to help users connect professionally, build networks, and find job opportunities in a more interactive and dynamic way.
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>Social Media: A space to build professional connections, share insights, and engage with the industry community.</li>
                  <li>Job Portal: A flexible and transparent job search and recruitment system.</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  By using this service, users agree to comply with and be bound by the following terms and conditions. Please read carefully before using our services.
                </p>
              </div>

              {/* Definitions */}
              <div id="definitions" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Definition</h3>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>"User," "You": Refers to individuals or entities using our services, whether as job seekers or companies.</li>
                  <li>"We," "EVOConnect," "Site": Refers to the job portal platform owned and operated by Evolusi Kreatif Solusi.</li>
                  <li>Service: Refers to all features available on the EVOConnect platform, including job search, recruitment, and candidate data management.</li>
                  <li>Personal Data: Refers to any information related to an individual that uses our services, whether as a job seeker or a company.</li>
                </ul>
              </div>

              {/* Registration and User Account */}
              <div id="registration" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Registration and User Account</h3>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>To use our services, users must be at least 18 years old and have the legal capacity to enter into binding agreements.</li>
                  <li>Users must provide accurate, complete, and up-to-date information during the registration process.</li>
                  <li>Users are responsible for maintaining the confidentiality of their account information and password.</li>
                  <li>Users are responsible for all activities that occur under their user account.</li>
                </ul>
              </div>

              {/* Use of Services */}
              <div id="service-usage" className="mb-6">
                <h2 className="text-lg font-semibold text-blue-600 mb-3">Use of Services</h2>
                <h4 className="text-md font-semibold text-blue-600 mb-3">User Obligations</h4>
                <p className="text-gray-700">You agree to:</p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>Use our website only for lawful purposes and in accordance with all applicable laws and regulations.</li>
                  <li>Fully responsible for the content you upload to the platform, including profiles, CVs, documents, posts, and social interactions.</li>
                </ul>

                <h4 className="text-md font-semibold text-blue-600 mt-6 mb-3">Prohibited Uses</h4>
                <p className="text-gray-700">You agree to:</p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>Do not use this service for illegal activities, fraud, or violations of third-party rights.</li>
                  <li>Do not upload content that is discriminatory, misleading, or violates professional ethical standards.</li>
                  <li>Do not infringe on the intellectual property rights of third parties.</li>
                </ul>
              </div>

              {/* Collection and Processing of Personal Data */}
              <div id="data-processing" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Collection and Processing of Personal Data</h3>
                <p className="text-gray-700">
                  Our Privacy Policy explains how we collect, use, and protect your personal information. By using our site, you agree to the terms outlined in our Privacy Policy.
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>EVOConnect collects users' personal data for recruitment purposes, professional networking, and social profile management.</li>
                  <li>The data collected includes name, contact information, work experience, skills, supporting documents, and social interactions within the platform.</li>
                  <li>EVOConnect will seek explicit consent before collecting, processing, or sharing users' data with third parties.</li>
                  <li>Users have the right to withdraw consent or request the deletion of their data.</li>
                </ul>
              </div>

              {/* Privacy */}
              <div id="privacy" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Privacy</h3>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>EVOConnect implements security measures in accordance with Law No. 27 of 2022 on Personal Data Protection.</li>
                  <li>Users' data will not be misused, sold, or shared with third parties without permission.</li>
                  <li>In the event of a data breach or leak, EVOConnect will notify affected users and take mitigation steps in accordance with legal requirements.</li>
                </ul>
              </div>

              {/* Governing Law */}
              <div id="applicable-law" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Governing Law</h3>
                <p className="text-gray-700">
                  These terms and conditions are governed by and construed in accordance with the laws applicable in Indonesia.
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>Any disputes arising will first be resolved through mediation.</li>
                  <li>If no agreement is reached, the resolution will be carried out in accordance with the laws applicable in Indonesia.</li>
                </ul>
              </div>

              {/* Support Contact */}
              <div id="contact" className="mb-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Support Contact</h3>
                <p className="text-gray-700">If you need further assistance, please contact our support team at:</p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li>Email: example@evoconnect.id</li>
                  <li>Operating Hours: Monday - Friday, 09:00 - 17:00 WIB</li>
                </ul>
                <p className="text-gray-700 mt-4">Thank you for choosing EVOConnect!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsCondition;