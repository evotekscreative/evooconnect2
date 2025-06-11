import { X, Mail, Phone, MapPin, Building, Link2 } from "lucide-react";

export default function ProfileContactModal({ show, onClose, user }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl p-8 transition-all duration-300 ease-in-out transform scale-100 bg-white shadow-2xl rounded-2xl">
        <div className="flex items-center justify-between pb-5 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            Contact Information
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 transition rounded-md hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-8 mt-6 text-base text-gray-700 md:grid-cols-2">
          {/* Contact Details */}
          <section>
            <h3 className="flex items-center gap-2 mb-4 text-lg font-medium text-gray-600">
              <Mail size={18} className="text-blue-600" />
              Contact Details
            </h3>
            <div className="pl-6 space-y-3">
              {user.email ? (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <a
                    href={`mailto:${user.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {user.email}
                  </a>
                </div>
              ) : (
                <p className="text-gray-400">No email provided</p>
              )}
              {user.phone ? (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <a
                    href={`tel:${user.phone.replace(/[^0-9]/g, "")}`}
                    className="text-blue-600 hover:underline"
                  >
                    {user.phone}
                  </a>
                </div>
              ) : (
                <p className="text-gray-400">No phone number provided</p>
              )}
              {user.location ? (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{user.location}</span>
                </div>
              ) : (
                <p className="text-gray-400">No location provided</p>
              )}
            </div>
          </section>
          {/* Professional Details */}
          <section>
            <h3 className="flex items-center gap-2 mb-4 text-lg font-medium text-gray-600">
              <Building size={18} className="text-blue-600" />
              Professional Details
            </h3>
            <div className="pl-6 space-y-3">
              {user.organization ? (
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-gray-400" />
                  <span>{user.organization}</span>
                </div>
              ) : (
                <p className="text-gray-400">No organization provided</p>
              )}
              {user.website ? (
                <div className="flex items-center gap-2">
                  <Link2
                    size={16}
                    className="flex-shrink-0 mt-1 text-gray-400"
                  />
                  <a
                    href={
                      user.website.startsWith("http")
                        ? user.website
                        : `https://${user.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 break-all hover:underline"
                  >
                    {user.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              ) : (
                <p className="text-gray-400">No website provided</p>
              )}
            </div>
          </section>
        </div>
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="rounded-md bg-blue-600 px-5 py-2.5 text-base font-medium text-white transition hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}