import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div className='flex items-center justify-center h-[calc(100vh-80px)]'>
      <Link
        to="/blog"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Home
      </Link>
      <SignIn signUpUrl="/register" />
    </div>
  )
}

export default LoginPage