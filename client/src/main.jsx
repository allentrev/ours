import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';
import PostListPage from './pages/PostListPage';
import SinglePostPage from './pages/SinglePostPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Write from './pages/Write';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}


const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/posts",
        element: <PostListPage/>
      },
      {
        path: "/register",
        element: <RegisterPage/>
      },
      {
        path: "/write",
        element: <Write/>
      },
      {
        path: "/login",
        element: <LoginPage/>
      },
      {
        path: "/:slug",
        element: <SinglePostPage/>
      },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
        <ToastContainer position='bottom-right'/>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>
)
