import { useState } from "react";
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
    const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

    try {
        // Cek apakah sudah ada submission
        const checkRes = await fetch(`${apiUrl}/api/company/submissions/my`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!checkRes.ok) {
            const err = await checkRes.json();
            throw new Error(err.message || "Failed to check existing submission");
        }

        const existingSubmissions = await checkRes.json();
        if (Array.isArray(existingSubmissions) && existingSubmissions.length > 0) {
            const pending = existingSubmissions.find(
                (sub) => sub.status === "PENDING"
            );

            if (pending) {
                toast.error("You already have a pending company submission.");
                return;
            }
        }

        setIsSubmitting(true);

        // Submit Form
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("linkedin_url", form.url);
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
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log("API Response:", data);

        if (!response.ok) {
            throw new Error(data.message || `Error: ${response.status} ${response.statusText}`);
        }

        toast.success("Company submitted successfully!");
        navigate("/create-company/status");

    } catch (error) {
        console.error("Submission error:", error);
        toast.error(error.message || "Failed to submit company");
    } finally {
        setIsSubmitting(false);
    }
};

    return (
        <Case>
            <form onSubmit={handleSubmit} className="bg-gray-100 p-6">
                <div className="max-w-6xl mx-auto flex gap-8">
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