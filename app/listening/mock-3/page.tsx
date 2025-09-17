// app/listening/mock-3/page.tsx
"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { BsStopwatchFill } from "react-icons/bs";
import { MdOutlineNoteAlt } from "react-icons/md";
import { IoMdVolumeHigh } from "react-icons/io";
import { BsFillVolumeMuteFill } from "react-icons/bs";
import axios from "axios";

/* 4-part components for Mock-3 */
import Part1JobInterview from "@/components/mock3/Part1JobInterview";
import Part2Section from "@/components/mock3/Part2Section";
import Part3Section from "@/components/mock3/Part3Section";
import Part4Section from "@/components/mock3/Part4Section";

/* ────────── ANSWER KEY for Mock-3 ────────── */
const ANSWER_KEY: Record<number, string[]> = {
    // Part 1 (Q1-10)
    1: ["B"],
    2: ["C"],
    3: ["15 minute", "15 minutes"],
    4: ["third year", "3rd year"],
    5: ["first tuesday", "1st tuesday"],
    6: ["25%"],
    7: ["room 12"],
    8: ["mrs waddell", "waddell"],
    9: ["window dressing", "dress windows"],
    10: ["black skirt"],

    // Part 2 (Q11-20)
    11: ["C"],
    12: ["B"],
    13: ["C"],
    14: ["A","D"],
    15: ["A","D"],
    // 16: ["75"],
    // 17: ["evening", "evenings"],
    // 18: ["4-course dinner", "four-course dinner", "four course dinner"],
    // 19: ["52"],
    // 20: ["golf club"],

    // Part 3 (Q21-30)
    21: ["weather", "weather conditions"],
    22: ["environment agency", "environmental agency"],
    23: ["B"],
    24: ["A"],
    25: ["C"],
    26: ["B"],
    27: ["B"],
    28: ["C"],
    29: ["A"],
    30: ["A"],

    // Part 4 (Q31-40)
    31: ["australia"],
    32: ["flight speed", "speed", "speed of flight", "flying speed"],
    33: ["looking for food", "searching for food", "looking", "searching"],
    34: ["start to fly", "begin to fly", "start flying", "begin flying"],
    35: ["full size", "adult size", "full grown", "fully grown"],
    36: ["leave nests", "leave nest", "leave their nests", "leave the nest"],
    37: ["die"],
    38: [
        "attach rings",
        "attach identification rings",
        "attach id rings",
        "attach aluminium rings",
        "attach aluminum rings",
    ],
    39: ["note the sex", "note sex", "sex"],
    40: ["general health", "health"],
};

const BAND_TABLE = [
    { min: 39, max: 40, band: 9 },
    { min: 37, max: 38, band: 8.5 },
    { min: 35, max: 36, band: 8 },
    { min: 32, max: 34, band: 7.5 },
    { min: 30, max: 31, band: 7 },
    { min: 26, max: 29, band: 6.5 },
    { min: 23, max: 25, band: 6 },
    { min: 18, max: 22, band: 5.5 },
    { min: 16, max: 17, band: 5 },
    { min: 13, max: 15, band: 4.5 },
    { min: 10, max: 12, band: 4 },
    { min: 8, max: 9, band: 3.5 },
    { min: 6, max: 7, band: 3 },
    { min: 4, max: 5, band: 2.5 },
];

export default function ListeningMock3() {
    const router = useRouter();

    /* ---------- state ---------- */
    const [showCodeModal, setShowCodeModal] = useState(true);
    const [codeInput, setCodeInput] = useState("");
    const [codeErr, setCodeErr] = useState("");
    const [showWrongModal, setShowWrongModal] = useState(false);

    const [showUserForm, setShowUserForm] = useState(false);
    const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        phone: "",
    });

    const [showIntro, setShowIntro] = useState(false);
    const [currentPart, setCurrentPart] = useState<1 | 2 | 3 | 4>(1);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<string[]>(Array(40).fill(""));

    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(35 * 60);
    const [timeExpired, setTimeExpired] = useState(false);
    const [running, setRunning] = useState(false);

    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<{ correct: number; band: number } | null>(
        null
    );

    /* notes / highlight */
    type Note = { id: string; word: string; note: string };
    const [notes, setNotes] = useState<Note[]>([]);
    const [showPad, setShowPad] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [actionPos, setActionPos] = useState({ x: 0, y: 0 });
    const [selectedSpan, setSelectedSpan] = useState<HTMLElement | null>(null);
    const [selectedTxt, setSelectedTxt] = useState("");
    const [noteInput, setNoteInput] = useState(false);
    const [noteDraft, setNoteDraft] = useState("");
    const savedRangeRef = useRef<Range | null>(null);
    const noteIdRef = useRef(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasSubmittedRef = useRef(false);
    const answersRef = useRef<string[]>([]);
    const userInfoRef = useRef(userInfo);

    const partOffsets = [0, 10, 20, 30];
    const normalise = (s: string) =>
        s.trim().toLowerCase().replace(/£|\$/g, "").replace(/\s+/g, " ");

    const evaluate = () => {
        let correct = 0;
        answersRef.current.forEach((ans, idx) => {
            const key = ANSWER_KEY[idx + 1];
            if (key?.some((k) => normalise(k) === normalise(ans))) correct++;
        });
        const band =
            BAND_TABLE.find((r) => correct >= r.min && correct <= r.max)?.band ?? 0;
        return { correct, band };
    };

    /* ---------- highlight helpers ---------- */
    const applyHighlight = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        const r = sel.getRangeAt(0).cloneRange();
        const span = document.createElement("span");
        span.dataset.highlight = "y";
        span.style.background = "#fff59d";
        try {
            r.surroundContents(span);
        } catch {}
        sel.removeAllRanges();
        setShowActions(false);
    };
    const removeHighlight = () => {
        if (!selectedSpan) return;
        selectedSpan.replaceWith(
            document.createTextNode(selectedSpan.textContent || "")
        );
        setShowActions(false);
    };
    const openNoteInput = () => {
        const sel = window.getSelection();
        savedRangeRef.current =
            sel && !sel.isCollapsed ? sel.getRangeAt(0).cloneRange() : null;
        setNoteDraft("");
        setNoteInput(true);
    };
    const saveNote = () => {
        if (!selectedTxt || !savedRangeRef.current) return;
        const span = document.createElement("span");
        span.style.color = "#dc2626";
        const id = `note-${++noteIdRef.current}`;
        span.dataset.noteId = id;
        try {
            savedRangeRef.current.surroundContents(span);
        } catch {}
        setNotes((n) => [...n, { id, word: selectedTxt, note: noteDraft.trim() }]);
        setNoteInput(false);
        setShowActions(false);
        savedRangeRef.current = null;
        window.getSelection()?.removeAllRanges();
    };
    const removeNote = () => {
        if (!selectedSpan) return;
        const id = selectedSpan.dataset.noteId;
        selectedSpan.replaceWith(
            document.createTextNode(selectedSpan.textContent || "")
        );
        setNotes((n) => n.filter((x) => x.id !== id));
        setShowActions(false);
    };

    /* ---------- telegram ---------- */
    const sendTelegramResult = async (
        firstName: string,
        lastName: string,
        phone: string,
        correct: number,
        band: number
    ) => {
        const groupChatId = "-1002183106719";
        const token = "7866020177:AAENPifrsXdXsbrEZTYcUGbimyB1-Co2MKU";
        const message = `📢 *Listening Test 3 Result*\n\n👤 Name: ${firstName} ${lastName}\n📞 Phone: ${phone}\n✅ Correct: ${correct}/40\n🎯 Band: ${band}`;
        try {
            await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                chat_id: groupChatId,
                text: message,
                parse_mode: "Markdown",
            });
        } catch (e) {
            console.error("Telegram send failed:", e);
        }
    };

    /* ---------- effects ---------- */
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
    }, [volume, muted]);

    useEffect(() => {
        answersRef.current = answers;
        userInfoRef.current = userInfo;
    }, [answers, userInfo]);

    useEffect(() => {
        const firstQIndex = partOffsets[currentPart - 1];
        const el = document.getElementById(`question-${firstQIndex}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [currentPart]);

    useEffect(() => {
        const onMouseUp = () => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed) return setShowActions(false);
            const txt = sel.toString().trim();
            if (!txt) return setShowActions(false);
            const rect = sel.getRangeAt(0).getBoundingClientRect();
            setActionPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
            let node: Node | null = sel.anchorNode;
            let span: HTMLElement | null = null;
            while (node && node !== document.body) {
                if (node instanceof HTMLElement) {
                    const d = node.dataset;
                    if (d?.highlight === "y" || d?.noteId) {
                        span = node;
                        break;
                    }
                }
                node = (node as HTMLElement).parentNode;
            }
            setSelectedSpan(span);
            setSelectedTxt(txt);
            setShowActions(true);
        };
        document.addEventListener("mouseup", onMouseUp);
        return () => document.removeEventListener("mouseup", onMouseUp);
    }, []);

    /* timer */
    useEffect(() => {
        if (!running) return;
        const t = setInterval(() => {
            setTimeLeft((p) => {
                if (p <= 1) {
                    clearInterval(t);
                    setTimeExpired(true);
                    if (!hasSubmittedRef.current) handleSubmit();
                    return 0;
                }
                return p - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [running]);

    useEffect(() => {
        if (running && audioRef.current) audioRef.current.play().catch(() => {});
    }, [running]);

    /* ---------- submit ---------- */
    const handleSubmit = () => {
        if (hasSubmittedRef.current) return;
        hasSubmittedRef.current = true;
        const { correct, band } = evaluate();
        setResult({ correct, band });
        setSubmitted(true);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        const { firstName, lastName, phone } = userInfoRef.current;
        if (firstName && lastName && phone) {
            sendTelegramResult(firstName, lastName, phone, correct, band);
        }
    };

    const start = () => {
        setShowIntro(false);
        setRunning(true);
    };

    /* ---------- UI ---------- */
    return (
        <section className="h-screen flex flex-col bg-white">
            {/* Access Code Modal */}
            {showCodeModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow max-w-xs w-full text-center space-y-4">
                        <h2 className="text-xl font-bold text-[#32CD32]">Enter Access Code</h2>
                        <input
                            type="text"
                            maxLength={4}
                            value={codeInput}
                            onChange={(e) =>
                                setCodeInput(e.target.value.replace(/[^0-9]/g, ""))
                            }
                            className="w-full border p-2 rounded text-center tracking-widest text-2xl"
                            placeholder="0000"
                        />
                        {codeErr && <p className="text-red-600 text-sm">{codeErr}</p>}
                        <button
                            className="bg-[#32CD32] text-white px-6 py-2 rounded w-full"
                            onClick={async () => {
                                const r = await fetch("/api/verify-code", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ code: codeInput }),
                                });
                                if (r.ok) {
                                    setShowCodeModal(false);
                                    setShowUserForm(true);
                                    setCodeInput("");
                                    setCodeErr("");
                                } else {
                                    setShowCodeModal(false);
                                    setShowWrongModal(true);
                                }
                            }}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}

            {/* Wrong Code Modal */}
            {showWrongModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center space-y-4">
                        <h2 className="text-xl font-bold text-red-600">Incorrect Code</h2>
                        <p>
                            Please enter the correct code or{" "}
                            <a
                                href="https://t.me/ielts_school_admin"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-[#32CD32] font-semibold"
                            >
                                contact IELTS-School admin
                            </a>
                            .
                        </p>
                        <button
                            className="bg-[#32CD32] text-white px-6 py-2 rounded w-full"
                            onClick={() => {
                                setShowWrongModal(false);
                                setShowCodeModal(true);
                                setCodeInput("");
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* User Info Form */}
            {showUserForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-2xl font-bold text-green-900">
                            Enter Your Information
                        </h2>

                        <input
                            type="text"
                            placeholder="First Name"
                            value={userInfo.firstName}
                            onChange={(e) =>
                                setUserInfo({ ...userInfo, firstName: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={userInfo.lastName}
                            onChange={(e) =>
                                setUserInfo({ ...userInfo, lastName: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={userInfo.phone}
                            onChange={(e) =>
                                setUserInfo({ ...userInfo, phone: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        />

                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-40"
                            disabled={
                                !userInfo.firstName || !userInfo.lastName || !userInfo.phone
                            }
                            onClick={() => {
                                if (userInfo.firstName && userInfo.lastName && userInfo.phone) {
                                    setShowUserForm(false);
                                    setShowIntro(true);
                                }
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Intro Modal */}
            {showIntro && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-2xl font-bold text-[#32CD32]">
                            Listening Test 3
                        </h2>
                        <p>
                            40 questions in 4 parts. Audio starts after you click{" "}
                            <strong>Start</strong>.
                        </p>
                        <button
                            onClick={start}
                            className="bg-[#32CD32] text-white px-6 py-2 rounded"
                        >
                            Start
                        </button>
                    </div>
                </div>
            )}

            {/* Result Modal */}
            {result && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-3xl font-bold text-[#32CD32]">Your Score</h2>
                        <p className="text-2xl font-semibold">{result.correct}/40 answers</p>
                        <p className="text-xl">
                            Band score <strong>{result.band}</strong>
                        </p>
                        <button
                            onClick={() => {
                                setResult(null);
                                setTimeout(() => router.push("/"), 10_000);
                            }}
                            className="bg-[#32CD32] text-white px-6 py-2 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* ===== Main Test Layout ===== */}
            {!showIntro && (
                <>
                    {/* Header */}
                    <header className="sticky top-0 z-40 bg-white border-b px-4 py-2 flex justify-between items-center">
                        <h1 className="font-bold text-[#32CD32]">Part {currentPart}</h1>

                        {/* Timer */}
                        <div className="flex items-center gap-1 text-[#32CD32] font-semibold text-lg">
                            <BsStopwatchFill className="text-3xl" />
                            <span>
                {`${Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, "0")}:${(timeLeft % 60)
                    .toString()
                    .padStart(2, "0")}`}
              </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <audio ref={audioRef} src="/audio/mock-3.mp3" />
                            <button
                                onClick={() => setMuted((m) => !m)}
                                className="text-xl text-[#32CD32]"
                            >
                                {muted ? <BsFillVolumeMuteFill /> : <IoMdVolumeHigh />}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volume}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setVolume(+e.target.value)
                                }
                                className="w-28 accent-[#32CD32]"
                                disabled={muted}
                            />
                            <MdOutlineNoteAlt
                                onClick={() => setShowPad(true)}
                                className={`text-2xl cursor-pointer ${
                                    notes.length ? "text-red-600" : "text-[#32CD32]"
                                }`}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={submitted || timeExpired}
                                className={`px-4 py-1.5 rounded text-white ${
                                    submitted || timeExpired
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#32CD32]"
                                }`}
                            >
                                Submit
                            </button>
                        </div>
                    </header>

                    {/* Main row (questions + notepad) */}
                    <main className="flex flex-1 overflow-hidden">
                        {/* Questions */}
                        <div className="flex-1 overflow-y-auto px-4 pb-36">
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Part 1 */}
                                {currentPart === 1 && (
                                    <>
                                        <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                            Part 1 – Questions 1–10
                                        </h2>
                                        <Part1JobInterview
                                            answers={answers.slice(0, 10)}
                                            onAnswerChangeAction={(i, v) => {
                                                const copy = [...answers];
                                                copy[i] = v;
                                                setAnswers(copy);
                                            }}
                                        />
                                    </>
                                )}

                                {/* Part 2 */}
                                {currentPart === 2 && (
                                    <>
                                        <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                            Part 2 – Questions 11–20
                                        </h2>
                                        <Part2Section
                                            answers={answers.slice(10, 20)}
                                            onAnswerChangeAction={(i, v) =>
                                                setAnswers(prev => {
                                                    const copy = [...prev];
                                                    copy[10 + i] = v;        // ✅ functional update (no stale closure)
                                                    return copy;
                                                })
                                            }
                                            onBulkChange={(pairs) =>
                                                setAnswers(prev => {
                                                    const copy = [...prev];
                                                    pairs.forEach(([i, v]) => { copy[10 + i] = v; }); // ✅ Q14 & Q15 together
                                                    return copy;
                                                })
                                            }
                                        />
                                    </>
                                )}

                                {/* Part 3 */}
                                {currentPart === 3 && (
                                    <>
                                        <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                            Part 3 – Questions 21–30
                                        </h2>
                                        <Part3Section
                                            answers={answers.slice(20, 30)}
                                            onAnswerChangeAction={(i, v) => {
                                                const copy = [...answers];
                                                copy[20 + i] = v;
                                                setAnswers(copy);
                                            }}
                                        />
                                    </>
                                )}

                                {/* Part 4 */}
                                {currentPart === 4 && (
                                    <>
                                        <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                            Part 4 – Questions 31–40
                                        </h2>
                                        <Part4Section
                                            answers={answers.slice(30, 40)}
                                            onAnswerChangeAction={(i, v) => {
                                                const copy = [...answers];
                                                copy[30 + i] = v;
                                                setAnswers(copy);
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Notepad */}
                        {showPad && (
                            <aside className="w-80 border-l flex-shrink-0 overflow-y-auto px-4 py-6 relative">
                                <button
                                    onClick={() => setShowPad(false)}
                                    className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-600"
                                >
                                    &times;
                                </button>
                                <h3 className="font-bold text-lg mb-4">Notepad</h3>
                                {notes.length === 0 && (
                                    <p className="text-sm text-gray-500">No notes yet.</p>
                                )}
                                {notes.map((n) => (
                                    <div key={n.id} className="mb-3">
                                        <p className="font-semibold underline text-blue-700 break-words">
                                            {n.word}
                                        </p>
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {n.note}
                                        </p>
                                    </div>
                                ))}
                            </aside>
                        )}
                    </main>

                    {/* Paginator */}
                    <footer className="fixed bottom-0 inset-x-0 bg-white border-t px-4 py-2 z-40 shadow">
                        <div className="grid grid-cols-4 gap-4">
                            {partOffsets.map((off, idx) => {
                                const answered = answers
                                    .slice(off, off + 10)
                                    .filter((a) => a.trim()).length;
                                const active = currentPart === (idx + 1) as 1 | 2 | 3 | 4;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setCurrentPart((idx + 1) as 1 | 2 | 3 | 4);
                                            setCurrentIdx(off);
                                        }}
                                        className={`border rounded p-2 cursor-pointer ${
                                            active ? "border-green-400" : "border-gray-300"
                                        }`}
                                    >
                                        <div
                                            className={`font-semibold ${
                                                active ? "text-[#32CD32]" : ""
                                            }`}
                                        >
                                            Part {idx + 1}: {answered} / 10
                                        </div>

                                        {active && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {Array.from({ length: 10 }).map((_, q) => {
                                                    const qi = off + q;
                                                    return (
                                                        <button
                                                            key={qi}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                document
                                                                    .getElementById(`question-${qi}`)
                                                                    ?.scrollIntoView({
                                                                        behavior: "smooth",
                                                                        block: "center",
                                                                    });
                                                                setCurrentIdx(qi);
                                                            }}
                                                            className={`w-8 h-8 rounded-full border text-sm ${
                                                                currentIdx === qi
                                                                    ? "bg-[#32CD32] text-white"
                                                                    : answers[qi].trim()
                                                                        ? "bg-green-100 border-green-400"
                                                                        : "hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            {qi + 1}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </footer>

                    {/* Pop-over actions & note editor */}
                    {showActions && (
                        <div
                            className="fixed z-50 bg-white border rounded shadow px-2 py-1 text-xs flex gap-2"
                            style={{ top: actionPos.y, left: actionPos.x }}
                        >
                            {selectedSpan?.dataset?.noteId ? (
                                <button
                                    onClick={removeNote}
                                    className="text-red-600 hover:underline"
                                >
                                    Remove note
                                </button>
                            ) : (
                                <button
                                    onClick={openNoteInput}
                                    className="text-blue-600 hover:underline"
                                >
                                    Note
                                </button>
                            )}
                            {selectedSpan?.dataset?.highlight === "y" ? (
                                <button
                                    onClick={removeHighlight}
                                    className="text-yellow-700 hover:underline"
                                >
                                    Remove highlight
                                </button>
                            ) : (
                                <button
                                    onClick={applyHighlight}
                                    className="text-yellow-700 hover:underline"
                                >
                                    Highlight
                                </button>
                            )}
                        </div>
                    )}

                    {noteInput && (
                        <div
                            className="fixed z-50 bg-white border rounded shadow p-3 w-72"
                            style={{ top: actionPos.y + 24, left: actionPos.x }}
                        >
              <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  className="w-full h-20 border rounded p-2"
                  placeholder="Write your note here…"
              />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => {
                                        setNoteInput(false);
                                        setShowActions(false);
                                    }}
                                    className="px-3 py-1 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveNote}
                                    disabled={!noteDraft.trim()}
                                    className="px-3 py-1 bg-[#32CD32] text-white rounded disabled:opacity-40"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
