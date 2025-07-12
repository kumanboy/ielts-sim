"use client";

export default function Footer() {
    return (
        <footer className="w-full py-6 px-4 bg-white text-center font-sans text-sm text-gray-700">
            <div className="flex flex-col items-center space-y-2">
                {/* Footer Links */}
                <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 text-gray-700">
                    <a href="#" className="hover:underline">
                        About us
                    </a>
                    <span className="hidden sm:inline">|</span>
                    <a href="#" className="hover:underline">
                        Privacy Policy
                    </a>
                    <span className="hidden sm:inline">|</span>
                    <a href="#" className="hover:underline">
                        Terms of Use
                    </a>
                    <span className="hidden sm:inline">|</span>
                    <a href="#" className="hover:underline">
                        Disclaimer
                    </a>
                </div>

                {/* Copyright */}
                <p className="text-gray-600 mt-1">
                    Copyright ©2025 | <span className="text-blue-700">ieltsschool.uz</span>
                </p>
            </div>
        </footer>
    );
}
