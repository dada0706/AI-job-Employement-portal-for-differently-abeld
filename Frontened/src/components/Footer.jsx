import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-[var(--border-color)] mt-20 py-5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-0">
        {/* Logo and Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/">
            <img
              className="w-[120px] object-contain drop-shadow-sm dark:brightness-110"
              src={assets.logo}
              alt="Company Logo"
            />
          </Link>
          <span className="hidden sm:block text-[var(--text-muted)] h-6 lg:flex items-center">
            |
          </span>
          <p className="text-[var(--text-muted)] text-sm sm:text-base text-center sm:text-left">
            FireStorm | All rights reserved.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-6 mt-4 sm:mt-0">
          <a
            href="#"
            className="transition-transform hover:scale-110"
            aria-label="Facebook"
          >
            <img
              src={assets.facebook_icon}
              alt="Facebook"
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain drop-shadow-sm dark:brightness-110"
              width={32}
              height={32}
              loading="lazy"
            />
          </a>
          <a
            href="#"
            className="transition-transform hover:scale-110"
            aria-label="Twitter"
          >
            <img
              src={assets.twitter_icon}
              alt="Twitter"
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain drop-shadow-sm dark:brightness-110"
              width={32}
              height={32}
              loading="lazy"
            />
          </a>
          <a
            href="#"
            className="transition-transform hover:scale-110"
            aria-label="Instagram"
          >
            <img
              src={assets.instagram_icon}
              alt="Instagram"
              className="h-6 w-6 sm:h-8 sm:w-8 object-contain drop-shadow-sm dark:brightness-110"
              width={32}
              height={32}
              loading="lazy"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
