"use client";

import { FaInstagram } from "react-icons/fa";

export default function InstagramBanner() {
    return (
        <section className="w-full bg-gradient-to-r from-purple-600 via-red-500 to-orange-400 py-16 px-4 text-white font-sans">
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
                {/* Follow Text */}
                <div className="flex items-center space-x-2 text-white font-medium">
                    <span className="h-[2px] w-6 bg-yellow-400" />
                    <span>Follow us</span>
                </div>

                {/* Heading with Icon */}
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                    Don’t miss updates and tips on{" "}
                    <span className="inline-flex items-center gap-2 align-middle">
            <span className="bg-white rounded-full p-[6px] flex items-center justify-center">
              <FaInstagram size={20} className="text-[#E1306C]" />
            </span>
            <span className="pb-[8px]">Instagram</span>
          </span>
                </h2>

                {/* Button with link */}
                <a
                    href="https://www.instagram.com/ielts_school_navoi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-500 font-semibold transition"
                >
                    Follow Now
                </a>
            </div>
        </section>
    );
}
