import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)] gap-x-3.5">
      <Link
        to="/"
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-400"
      >
        Home
      </Link>
      <SignIn />
    </div>
  );
};

export default LoginPage;