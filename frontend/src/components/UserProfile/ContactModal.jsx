import { Mail, Phone, MapPin, Building, Link2, X, Calendar, User as UserIcon } from "lucide-react";

export default function ContactModal({ show, user, setShowContactModal }) {
  if (!show) return null;

  // Format birthdate (ISO to dd MMM yyyy)
  const formatBirthdate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // WhatsApp redirect
  const getWhatsAppLink = (phone) => {
    if (!phone) return "#";
    // Remove non-digit, add country code if needed
    let num = phone.replace(/[^0-9]/g, "");
    if (num.startsWith("0")) num = "62" + num.slice(1);
    if (!num.startsWith("62")) num = "62" + num;
    return `https://wa.me/${num}`;
  };

  // Google Maps redirect
  const getMapsLink = (location) => {
    if (!location) return "#";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 ease-in-out scale-100">
        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            Contact Information
          </h2>
          <button
            onClick={() => setShowContactModal(false)}
            className="rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-base text-gray-700">
          {/* Contact Details */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-600">
              <Mail size={18} className="text-blue-600" />
              Contact Details
            </h3>
            <div className="space-y-3 pl-6">
              {/* Email */}
              {user?.email ? (
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

              {/* Phone (WhatsApp) */}
              {user?.phone ? (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <a
                    href={getWhatsAppLink(user.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {user.phone} <span className="ml-1"></span>
                  </a>
                </div>
              ) : (
                <p className="text-gray-400">No phone number provided</p>
              )}

              {/* Birthdate */}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  {user?.birthdate
                    ? formatBirthdate(user.birthdate)
                    : <span className="text-gray-400">No birthdate provided</span>}
                </span>
              </div>

              {/* Gender */}
              <div className="flex items-center gap-2">
                <UserIcon size={16} className="text-gray-400" />
                <span>
                  {user?.gender
                    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                    : <span className="text-gray-400">No gender provided</span>}
                </span>
              </div>

              {/* Location (Google Maps) */}
              {user?.location ? (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <a
                    href={getMapsLink(user.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {user.location}
                  </a>
                </div>
              ) : (
                <p className="text-gray-400">No location provided</p>
              )}
            </div>
          </section>

          {/* Professional Details */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-600">
              <Building size={18} className="text-blue-600" />
              Professional Details
            </h3>
            <div className="space-y-3 pl-6">
              {user?.organization ? (
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-gray-400" />
                  <span>{user.organization}</span>
                </div>
              ) : (
                <p className="text-gray-400">No organization provided</p>
              )}

              {user?.website ? (
                <div className="flex items-center gap-2">
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
              ) : (
                <p className="text-gray-400">No website provided</p>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowContactModal(false)}
            className="rounded-md bg-blue-600 px-5 py-2.5 text-base font-medium text-white transition hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}