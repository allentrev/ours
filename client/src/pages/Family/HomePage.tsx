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

      <div className="min-h-screen bg-blue-100 px-6 py-12">
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
              shared memories. I grew up thinking our family was small, well, the family tree
              shows otherwise.
            </p>
          </div>
          {/* ---------- Family Tree CTA ---------- */}
          <div className="mt-10 flex flex-col lg:flex-row justify-center gap-3">
            <p className="text-gray-600 text-sm text-center md:text-left">
              The family tree displays the tree from a selected person. Initially, a person is chosen
              at random from the family. Thereafter, double clicking a person node makes that person become the 
              focus of the tree, and their basic details will be shown in the attached panel. Use the buttons
              in the toolbar to change the direction of the tree i.e. either show the descendants of the selected
              person, or their ancestors. Selecting an edge between nodes will highlight/clear it so that family 
              connections are easier to identify. There are links in the details panel that allow the user to see
              more extensive information about each family member, and if registered, to amend that information.
              There is also a key sensitive search bar where by typing a persons name, you will be given a list 
              of persons meeting that criteria. The person chosen from that list becomes the selected person.
              The details of living persons are limited to protect their privacy, and
               the details of deceased persons are more extensive.
              
            </p>
            <button
              onClick={() => navigate("/family/tree")}
              className="px-6 py-3 rounded-xl bg-green-700 text-white font-medium shadow hover:bg-green-900 transition"
            >
              Open Family Tree
            </button>
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
