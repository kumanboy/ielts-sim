"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="bg-[#ffffff] shadow-md sticky top-0 z-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/">
                    <Image src="/logo.png" alt="Logo" width={150} height={40} priority />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex space-x-6 font-medium">
                    <Link href="/" className="text-[#000000] hover:text-[#32CD32]">Home</Link>
                    <Link href="#listening" className="text-[#000000] hover:text-[#32CD32]">Listening</Link>
                    <Link href="#reading" className="text-[#000000] hover:text-[#32CD32]">Reading</Link>
                    <Link href="#writing" className="text-[#000000] hover:text-[#32CD32]">Writing</Link>
                    <Link href="#speaking" className="text-[#000000] hover:text-[#32CD32]">Speaking</Link>
                </nav>

                {/* Mobile Menu Button */}
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-[#32CD32]">
                    {isOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Fullscreen Mobile Menu */}
            <div
                className={`fixed inset-0 bg-[#32CD32] z-40 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex justify-between items-center px-4 py-4 border-b border-white bg-white">
                    <Image src="/logo.png" alt="Logo" width={120} height={30} />
                    <button onClick={() => setIsOpen(false)}>
                        <X size={24} className="text-[#32CD32]" />
                    </button>
                </div>

                <nav className="flex flex-col items-center justify-center gap-6 px-6 py-12 text-lg font-medium text-white text-center">
                    <Link href="/" onClick={() => setIsOpen(false)} className="hover:underline">Home</Link>
                    <Link href="#listening" onClick={() => setIsOpen(false)} className="hover:underline">Listening</Link>
                    <Link href="#reading" onClick={() => setIsOpen(false)} className="hover:underline">Reading</Link>
                    <Link href="#writing" onClick={() => setIsOpen(false)} className="hover:underline">Writing</Link>
                    <Link href="#speaking" onClick={() => setIsOpen(false)} className="hover:underline">Speaking</Link>
                </nav>
            </div>
        </header>
    );
}
