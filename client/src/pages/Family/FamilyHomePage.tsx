import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";
import familyImg from "../../assets/wait_1.jpg";

export default function FamilyHome() {
  const navigate = useNavigate();

  return (
    <>
      {/* ---------- SEO ---------- */}
      <SEO
        title="Family | Personal Website"
        description="Family memories, stories, and moments collected in one place."
      />

      <div className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">

          {/* ---------- Header ---------- */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Family
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
              src={familyImg}
              alt="Family"
              className="w-48 h-48 object-cover rounded-xl shadow"
            />

            <p className="text-gray-600 text-center md:text-left">
              This section is dedicated to family stories, milestones, and
              shared memories. Over time, it will grow into a collection of
              moments worth remembering.
            </p>
          </div>

          {/* ---------- Placeholder content ---------- */}
          <div className="mt-10 space-y-4 text-gray-700">
            <p>
              Content coming soon…
            </p>

            <p>
              Future updates may include image galleries, family history,
              timelines, and personal reflections.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
