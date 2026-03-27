import React  from 'react';
import { Link } from "react-router-dom";

import SEO from '../components/SEO';


// import homeBackground from '../assets/Home_2.jpg'; //
import blogImg from "../assets/jan_yoneko.jpg";
import familyImg from "../assets/jan_yoneko.jpg";
import galleryImg from "../assets/jan_yoneko.jpg";
import adminImg from "../assets/jan_yoneko.jpg";


const HomePage: React.FC = () => {

  return (
    <div className="flex flex-col">
      <SEO
        title="HomePage – OurSingapore"
        description="My personal web site's home page"
      />
      {/* ---------- Header ---------- */}
      <header className="bg-gray-900 text-white px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Title */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">
              Welcome to My Personal Website
            </h1>
            <p className="text-gray-300 mt-2">
              Writing, memories, and photography.
            </p>
          </div>

          {/* About Me button */}
          <Link
            to="/about"
            className="px-6 py-2 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-200 transition"
          >
            About Me
          </Link>

        </div>
      </header>

      {/* ---------- Main Sections ---------- */}
      <main className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">

          {/* ---------- Blog ---------- */}
          <section className="bg-blue-100 rounded-2xl p-6 text-center flex flex-col items-center">
            <img
              src={blogImg}
              alt="Blog"
              className="w-32 h-32 object-cover rounded-xl shadow mb-4"
            />
            <h2 className="text-xl font-bold mb-2">Blog</h2>
            <p className="text-gray-700 mb-4 text-sm">
              Thoughts, stories, and reflections.
            </p>
            <Link
              to="/blog"
              className="text-blue-700 font-semibold hover:underline mt-auto"
            >
              →
            </Link>
          </section>

          {/* ---------- Family ---------- */}
          <section className="bg-green-100 rounded-2xl p-6 text-center flex flex-col items-center">
            <img
              src={familyImg}
              alt="Family"
              className="w-32 h-32 object-cover rounded-xl shadow mb-4"
            />
            <h2 className="text-xl font-bold mb-2">Family</h2>
            <p className="text-gray-700 mb-4 text-sm">
              Moments and memories with family.
            </p>
            <Link
              to="/family"
              className="text-green-700 font-semibold hover:underline mt-auto"
            >
              →
            </Link>
          </section>

          {/* ---------- Gallery ---------- */}
          <section className="bg-purple-100 rounded-2xl p-6 text-center flex flex-col items-center">
            <img
              src={galleryImg}
              alt="Gallery"
              className="w-32 h-32 object-cover rounded-xl shadow mb-4"
            />
            <h2 className="text-xl font-bold mb-2">Gallery</h2>
            <p className="text-gray-700 mb-4 text-sm">
              A collection of favourite images.
            </p>
            <Link
              to="/gallery"
              className="text-purple-700 font-semibold hover:underline mt-auto"
            >
              →
            </Link>
          </section>

          {/* ---------- Admin ---------- */}
          <section className="bg-purple-100 rounded-2xl p-6 text-center flex flex-col items-center">
            <img
              src={adminImg}
              alt="Admin"
              className="w-32 h-32 object-cover rounded-xl shadow mb-4"
            />
            <h2 className="text-xl font-bold mb-2">Admin</h2>
            <p className="text-gray-700 mb-4 text-sm">
              Entry to site maintenance facilities.
            </p>
            <Link
              to="/admin"
              className="text-purple-700 font-semibold hover:underline mt-auto"
            >
              →
            </Link>
          </section>
        </div>
      </main>

    </div>
  );
}

export default HomePage;
