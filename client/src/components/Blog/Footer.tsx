import React from "react";
import { FaFacebookF } from "react-icons/fa";

const Footer: React.FC = () => {
  const wYear = new Date().getFullYear();

  return (
    <footer className="p-4 text-yellow shadow-t">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Left */}
        <div className="text-left w-full sm:w-1/3">
          © Maidenhead Town Bowls Club {wYear}
        </div>

        {/* Right */}
        <div className="text-right w-full sm:w-1/3 flex justify-end">
          <a
            href="https://www.facebook.com/maidenheadtownbowlsclub/?locale=en_GB"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook page"
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition inline-flex items-center justify-center"
          >
            <FaFacebookF size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;