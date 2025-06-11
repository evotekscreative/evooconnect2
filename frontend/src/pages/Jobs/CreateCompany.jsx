import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Case from "../../components/Case.jsx";
import CompanyForm from "../../components/CreateCompany/CompanyForm.jsx";
import CompanyPreview from "../../components/CreateCompany/CompanyPreview.jsx";
import { toast } from "react-toastify";

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

  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  // Fetch submission status
  useEffect(() => {
    const fetchSubmission = async () => {
      const adminToken = localStorage.getItem("adminToken");

      if (!adminToken) {
        toast.error("Admin token not found.");
        return;
      }

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
        toast.error("Failed to fetch submission status");
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
        navigate('/company-management/company-pending'); 
      }, 3000); // 3 seconds delay before redirect
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  // Trigger delay before form render if status approved or rejected
  useEffect(() => {
    if (submissionStatus === "approved" || submissionStatus === "rejected") {
      const timer = setTimeout(() => {
        setReadyToRenderForm(true);
        setSubmissionStatus(null); // reset to allow fresh form submission
      }, 3000);
      return () => clearTimeout(timer);
    } else if (submissionStatus === null) {
      setReadyToRenderForm(true); // No submission, form is ready
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
      toast.error("You must verify that you are authorized.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token not found.");
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
        throw new Error(data.message || `Error: ${response.status}`);
      }

      toast.success("Company submitted successfully!");
      setIsSuccess(true);
      setSubmissionStatus("pending");
      setReadyToRenderForm(false);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit company");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state - shows loading and redirects
  if (isSuccess) {
    return (
      <Case>
        <div className="flex flex-col items-center justify-center h-[75vh] px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Company Submitted Successfully!</h2>
          <p className="text-gray-600 max-w-xl text-base leading-relaxed">
            Your company submission has been received. You'll be redirected to your pending submissions shortly.
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

  // Show pending status
  if (submissionStatus === "pending") {
    return (
      <Case>
        <div className="flex flex-col items-center justify-center h-[75vh] px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Company Submission Is Still Under Review</h2>
          <p className="text-gray-600 max-w-xl text-base leading-relaxed">
            Your company submission is currently being reviewed by our team. Please wait until it's either approved or rejected before creating a new submission.
          </p>
          <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md px-5 py-3 shadow-md text-sm">
            <strong>Status:</strong> Pending
          </div>
        </div>
      </Case>
    );
  }

  // Render form
  return (
    <Case>
      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded-lg shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
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