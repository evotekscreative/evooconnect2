import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import App from "./App";
import Connections from "./pages/Connections.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsCondition from "./pages/TermsCondition.jsx";
import Jobs from "./pages/Jobs/jobs.jsx";
import JobProfile from "./pages/Profile/job-profile.jsx";
import Faq from "./pages/Faq/faq.jsx";
import CompanyProfile from "./pages/Profile/company-profile.jsx";
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
import ProfilePage from "./pages/Profile.jsx";
import ProfileEdit from "./pages/EditProfile.jsx";
import ProtectedRoute from "./components/Auth/ProtectedRoute.jsx";
import VerifyEmail from "./pages/Auth/VerifyEmail.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import IsGuest from "./components/Auth/IsGuest.jsx";
import SinglePost from "./pages/SinglePost.jsx";
import UserProfile from "./pages/userProfile.jsx";
import UserPostPage from "./pages/UserPostPage.jsx";
import MemberList from "./pages/MemberList.jsx";
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
import CompanyCards from "./pages/CompanyCards.jsx";

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
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit-profile",
    element: (
      <ProtectedRoute>
        <ProfileEdit />
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
    path: "/company-profile/:companyId",
    element: (
      <ProtectedRoute>
        <CompanyProfile />
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
    path: "/post/:postId",
    element: <SinglePost />,
  },
  // Company-related routes
  {
    path: "/create-company",
    element: (
      <ProtectedRoute>
        <CreateCompany />
      </ProtectedRoute>
    ),
  },
  {
    path: "/create-company/status",
    element: (
      <ProtectedRoute>
        <CreateCompanyStatus />
      </ProtectedRoute>
    ),
  },
  {
    path: "/company-cards",
    element: (
      <ProtectedRoute>
        <CompanyCards />
      </ProtectedRoute>
    ),
  },
  // Admin routes
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
      }
    ],
  }
]);

export default router;