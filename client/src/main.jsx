/* eslint-disable @typescript-eslint/no-floating-promises */
if (import.meta.env.DEV) {
  import("eruda").then((eruda) => {
    eruda.default.init();
  });
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from "./auth/AuthContext";

import './index.css';
import AppLoader from "./components/AppLoader";

import BlogLayout from './layouts/BlogLayout';

import { ErrorBoundary } from "./components";
import { RouteError } from "./components";

import {
  HomePage,
  AboutPage,
  PostListPage,
  SinglePostPage,
  LoginPage,
  ProfilePage,
  RegisterPage,
  Write,
  AdminPage,
  BlogHomePage,
  FamilyHomePage,
  GalleryHomePage,
  MaintainRefDataPage,
  MaintainGalleryPage,
  NotFoundPage,
} from "./pages";

const queryClient = new QueryClient();

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}


const router = createBrowserRouter([
  { 
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage/> },
      { path: "/login", element: <LoginPage/> },
      { path: "/register", element: <RegisterPage/> },

      { path: "/admin", element: <AdminPage/> },
      { path: "/maintainRefData", element: <MaintainRefDataPage/> },
      { path: "/maintainGallery", element: <MaintainGalleryPage/> },
      


      { path: "/family", element: <FamilyHomePage/> },

      { path: "/gallery", element: <GalleryHomePage/> },

      {
        element: <BlogLayout/>,
        children: [
          { path: "/blog", element: <BlogHomePage/> },
          { path: "/blog/posts", element: <PostListPage/> },
          { path: "/blog/:slug", element: <SinglePostPage/> },
          { path: "blog/write", element: <Write/> },
          { path: "/profile", element: <ProfilePage/> },
        ]
      },

      { path: "*", element: <NotFoundPage/> },
    ]
  }
]);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <AppLoader>
          <HelmetProvider>
            <AuthProvider>
              <ErrorBoundary>
                <RouterProvider router={router}/>
                <ToastContainer position='bottom-right' autoClose={3000} />
              </ErrorBoundary>
            </AuthProvider>
          </HelmetProvider>
        </AppLoader>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>
)
