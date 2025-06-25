import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Case from "../components/Case";
import GroupsHeader from "../components/Group/GroupsHeader";
import GroupsTabs from "../components/Group/GroupsTabs";
import GroupsContent from "../components/Group/GroupsContent";
import GroupsSidebar from "../components/Group/GroupsSidebar";
import CreateGroupModal from "../components/Group/CreateGroupModal";
import Alert from "../components/Auth/alert";

const base_url =
  import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000";

export default function Groups() {
  const { groupId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("myGroups");
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    rule: "",
    privacy_level: "public",
    invite_policy: "admin",
    post_approval: false, // Add this line
    image: null,
  });

  const [adminGroups, setAdminGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const [allGroups, setAllGroups] = useState([]);
  const [loadingAllGroups, setLoadingAllGroups] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0,
  });

  const fetchAllGroups = async (limit = 10, offset = 0) => {
    try {
      setLoadingAllGroups(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${base_url}/api/groups?limit=${limit}&offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAllGroups(response.data.data || []);
      setPagination({
        limit: response.data.limit || limit,
        offset: response.data.offset || offset,
        total: response.data.total || 0,
      });
    } catch (error) {
      console.error("Failed to fetch all groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setLoadingAllGroups(false);
    }
  };

  useEffect(() => {
    if (activeTab === "allGroups") {
      fetchAllGroups();
    }
  }, [activeTab]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ ...alert, show: false }), 5000);
  };

  const fetchGroupsData = async () => {
    try {
      const token = localStorage.getItem("token");
      setIsLoading(true);

      const adminResponse = await axios.get(`${base_url}/api/my-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const joinedGroupsResponse = await axios.get(
        `${base_url}/api/my-joined-groups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const adminGroupsData = Array.isArray(adminResponse.data.data)
        ? adminResponse.data.data.map((group) => ({
            ...group,
            isAdmin: true,
            createdDate: group.created_at
              ? group.created_at.split("T")[0]
              : new Date().toISOString().split("T")[0],
          }))
        : [];

      const adminGroupIds = adminGroupsData.map((group) => group.id);

      const joinedGroupsData = Array.isArray(joinedGroupsResponse.data.data)
        ? joinedGroupsResponse.data.data
            .filter((group) => !adminGroupIds.includes(group.id))
            .map((group) => ({
              ...group,
              isAdmin: false,
              joinedDate: group.joined_at
                ? group.joined_at.split("T")[0]
                : new Date().toISOString().split("T")[0],
            }))
        : [];

      setAdminGroups(adminGroupsData);
      setJoinedGroups(joinedGroupsData);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedGroups = async () => {
    try {
      setLoadingSuggestions(true);
      const token = localStorage.getItem("token");

      const allGroupsResponse = await axios.get(`${base_url}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const adminResponse = await axios.get(`${base_url}/api/my-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const adminGroupIds = Array.isArray(adminResponse.data.data)
        ? adminResponse.data.data.map((g) => g.id)
        : [];

      const joinedResponse = await axios.get(
        `${base_url}/api/my-joined-groups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const joinedGroupIds = Array.isArray(joinedResponse.data.data)
        ? joinedResponse.data.data.map((g) => g.id)
        : [];

      // Tambahkan pengecekan null di sini
      const filteredSuggestions = (allGroupsResponse.data.data || []).filter(
        (group) =>
          group.privacy_level === "public" &&
          !adminGroupIds.includes(group.id) &&
          !joinedGroupIds.includes(group.id)
      );

      let randomSuggestions =
        filteredSuggestions.length <= 3
          ? filteredSuggestions
          : filteredSuggestions.sort(() => 0.5 - Math.random()).slice(0, 3);

      setSuggestedGroups(randomSuggestions);
    } catch (error) {
      console.error("Failed to fetch suggested groups:", error);
      setSuggestedGroups([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const fetchMyInvitations = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoadingInvitations(true);

      const response = await axios.get(`${base_url}/api/my-invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInvitations(response.data.data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast.error("Failed to load invitations.");
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGroupForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setGroupForm((prev) => ({ ...prev, image: file }));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", groupForm.name);
      formData.append("description", groupForm.description);
      formData.append("rule", groupForm.rule);
      formData.append("privacy_level", groupForm.privacy_level);
      formData.append("invite_policy", groupForm.invite_policy);
      formData.append("post_approval", groupForm.post_approval);
      formData.append("photo", groupForm.image);

      const response = await axios.post(`${base_url}/api/groups`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const newGroup = {
        ...response.data.data,
        isAdmin: true,
        createdDate: new Date().toISOString().split("T")[0],
        members_count: 1,
      };
      setAdminGroups((prev) => [newGroup, ...prev]);
      toast.success("Group created successfully!");

      setGroupForm({
        name: "",
        description: "",
        rule: "",
        privacy_level: "public",
        invite_policy: "admin",
        post_approval: false, // Reset post approval
        image: null,
      });
      setShowModal(false);
      showAlert("success", "Group created successfully.");
    } catch (error) {
      console.error("Failed to connect:", error);
      showAlert("error", "Failed to create group.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${base_url}/api/invitations/${invitationId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "accepted" } : inv
        )
      );

      fetchGroupsData();
      toast.success("Invitation accepted successfully!");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error(
        error.response?.data?.message || "Failed to accept invitation."
      );
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${base_url}/api/invitations/${invitationId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "rejected" } : inv
        )
      );

      toast.success("Invitation rejected successfully!");
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      toast.error(
        error.response?.data?.message || "Failed to reject invitation."
      );
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${base_url}/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminGroups(adminGroups.filter((group) => group.id !== groupId));
        showAlert("success", "Group deleted successfully.");
      } catch (error) {
        console.error("Failed to connect:", error);
        showAlert("error", "Failed to delete group.");
      }
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${base_url}/api/groups/${groupId}/leave`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setJoinedGroups(joinedGroups.filter((group) => group.id !== groupId));
        showAlert("success", "You have left the group successfully.");
      } catch (error) {
        console.error("Failed to leave group:", error);
        showAlert("error", "Failed to leave group.");
      }
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      const joinResponse = await axios.post(
        `${base_url}/api/groups/${groupId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const groupResponse = await axios.get(
        `${base_url}/api/groups/${groupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const joinedGroupData = groupResponse.data.data;
      if (joinedGroupData) {
        const groupWithJoinedDate = {
          ...joinedGroupData,
          isAdmin: false,
          joined_at: new Date().toISOString(),
          joinedDate: new Date().toISOString().split("T")[0],
        };

        setJoinedGroups((prev) => [groupWithJoinedDate, ...prev]);
        setSuggestedGroups((prev) =>
          prev.filter((group) => group.id !== groupId)
        );
      }
      showAlert("success", "You have joined the group successfully.");
    } catch (error) {
      console.error("Failed to connect:", error);
      showAlert("error", "Failed to join group.");
    }
  };

  useEffect(() => {
    fetchGroupsData();
    fetchMyInvitations();
  }, []);

  useEffect(() => {
    fetchSuggestedGroups();
  }, [adminGroups, joinedGroups]);

  return (
    <Case>
      <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
        <div className="grid max-w-6xl grid-cols-1 gap-4 mx-auto mb-10 lg:grid-cols-4 sm:gap-6">
          {alert.show && (
            <div className="fixed z-50 w-full max-w-sm top-4 right-4">
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert({ ...alert, show: false })}
              />
            </div>
          )}
          {/* Main Content */}
          <div className="p-4 space-y-4 bg-white shadow lg:col-span-3 rounded-xl sm:p-6">
            <GroupsHeader navigate={navigate} setShowModal={setShowModal} />

            <GroupsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <GroupsContent
              activeTab={activeTab}
              adminGroups={adminGroups}
              joinedGroups={joinedGroups}
              invitations={invitations}
              loadingInvitations={loadingInvitations}
              handleDeleteGroup={handleDeleteGroup}
              handleLeaveGroup={handleLeaveGroup}
              handleAcceptInvitation={handleAcceptInvitation}
              handleRejectInvitation={handleRejectInvitation}
              allGroups={allGroups}
              loadingAllGroups={loadingAllGroups}
              pagination={pagination}
              fetchAllGroups={fetchAllGroups}
            />
          </div>

          {/* Sidebar */}
          <GroupsSidebar
            adminGroups={adminGroups}
            joinedGroups={joinedGroups}
            suggestedGroups={suggestedGroups}
            loadingSuggestions={loadingSuggestions}
            handleJoinGroup={handleJoinGroup}
            base_url={base_url}
            fetchSuggestedGroups={fetchSuggestedGroups} // Add this prop
          />
        </div>

        {/* Create Group Modal */}
        <CreateGroupModal
          showModal={showModal}
          setShowModal={setShowModal}
          groupForm={groupForm}
          error={error}
          isLoading={isLoading}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          handleCreateGroup={handleCreateGroup}
        />
      </div>
    </Case>
  );
}
