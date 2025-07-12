import { FaBookOpen } from "react-icons/fa";

export default function ReadingSection() {
    return (
        <section
            id="reading"
            className="w-full py-16 px-4 bg-white text-blackText font-sans"
        >
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center justify-between gap-12">
                {/* Text Block */}
                <div className="md:w-1/2">
                    <h2 className="text-6xl font-bold">IELTS Reading</h2>
                    <p className="text-[#32CD32] text-2xl mt-1 font-medium">Tests / Questions</p>

                    {/* Stats */}
                    <div className="flex gap-12 mt-6">
                        <div>
                            <p className="text-3xl font-bold text-[#32CD32]">30+</p>
                            <p className="text-blackText text-sm">TESTS</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-[#32CD32]">50+</p>
                            <p className="text-blackText text-sm">QUESTION PRACTICES</p>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="mt-6 text-sm text-gray-700 leading-relaxed">
                        IELTS Reading tests and questions will help you practice Academic and General Training modules.
                        These include full tests with answers, explanations, and timer-based test experiences.
                        Improve your reading skills and manage time more effectively.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <button className="bg-[#0202D3] text-white px-4 py-2 rounded hover:opacity-90 text-sm">
                            IELTS Reading Overview
                        </button>
                        <button className="bg-[#32CD32] text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
                            IELTS Reading Tips
                        </button>
                        <button className="bg-yellow-400 text-black px-4 py-2 rounded text-sm">
                            IELTS Reading 2024
                        </button>
                    </div>
                </div>

                {/* Icon with Blue Background */}
                <div className="md:w-1/2 flex justify-center">
                    <div className="p-8 rounded-full bg-[#0202D3]">
                        <FaBookOpen className="text-white opacity-90" size={160} />
                    </div>
                </div>
            </div>
        </section>
    );
}
