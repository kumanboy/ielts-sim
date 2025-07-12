export default function HomePage() {
    return (
        <main className="min-h-screen bg-[#ffffff] text-[#000000] flex flex-col items-center justify-center gap-6 p-8">

            <h1 className="text-4xl font-bold text-[#32CD32]">Hello IELTS!</h1>

            <p className="text-lg text-center">Tailwind with inline hex is working perfectly 🎯</p>

            {/* Instagram Gradient Box */}
            <div className="w-60 h-14 rounded text-white font-semibold flex items-center justify-center bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040]">
                Instagram Style
            </div>

            {/* Primary White Box with Border */}
            <div className="w-60 h-14 rounded bg-[#ffffff] border border-[#32CD32] flex items-center justify-center text-[#32CD32] font-semibold">
                White with Green Border
            </div>

            {/* Black Text on Yellow Button */}
            <button className="bg-[#FFD700] text-[#000000] px-4 py-2 rounded hover:opacity-90">
                Yellow CTA Button
            </button>

        </main>
    );
}
