import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import App from "./App";
import Connections from "./pages/Connections.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsCondition from "./pages/TermsCondition.jsx";
import Jobs from "./pages/Jobs/jobs.jsx";
import JobProfile from "./pages/company-profile/JobProfile.jsx";
import Faq from "./pages/Faq/faq.jsx";
import Groups from "./pages/Groups.jsx";
import CreateBlog from "./pages/Blog/CreateBlog.jsx";
import BlogDetail from "./pages/Blog/BlogDetail.jsx";
import ListConnection from "./pages/ListConnection.jsx";
import { Messages } from "./pages/Messages.jsx";
import GroupPage from "./pages/GroupPage.jsx";
import Blog from "./pages/Blog/Blog.jsx";
import Notification from "./pages/Notification.jsx";
import PostPage from "./pages/PostPage.jsx";
import JobDashboard from "./pages/JobSaved.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import EditProfile from "./pages/Profile/EditProfile.jsx";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";
import VerifyEmail from "./pages/Auth/VerifyEmail.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import IsGuest from "./components/Auth/IsGuest.jsx";
import SinglePost from "./pages/SinglePost.jsx";
import UserProfile from "./pages/Profile/UserProfile.jsx";
import UserPostPage from "./pages/UserPostPage.jsx";
import MemberList from "./pages/MemberList.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import ApprovePost from "./pages/ApprovePost.jsx";
import CreateCompany from "./pages/Jobs/CreateCompany.jsx";
import UserListConnection from "./pages/UserListConnection.jsx";
import LoginAdmin from "./pages/Admin/AuthAdmin/LoginAdmin.jsx";
import Dashboard from "./pages/Admin/Admin1/Dashboard.jsx";
import Settings from "./pages/Admin/Admin1/Settings.jsx";
import Tables from "./pages/Admin/Admin1/Tables.jsx";
import ProtectedAdminRoute from "./components/Auth/ProtectedAdminRoute.jsx";

import ListCompany from "./pages/Admin/Admin1/ListCompany.jsx";
import ReportPage from "./pages/Admin/Admin1/Index.jsx";
import ReportUser from "./pages/Admin/Report/ReportUser.jsx";

import CreateCompanyStatus from "./pages/CreateCompanyStatus.jsx";
import CompanyDetail from "./pages/CompanyCard/CompanyDetail.jsx";
import MyCompanies from "./pages/CompanyCard/MyCompanies.jsx";
import CompanyPending from "./pages/CompanyCard/CompanyPending.jsx";
import CompanyEdit from "./pages/CompanyCard/CompanyEdit.jsx";
import CompanyEditRequest from "./pages/Admin/Admin1/ListEditRequest.jsx";

import CompanyDashboard from "./pages/CompanyDashboard/CompanyDashboard.jsx";
import ManagePost from "./pages/CompanyDashboard/ManagePost.jsx";
import ManageVacancy from "./pages/CompanyDashboard/ManageVacancy.jsx";
import CompanySetting from "./pages/CompanyDashboard/CompanySetting.jsx";
import ListApplicants from "./pages/CompanyDashboard/ListApplicants/ListApplicants.jsx";
import ManageMember from "./pages/CompanyDashboard/ManageMember.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <IsGuest>
        <Login />
      </IsGuest>
    ),
  },
  {
    path: "/register",
    element: (
      <IsGuest>
        <Register />
      </IsGuest>
    ),
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },

  {
    path: "/terms",
    element: <TermsCondition />,
  },
  {
    path: "/privacy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/connections",
    element: (
      <ProtectedRoute>
        <Connections />
      </ProtectedRoute>
    ),
  },

  {
    path: "/jobs",
    element: (
      <ProtectedRoute>
        <Jobs />
      </ProtectedRoute>
    ),
  },

  {
    path: "/jobs/:jobId",
    element: (
      <ProtectedRoute>
        <JobProfile />
      </ProtectedRoute>
    ),
  },

  {
    path: "/job-saved",
    element: (
      <ProtectedRoute>
        <JobDashboard />
      </ProtectedRoute>
    ),
  },

  // {
  //   path: "/help",
  //   element: (
  //     <ProtectedRoute>
  //       <HelpPage />
  //     </ProtectedRoute>
  //   ),
  // },

  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },

  {
    path: "/edit-profile",
    element: (
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    ),
  },

  {
    path: "/faq",
    element: (
      <ProtectedRoute>
        <Faq />
      </ProtectedRoute>
    ),
  },
  {
    path: "/groups",
    element: (
      <ProtectedRoute>
        <Groups />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-connection",
    element: (
      <ProtectedRoute>
        <ListConnection />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-connection/:username",
    element: (
      <ProtectedRoute>
        <UserListConnection />
      </ProtectedRoute>
    ),
  },
  {
    path: "/list-connection/:username",
    element: (
      <ProtectedRoute>
        <UserListConnection />
      </ProtectedRoute>
    ),
  },
  {
    path: "/messages",
    element: (
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: "/messages/:conversationId",
    element: (
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: "/groups/:groupId",
    element: (
      <ProtectedRoute>
        <GroupPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-blog",
    element: (
      <ProtectedRoute>
        <CreateBlog />
      </ProtectedRoute>
    ),
  },
  {
    path: "/blog",
    element: (
      <ProtectedRoute>
        <Blog />
      </ProtectedRoute>
    ),
  },
  {
    path: "/blog-detail/:slug",
    element: (
      <ProtectedRoute>
        <BlogDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notification",
    element: (
      <ProtectedRoute>
        <Notification />
      </ProtectedRoute>
    ),
  },
  {
    path: "/post-page",
    element: (
      <ProtectedRoute>
        <PostPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/post-page/:username",
    element: (
      <ProtectedRoute>
        <UserPostPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/post-page/:username",
    element: (
      <ProtectedRoute>
        <UserPostPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <ProtectedRoute>
        <VerifyEmail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/user-profile/:username",
    element: (
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/groups/:groupId/members",
    element: (
      <ProtectedRoute>
        <MemberList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/search",
    element: (
      <ProtectedRoute>
        <SearchResults />
      </ProtectedRoute>
    ),
  },
  {
    path: "/post/:postId",
    element: <SinglePost />,
  },
  {
    path: "groups/:groupId/approve-posts",
    element: (
      <ProtectedRoute>
        <ApprovePost />
      </ProtectedRoute>
    ),
  },

  {
    path: "/create-company",
    element: (
      <ProtectedRoute>
        <CreateCompany />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login-admin",
    element: <LoginAdmin />,
  },
  {
    path: "/admin",
    element: <ProtectedAdminRoute />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "tables",
        element: <Tables />,
      },
      {
        path: "report",
        element: <ReportPage />,
      },
      {
        path: "report-user",
        element: <ReportUser />,
      },
      {
        path: "list-company",
        element: <ListCompany />,
      },
      {
        path: "create-company",
        element: <CreateCompany />,
      },
    ],
  },

  {
    path: "/company-status",
    element: <CreateCompanyStatus />,
  },

  {
    path: "company-detail/:company_id",
    element: (
      <ProtectedRoute>
        <CompanyDetail />,
      </ProtectedRoute>
    ),
  },
  {
    path: "/company-management",
    children: [
      {
        path: "my-company",
        element: <MyCompanies />,
      },
      {
        path: "company-pending",
        element: <CompanyPending />,
      },
      {
        path: "company-edit",
        element: <CompanyEdit />,
      },
      {
        path: "company-edit-request",
        element: <CompanyEditRequest />,
      },
    ],
  },
  {
    path: "/company-dashboard",
    children: [
      {
        path: ":company_id",
        element: <CompanyDashboard />,
      },
      {
        path: "manage-post",
        element: <ManagePost />,
      },
      {
        path: "manage-vacancy",
        element: <ManageVacancy />,
      },
      {
        path: "company-setting",
        element: <CompanySetting />,
      },
      {
        path: "list-applicants",
        element: <ListApplicants />,
      },
    ],
  },
  {
    path: "/company-dashboard/manage-member/:company_id",
    element: <ManageMember />,
  },
]);

export default router;
