import { useState } from "react";
import Case from "../../components/Case.jsx";
import CompanyForm from "../../components/CreateCompany/CompanyForm.jsx";
import CompanyPreview from "../../components/CreateCompany/CompanyPreview.jsx";

export default function CreateCompany() {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.verified) {
            alert("You must verify that you are authorized.");
            return;
        }
        console.log("Submitted data:", form);
    };

    return (
        <Case>
            <form onSubmit={handleSubmit} className="bg-gray-100 p-6">
                <div className="max-w-6xl mx-auto flex gap-8">
                    <CompanyForm form={form} logoPreview={logoPreview} handleChange={handleChange} />
                    <CompanyPreview form={form} logoPreview={logoPreview} />
                </div>
            </form>
        </Case>
    );
}
