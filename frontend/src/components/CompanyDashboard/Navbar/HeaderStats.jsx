import React, { useState, useEffect } from "react";
import { FileText, Briefcase, Users, UserCheck } from "lucide-react";
import { useParams } from "react-router-dom";

// components
import CardStats from "../../../components/CompanyDashboard/Navbar/CardStats.jsx";

export default function HeaderStats() {
  const { company_id } = useParams();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalVacancies: 0,
    totalMembers: 0,
    totalApplicants: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyStats = async () => {
      if (!company_id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const apiUrl =
          import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

        const response = await fetch(
          `${apiUrl}/api/companies/${company_id}/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.code === 200 && data.data) {
            setStats({
              totalPosts: data.data.total_posts || 0,
              totalVacancies: data.data.total_job_vacancies || 0,
              totalMembers: data.data.total_members || 0,
              totalApplicants: data.data.total_applicants || 0,
            });
          }
        } else {
          console.error("Failed to fetch company stats");
        }
      } catch (error) {
        console.error("Error fetching company stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyStats();
  }, [company_id]);

  return (
    <>
      {/* Header */}
      <div className="relative bg-primary md:pt-[4rem] pb-[4rem] pt-12">
        <div className="w-full px-4 mx-auto md:px-10">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap">
              <div className="w-full px-4 lg:w-6/12 xl:w-3/12">
                <CardStats
                  statSubtitle="TOTAL POSTS"
                  statTitle={
                    loading ? "Loading..." : stats.totalPosts.toString()
                  }
                  statArrow="up"
                  statPercent="8.2"
                  statPercentColor="text-emerald-500"
                  statDescripiron="Since last month"
                  statIconName={<FileText className="w-5 h-5 text-white" />}
                  statIconColor="bg-blue-500"
                />
              </div>
              <div className="w-full px-4 lg:w-6/12 xl:w-3/12">
                <CardStats
                  statSubtitle="JOB VACANCIES"
                  statTitle={
                    loading ? "Loading..." : stats.totalVacancies.toString()
                  }
                  statArrow="up"
                  statPercent="5.7"
                  statPercentColor="text-emerald-500"
                  statDescripiron="Since last week"
                  statIconName={<Briefcase className="w-5 h-5 text-white" />}
                  statIconColor="bg-green-500"
                />
              </div>
              <div className="w-full px-4 lg:w-6/12 xl:w-3/12">
                <CardStats
                  statSubtitle="COMPANY MEMBERS"
                  statTitle={
                    loading ? "Loading..." : stats.totalMembers.toString()
                  }
                  statArrow="up"
                  statPercent="2.3"
                  statPercentColor="text-emerald-500"
                  statDescripiron="Since yesterday"
                  statIconName={<Users className="w-5 h-5 text-white" />}
                  statIconColor="bg-purple-500"
                />
              </div>
              <div className="w-full px-4 lg:w-6/12 xl:w-3/12">
                <CardStats
                  statSubtitle="TOTAL APPLICANTS"
                  statTitle={
                    loading ? "Loading..." : stats.totalApplicants.toString()
                  }
                  statArrow="up"
                  statPercent="15.6"
                  statPercentColor="text-emerald-500"
                  statDescripiron="Since last month"
                  statIconName={<UserCheck className="w-5 h-5 text-white" />}
                  statIconColor="bg-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
