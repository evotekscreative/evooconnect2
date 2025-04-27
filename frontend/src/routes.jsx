import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import App from "./App";
import Connections from "./pages/Connections.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsCondition from "./pages/TermsCondition.jsx";
import Jobs from "./pages/Jobs/index.jsx";
import JobProfile from "./pages/Profile/job-profile.jsx";
import Faq from "./pages/Faq/index.jsx";
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
    element: <IsGuest><Login /></IsGuest>,
  },
  {
    path: "/register",
    element: <IsGuest><Register /></IsGuest>,
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
    path: "/messages",
    element: (
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    ),
  },
  {
    path: "/group-page",
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
    path: "/detail-blog/:id",
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
    element: <PostPage />,
  },
  {
    path: "/verify-email",
    element: <ProtectedRoute><VerifyEmail /></ProtectedRoute>,
  },
  {
    path: "/reset-password",
    element: (
        <ResetPassword />
    )
  }
]);

export default router;
