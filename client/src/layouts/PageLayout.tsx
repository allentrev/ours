import React, { ReactNode } from 'react';
import pageBackground from '../assets/green1.jpg';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen bg-cover bg-center text-black"
      style={{ backgroundImage: `url(${pageBackground})` }}
    >
      PageLayout
      <div className="bg-gray-400 max-w-5xl mx-auto px-4 py-8 shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
