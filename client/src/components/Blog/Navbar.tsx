import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";

import {
  SquarePen,
} from "lucide-react";

const Navbar = () => {
  const [
    open,
    setOpen,
  ] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <nav className="relative z-50 flex h-16 w-full items-center justify-between md:h-20">      {/* Logo */}

      <Link
        to="/blog"
        onClick={closeMenu}
        className="flex items-center gap-3 font-bold"
      >
        <img
          src="/egg.png"
          alt="Hard Boiled Egg"
          className="h-12 w-12 rounded-full object-contain"
        />

        <div className="text-xl font-semibold text-gray-800 sm:text-2xl">
          Hard Boiled Egg
        </div>
      </Link>

      {/* Mobile navigation */}

      <div className="md:hidden">
        <button
          type="button"
          aria-label={
            open
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={open}
          onClick={() =>
            setOpen(
              (previous) =>
                !previous
            )
          }
          className="relative z-[60] flex h-10 w-10 items-center justify-center text-3xl"
        >
          {open ? "×" : "☰"}
        </button>

        <div
          className={
            `
              fixed inset-x-0 top-16 z-50
              flex h-[calc(100dvh-4rem)]
              flex-col items-center justify-center
              gap-8 bg-white
              text-lg font-medium
              shadow-lg
              transition-transform duration-300
              ease-in-out
              ${
                open
                  ? "translate-x-0"
                  : "translate-x-full"
              }
            `
          }
        >
          <Link
            to="/blog"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/about"
            onClick={closeMenu}
          >
            About
          </Link>

          <Link
            to="/index"
            onClick={closeMenu}
          >
            Index
          </Link>

          <SignedOut>
            <Link
              to="/login"
              onClick={closeMenu}
              className="rounded-full bg-blue-800 px-4 py-2 text-white hover:bg-blue-700"
            >
              Login
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Edit Profile"
                  labelIcon={
                    <SquarePen
                      size={16}
                    />
                  }
                  href="/profile"
                />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>
      </div>

      {/* Desktop navigation */}

      <div className="hidden items-center gap-8 font-medium md:flex xl:gap-12">
        <Link to="/blog">
          Home
        </Link>

        <Link to="/about">
          About
        </Link>

        <Link to="/index">
          Index
        </Link>

        <SignedOut>
          <Link
            to="/login"
            className="rounded-full bg-blue-800 px-4 py-2 text-white hover:bg-blue-700"
          >
            Login
          </Link>
        </SignedOut>

        <SignedIn>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Edit Profile"
                labelIcon={
                  <SquarePen
                    size={16}
                  />
                }
                href="/profile"
              />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;