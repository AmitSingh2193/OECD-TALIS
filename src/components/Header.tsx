import React from "react";
import { Link } from "react-router-dom";
import oecd from "../assets/oecd.png";
import { FaDownload } from "react-icons/fa";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <header
      className={`w-full bg-white shadow-md py-8 px-10 flex justify-between items-center ${className}`}
    >
      <div className="flex items-center">
        <img
          src={oecd}
          alt="OECD"
          style={{
            height: "32px",
            width: "133px",
            objectFit: "contain",
            cursor: "pointer",
          }}
        />
        <h1 className="text-2xl font-bold ps-10">Educator Tool</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="text-base font-bold text-gray-700 hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
        >
          Back to Home
        </Link>
        <button className="group flex items-center gap-2 ms-6 border border-blue-500 text-blue-500 py-3 px-4 text-xs font-semibold rounded hover:bg-blue-500 hover:text-white transition-colors duration-300">
          <FaDownload className="text-blue-500 group-hover:text-white" />
          Dowload PDF
        </button>
      </div>
    </header>
  );
};

export default Header;
