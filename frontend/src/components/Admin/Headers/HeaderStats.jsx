import React, { useState, useEffect } from "react";
import {
  ChartColumn,
  ChartPie,
  Users,
  Percent,
  Building,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

// components
import CardStats from "../../../components/Admin/Cards/CardStats.jsx";

export default function HeaderStats() {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await fetch(`${apiUrl}/api/admin/company-submissions/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.data) {
          setStats({
            total: data.data.total || 0,
            approved: data.data.approved || 0,
            rejected: data.data.rejected || 0,
            pending: data.data.pending || 0
          });
        }
      } catch (error) {
        console.error("Error fetching company stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [apiUrl]);

  return (
    <>
      {/* Header */}
      <div className="relative bg-primary md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="TOTAL SUBMISSIONS"
                  statTitle={isLoading ? "Loading..." : stats.total.toString()}
                  statArrow="up"
                  statPercent=""
                  statPercentColor="text-emerald-500"
                  statDescripiron="Company submissions"
                  statIconName={<Building className="w-5 h-5 text-white" />}
                  statIconColor="bg-blue-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="APPROVED"
                  statTitle={isLoading ? "Loading..." : stats.approved.toString()}
                  statArrow="up"
                  statPercent=""
                  statPercentColor="text-emerald-500"
                  statDescripiron="Approved submissions"
                  statIconName={<CheckCircle className="w-5 h-5 text-white" />}
                  statIconColor="bg-green-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="REJECTED"
                  statTitle={isLoading ? "Loading..." : stats.rejected.toString()}
                  statArrow=""
                  statPercent=""
                  statPercentColor="text-red-500"
                  statDescripiron="Rejected submissions"
                  statIconName={<XCircle className="w-5 h-5 text-white" />}
                  statIconColor="bg-red-500"
                />
              </div>
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle="PENDING"
                  statTitle={isLoading ? "Loading..." : stats.pending.toString()}
                  statArrow=""
                  statPercent=""
                  statPercentColor="text-orange-500"
                  statDescripiron="Awaiting review"
                  statIconName={<Clock className="w-5 h-5 text-white" />}
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
