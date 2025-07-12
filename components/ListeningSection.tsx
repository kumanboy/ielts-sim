import { ImHeadphones } from "react-icons/im";

export default function ListeningSection() {
    return (
        <section
            id="listening"
            className="w-full py-16 px-4 bg-white text-blackText font-sans"
        >
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                {/* Text Block */}
                <div className="md:w-1/2">
                    <h2 className="text-6xl font-bold">IELTS Listening</h2>
                    <p className="text-[#32CD32] text-2xl mt-1 font-medium">Tests / Questions</p>

                    {/* Stats */}
                    <div className="flex gap-12 mt-6">
                        <div>
                            <p className="text-3xl font-bold text-[#32CD32]">32+</p>
                            <p className="text-blackText text-sm">TESTS</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-[#32CD32]">30+</p>
                            <p className="text-blackText text-sm">QUESTION PRACTICES</p>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="mt-6 text-sm text-gray-700 leading-relaxed">
                        IELTS Listening tests and questions will help you master all parts
                        of the Listening module. These tests include self-correction, with a
                        review of correct and incorrect answers. Also, there will be the
                        option to review audio transcripts for both tests and questions.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <button className="bg-[#0202D3] text-white px-4 py-2 rounded hover:opacity-90 text-sm">
                            IELTS Listening Overview
                        </button>
                        <button className="bg-[#32CD32] text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
                            IELTS Listening Tips
                        </button>
                        <button className="bg-yellow-400 text-black px-4 py-2 rounded text-sm">
                            IELTS Listening 2024
                        </button>
                    </div>
                </div>

                {/* Icon with Blue Background */}
                <div className="md:w-1/2 flex justify-center">
                    <div className="p-8 rounded-full bg-[#32CD32]">
                        <ImHeadphones className="text-white opacity-90" size={160} />
                    </div>
                </div>
            </div>
        </section>
    );
}
