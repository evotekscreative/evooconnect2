import { createBrowserRouter } from 'react-router-dom';
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import App from './App';
import Connections from './pages/Connections.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/Login',
    element: <Login />,
  },
  {
    path: '/Register',
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
    element: <Connections/> ,
  }
]);

export default router;