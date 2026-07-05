import { Link } from 'react-router-dom';
import { SEO } from 'components';

const AdminPage: React.FC = () => {

  return (
    <div className="flex items-center justify-center p-4">
      <SEO
        title="AdminPage – Maidenhead Town Bowls Club"
        description="Provides access to the Administration features"
      />

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Welcome</h2>

        <Link
          to="/maintainRefData"
          className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Maintain Data
        </Link>

        <Link
          to="/maintainFamilyPerson"
          className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Maintain Person
        </Link>

        <Link
          to="/maintainFamily"
          className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Maintain Family
        </Link>
      
        <Link
          to="/maintainPlace"
          className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Maintain Place
        </Link>
        
        <Link
          to="/maintainNote"
          className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Maintain Note
        </Link>

        <Link
          to="/maintainGallery"
          className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Maintain Gallery Images
        </Link>
      
        <div className="flex justify-center gap-4 pt-4">
          <Link
            to="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;