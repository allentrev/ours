// MainLayout.tsx
import React from 'react';
import Navbar from '../components/Blog/Navbar';
import Footer from '../components/Blog/Footer';

interface MainLayoutProps {
  backgroundImage?: string;
  centerContent?: boolean;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ backgroundImage, centerContent = false, children }) => {
  return (
    <div className="relative text-black min-h-screen flex flex-col">
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            opacity: 0.6,
          }}
        />
      )}
      MainLayout
      {/* NavBar */}
      Navbar
      <Navbar />
      
      {/* Main Content */}
      <main
        className={`
          relative z-10 flex-1
          ${centerContent
            ? 'flex items-center justify-center md:pb-16'
            : 'px-4 py-6 sm:px-6 sm:py-8 md:pb-16'}
        `}
      >
        {children}
      </main>

      {/* Fixed Footer */}
      <div className="md:fixed md:bottom-0 md:left-0 md:w-full z-20">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
