"use client";

import Link from "next/link";

const listeningMocks = [
    { id: 1, title: "Mock Test 1", description: "Writing Practice Test 1" },
    { id: 2, title: "Mock Test 2", description: "Writing Practice Test 2" },
    { id: 3, title: "Mock Test 3", description: "Listening Practice Test 3" },
    // { id: 4, title: "Mock Test 4", description: "Listening Practice Test 4" },
    // { id: 5, title: "Mock Test 5", description: "Listening Practice Test 5" },
];

export default function WritingPage() {
    return (
        <section className="min-h-screen py-16 px-4 bg-white text-black">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">IELTS Writing Tests</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {listeningMocks.map((mock) => (
                        <Link
                            key={mock.id}
                            href={`/writing/mock-${mock.id}`}
                            className="border border-gray-200 shadow-sm hover:shadow-md transition rounded-lg p-6 flex flex-col bg-white"
                        >
                            <h2 className="text-2xl font-semibold mb-2 text-[#32CD32]">{mock.title}</h2>
                            <p className="text-sm text-gray-700">{mock.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
