import { createBrowserRouter } from 'react-router-dom';
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import App from './App';
import Connections from './pages/Connections.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsCondition from './pages/TermsCondition.jsx';
import Jobs from './pages/Jobs/index.jsx';
import JobProfile from './pages/Profile/job-profile.jsx';
import Faq from './pages/Faq/index.jsx';
import CompanyProfile from "./pages/Profile/company-profile.jsx"
import Groups from './pages/Groups.jsx';
import CreateBlog from './pages/Blog/CreateBlog.jsx';
import BlogDetail from './pages/Blog/BlogDetail.jsx';
import ListConnection from './pages/ListConnection.jsx';
import { Messages } from './pages/Messages.jsx';
import GroupPage from './pages/GroupPage.jsx';
import Blog from "./pages/Blog/Blog.jsx";
import Notification from './pages/Notification.jsx';
import JobDashboard from './pages/JobSaved.jsx';
import HelpPage from './pages/Help.jsx';
import ProfilePage from './pages/Profile.jsx';
import ProfileEdit from './pages/EditProfile.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <div>Forgot Password Page</div>,
  },
  {
    path: '/terms',
    element: <TermsCondition />,
  },
  {
    path: '/privacy',
    element: <PrivacyPolicy />,
  },
  {
    path: '/connections',
    element: <Connections />,
  },

  {
    path: '/jobs',
    element: <Jobs />,
  },

  {
    path: '/jobs/:jobId',
    element: <JobProfile />,
  },

  {
    path: '/job-saved',
    element: <JobDashboard />,
  },

  {
    path: '/help',
    element: <HelpPage/>,
  },

  {
    path: '/profile',
    element: <ProfilePage />,
  },

  {
    path: '/edit-profile',
    element: <ProfileEdit />,
  },

  {
    path: '/faq',
    element: <Faq />,
  },
  {
    path: '/company-profile',
    element: <CompanyProfile />,
  },
  {
    path: '/groups',
    element: <Groups />
  },
  {
    path: '/list-connection',
    element: <ListConnection />,
  },
  {
    path: '/messages',
    element: <Messages />,
  },
  {
    path: '/group-page',
    element: <GroupPage />,
  },
  {
    path: '/create-blog',
    element: <CreateBlog />,
  },
  {
    path: '/blog',
    element: <Blog />,
  },
  {
    path: '/detail-blog/:id',
    element: <BlogDetail />,
  },
  {
    path: '/notification',
    element: <Notification />,
  },
]);

export default router;