import { X, Mail, User, Calendar, Phone, MapPin, Building, Link2 } from "lucide-react";

export default function ProfileContactModal({ user, show, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-2 sm:mx-0 transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 ease-in-out scale-100">
        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            Contact Information
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-base text-gray-700 overflow-x-auto">
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-600">
              <Mail size={18} className="text-blue-600" />
              Contact Details
            </h3>
            <div className="space-y-3 pl-6">
              {user.gender && (
                <div className="flex items-center gap-2 break-all">
                  <User size={16} className="text-gray-400" />
                  <span className="break-all">{user.gender}</span>
                </div>
              )}
              {user.birthdate && (
                <div className="flex items-center gap-2 break-all">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="break-all">{user.birthdate}</span>
                </div>
              )}
              {user.email && (
                <div className="flex items-center gap-2 break-all">
                  <Mail size={16} className="text-gray-400" />
                  <a
                    href={`mailto:${user.email}`}
                    className="text-blue-600 hover:underline break-all"
                  >
                    {user.email}
                  </a>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 break-all">
                  <Phone size={16} className="text-gray-400" />
                  <a
                    href={`https://wa.me/${user.phone.replace(/^0/, "62").replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {user.phone}
                  </a>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2 break-all">
                  <MapPin size={16} className="text-gray-400" />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {user.location}
                  </a>
                </div>
              )}
            </div>
          </section>
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-600">
              <Building size={16} className="text-blue-600" />
              Professional Details
            </h3>
            <div className="space-y-3 pl-6">
              {user.organization && (
                <div className="flex items-center gap-2 break-all">
                  <Building size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <span className="break-all">{user.organization}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-2 break-all">
                  <Link2
                    size={16}
                    className="text-gray-400 mt-1 flex-shrink-0"
                  />
                  <a
                    href={
                      user.website.startsWith("http")
                        ? user.website
                        : `https://${user.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {user.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
        <div className="mt-8 flex justify-end">
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