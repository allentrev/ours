import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import profileImg from "../assets/wait_2.jpg";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* ---------- SEO ---------- */}
      <SEO
        title="About Me | Personal Website"
        description="Learn more about me, the purpose of this website, and the stories behind the blog, family, and gallery sections."
      />

      <div className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">

          {/* ---------- Header ---------- */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              About Me
            </h1>

            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            >
              ← Back to Home
            </button>
          </div>

          {/* ---------- Intro ---------- */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={profileImg}
              alt="Profile"
              className="w-40 h-40 object-cover rounded-full shadow"
            />

            <p className="text-gray-600 text-center md:text-left">
              A little background and what this site is about.
            </p>
          </div>

          {/* ---------- Content ---------- */}
          <div className="mt-10 space-y-6 text-gray-700 leading-relaxed">
            <p>
              Hello! This website is a personal space where I share thoughts,
              memories, and creative work. It brings together writing, family
              stories, and photography in one place.
            </p>

            <p>
              I’ve always enjoyed documenting experiences—whether that’s through
              blog posts, photos, or reflections on everyday life. This site gives
              me a way to collect and organise those moments.
            </p>

            <p>
              The <strong>Blog</strong> section is where I write more freely, the{" "}
              <strong>Family</strong> section captures important memories, and the{" "}
              <strong>Gallery</strong> showcases photographs I enjoy.
            </p>

            <p>
              Over time, this site will grow and evolve, but at its heart it’s
              simply about recording what matters and sharing it in a meaningful
              way.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
