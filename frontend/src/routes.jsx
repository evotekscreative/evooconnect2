import { createBrowserRouter } from 'react-router-dom';
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import App from './App';
import Connections from './pages/Connections.jsx';
import Groups from './pages/Groups.jsx';
import ListConnection from './pages/ListConnection.jsx';
import { Messages } from './pages/Messages.jsx';
import GroupPage from './pages/GroupPage.jsx';
import Blog from './pages/Blog.jsx';

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
    element: <div>Terms Page</div>,
  },
  {
    path: '/privacy',
    element: <div>Privacy Policy Page</div>,
  },
  {
    path: '/connections',
    element: <Connections />,
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
    path: '/blog',
    element: <Blog />,
  }
]);

export default router;