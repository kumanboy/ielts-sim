import { TbWriting } from "react-icons/tb";


export default function WritingSection() {
    return (
        <section
            id="writing"
            className="w-full py-16 px-4 bg-white text-blackText font-sans"
        >
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                {/* Text Block */}
                <div className="md:w-1/2">
                    <h2 className="text-6xl font-bold">IELTS Writing</h2>
                    <p className="text-[#32CD32] text-2xl mt-1 font-medium">Tests / Questions</p>

                    {/* Stats */}
                    <div className="flex gap-12 mt-6">
                        <div>
                            <p className="text-3xl font-bold text-[#32CD32]">20+</p>
                            <p className="text-blackText text-sm">TESTS</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-[#32CD32]">40+</p>
                            <p className="text-blackText text-sm">WRITING TASKS</p>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="mt-6 text-sm text-gray-700 leading-relaxed">
                        IELTS Writing practice materials include both Task 1 and Task 2 types.
                        Get sample questions with model answers, structure breakdowns, and scoring guidance to help improve your writing skills.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <button className="bg-[#0202D3] text-white px-4 py-2 rounded hover:opacity-90 text-sm">
                            IELTS Writing Overview
                        </button>
                        <button className="bg-[#32CD32] text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
                            IELTS Writing Tips
                        </button>
                        <button className="bg-yellow-400 text-black px-4 py-2 rounded text-sm">
                            IELTS Writing 2024
                        </button>
                    </div>
                </div>

                {/* Icon with Blue Background */}
                <div className="md:w-1/2 flex justify-center">
                    <div className="p-8 rounded-full bg-yellow-400">
                        <TbWriting className="text-white opacity-90" size={160} />
                    </div>
                </div>
            </div>
        </section>
    );
}
