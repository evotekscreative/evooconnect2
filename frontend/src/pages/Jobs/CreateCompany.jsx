import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Case from "../../components/Case.jsx";
import CompanyForm from "../../components/CreateCompany/CompanyForm.jsx";
import CompanyPreview from "../../components/CreateCompany/CompanyPreview.jsx";
import Alert from "../../components/Auth/alert";

export default function CreateCompany() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    url: "",
    website: "",
    industry: "",
    size: "",
    type: "",
    tagline: "",
    verified: false,
    logo: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [readyToRenderForm, setReadyToRenderForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Alert state
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const apiUrl =
    import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  const showAlert = (type, message, duration = 5000) => {
    setAlert({
      show: true,
      type,
      message,
    });

    // Clear previous timeout if any
    if (window.alertTimeout) clearTimeout(window.alertTimeout);

    // Auto-hide after duration (default 5 seconds)
    window.alertTimeout = setTimeout(() => {
      hideAlert();
    }, duration);
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, show: false }));
    if (window.alertTimeout) clearTimeout(window.alertTimeout);
  };

  // Fetch submission status
  useEffect(() => {
    const fetchSubmission = async () => {
      const adminToken = localStorage.getItem("adminToken");

      try {
        const statuses = ["pending", "approved", "rejected"];

        for (const status of statuses) {
          const res = await fetch(
            `${apiUrl}/api/admin/company-submissions/status/${status}?limit=1&offset=0`,
            {
              headers: {
                Authorization: `Bearer ${adminToken}`,
              },
            }
          );

          const data = await res.json();
          if (res.ok && data?.submissions?.length > 0) {
            setSubmissionStatus(status);
            return;
          }
        }

        setSubmissionStatus(null); // No submission found
      } catch (error) {
        console.error("Status fetch error:", error);
        showAlert("error", "Failed to fetch submission status");
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchSubmission();
  }, []);

  // Handle redirect after successful creation
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/company-management/company-pending");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  // Trigger delay before form render if status approved or rejected
  useEffect(() => {
    if (submissionStatus === "approved" || submissionStatus === "rejected") {
      const timer = setTimeout(() => {
        setReadyToRenderForm(true);
        setSubmissionStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (submissionStatus === null) {
      setReadyToRenderForm(true);
    }
  }, [submissionStatus]);

  // Reset form
  useEffect(() => {
    if (readyToRenderForm) {
      setForm({
        name: "",
        linkedin_url: "",
        website: "",
        industry: "",
        size: "",
        type: "",
        tagline: "",
        verified: false,
        logo: null,
      });
      setLogoPreview(null);
    }
  }, [readyToRenderForm]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setForm({ ...form, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.verified) {
      showAlert("error", "You must verify that you are authorized.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("error", "Token not found.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("linkedin_url", form.linkedin_url);
      formData.append("website", form.website);
      formData.append("industry", form.industry);
      formData.append("size", form.size);
      formData.append("type", form.type);
      formData.append("tagline", form.tagline);
      if (form.logo) {
        formData.append("logo", form.logo);
      }

      const response = await fetch(`${apiUrl}/api/company/submissions`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        if (data?.data === "You already have a pending company submission") {
          setSubmissionStatus("pending");
          setReadyToRenderForm(false);
          showAlert("error", "You already have a pending company submission.");
          return;
        }
        throw new Error(data.message || `Error: ${response.status}`);
      }

      showAlert("success", "Company submitted successfully!");
      setIsSuccess(true);
      setSubmissionStatus("pending");
      setReadyToRenderForm(false);
    } catch (error) {
      if (error?.message === "You already have a pending company submission") {
        setSubmissionStatus("pending");
        setReadyToRenderForm(false);
        showAlert("error", "You already have a pending company submission.");
        return;
      }
      console.error("Submission error:", error);
      showAlert("error", error.message || "Failed to submit company");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state - shows loading and redirects
  if (isSuccess) {
    return (
      <Case>
        <div className="flex flex-col items-center justify-center h-[75vh] px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Company Submitted Successfully!
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-gray-600">
            Your company submission has been received. You'll be redirected to
            your pending submissions shortly.
          </p>
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Case>
    );
  }

  // Loading status
  if (isLoadingStatus) {
    return (
      <Case>
        <div className="flex items-center justify-center h-[75vh] text-gray-600 font-medium text-lg">
          Checking your submission status...
        </div>
      </Case>
    );
  }

  // Render form
  return (
    <Case>
      {/* Floating Alert */}
      <div className="fixed z-50 top-4 right-4">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={hideAlert}
          isVisible={alert.show}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 bg-gray-100 rounded-lg shadow-inner"
      >
        <div className="flex flex-col max-w-6xl gap-8 mx-auto lg:flex-row">
          <CompanyForm
            form={form}
            logoPreview={logoPreview}
            handleChange={handleChange}
            isSubmitting={isSubmitting}
          />
          <CompanyPreview form={form} logoPreview={logoPreview} />
        </div>
      </form>
    </Case>
  );
}
