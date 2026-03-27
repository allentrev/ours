import { useState } from "react";
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { SquarePen } from "lucide-react"; // or any small icon

const Navbar = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className='w-full h-16 md:h-20 flex items-center justify-between'>
        {/* LOGO */}
        <Link to="/blog" className='flex items-center gap-4 text-2xl font-bold'>
          <img src="/logo.png" alt="trev logo" width={32} height={32} />
          <span>trevlog</span>
        </Link>

        {/* MOBILE MENU */}
        <div className="md:hidden">
          {/* MOBILE BUTTON */}
          <div className="cursor-pointer text-4xl"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? "X" : "☰"}
          </div>

          {/* MOBILE LINK LIST */}
          {/* in the tutorial, it uses h-screen */}
          <div className={`w-full h-screen flex flex-col items-center justify-center gap-8 font-medium text-lg absolute top-16 txt-4xl bg-green transition-all ease-in-out
             ${open ? "right-0" : "-right-full"
            }`}>
            <Link to="/blog">Home</Link>
            <Link to="/toDo">To Do</Link>
            <Link to="/recipes">Recipes</Link>
            <Link to="/about">About</Link>
            <Link to="/index">Index</Link>
            <Link to="">
              <button className="py-2 px-4 rounded-3xl bg-blue-800 text-white">Login</button>
            </Link>
          </div>
        </div>
        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8 xl:gap-12 font-medium">
          <Link to="/blog">Home</Link>
          <Link to="/toDo">To Do</Link>
          <Link to="/recipes">Recipes</Link>
          <Link to="/about">About</Link>
          <Link to="/index">Index</Link>
          <SignedOut>
            <Link to="/login">
              <button className="py-2 px-4 rounded-3xl bg-blue-800 text-white">Login</button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Edit Profile"
                  labelIcon={<SquarePen size={16} />}
                  href="/profile"
                />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>
    </div>
  )
}

export default Navbar