"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const LINKS = [
    { label: "Home",      href: "/" },
    { label: "Listening", href: "/listening" },
    { label: "Reading",   href: "/reading" },
    { label: "Writing",   href: "/writing" }
];

export default function Navbar() {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [hidden, setHidden] = useState(false);

    /* ─── Hide nav once the mock test has started (Listening or Reading) ─── */
    useEffect(() => {
        const isMockPage =
            pathname.startsWith("/listening/mock-") ||
            pathname.startsWith("/reading/mock-") ||
            pathname.startsWith("/writing/mock-");

        if (!isMockPage) {
            setHidden(false);
            return;
        }

        const observer = new MutationObserver(() => {
            const modal = document.querySelector("[data-testid='start-modal']");
            setHidden(!modal); // Hide nav when modal disappears
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [pathname]);

    if (hidden) return null;

    const closeDrawer = () => setDrawerOpen(false);

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md font-sans">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
                {/* Logo */}
                <Link href="/" onClick={closeDrawer} className="shrink-0">
                    <Image src="/logo.png" alt="Logo" width={200} height={50} priority />
                </Link>

                {/* Desktop links */}
                <nav className="hidden md:flex space-x-6 font-medium">
                    {LINKS.map(({ label, href }) => {
                        const active = href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(href);
                        return (
                            <Link
                                key={label}
                                href={href}
                                className={`underline-offset-4 decoration-[#32CD32] hover:underline
                            ${active ? "text-[#32CD32] font-semibold" : "text-black"}`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile toggle */}
                <button
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    className="md:hidden text-[#32CD32]"
                >
                    {drawerOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Mobile drawer */}
            <div
                className={`fixed inset-0 bg-[#32CD32] z-40 transition-transform duration-300 ease-in-out
                    ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-white/20">
                    <Image src="/logo.png" alt="Logo" width={200} height={40} />
                    <button onClick={closeDrawer}>
                        <X size={24} className="text-[#32CD32]" />
                    </button>
                </div>

                <nav className="flex flex-col items-center justify-center gap-6 px-6 py-12 text-lg font-medium text-white text-center">
                    {LINKS.map(({ label, href }) => (
                        <Link
                            key={label}
                            href={href}
                            onClick={closeDrawer}
                            className="hover:underline underline-offset-4 decoration-white hover:text-white/80"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
