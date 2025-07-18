// app/listening/mock-1/page.tsx
"use client";

import {useEffect, useRef, useState, ChangeEvent} from "react";
import {useRouter} from "next/navigation";
import {IoMdVolumeHigh} from "react-icons/io";
import {MdOutlineNoteAlt} from "react-icons/md";
import {BsFillVolumeMuteFill, BsStopwatchFill} from "react-icons/bs";
import Part1GapFill from "@/components/Part1GapFill";
import Part2MatchMap from "@/components/Part2MatchMap";
import Part3FeaturesFlow from "@/components/Part3FeaturesFlow";
import Part4Mixed from "@/components/Part4Mixed";
import axios from "axios";


/* ────────── answer-key & band table (unchanged) ────────── */
const ANSWER_KEY: Record<number, string[]> = {
    1: ["round"], 2: ["12 years", "12"], 3: ["4", "four"], 4: ["green"],
    5: ["reasonable"], 6: ["lock"], 7: ["50", "£50"], 8: ["326"],
    9: ["right"], 10: ["bank"], 11: ["f"], 12: ["b"], 13: ["h"],
    14: ["g"], 15: ["d"], 16: ["e"], 17: ["b"], 18: ["f"], 19: ["d"],
    20: ["a"], 21: ["b"], 22: ["e"], 23: ["f"], 24: ["c"], 25: ["d"],
    26: ["f"], 27: ["e"], 28: ["c"], 29: ["g"], 30: ["d"],
    31: ["a"], 32: ["a"],
    33: ["challenge"], 34: ["school"], 35: ["health"],
    36: ["interests"], 37: ["tutor", "tutors"],
    38: ["maturity"], 39: ["advisors"], 40: ["online"],
};

const BAND_TABLE = [
    {min: 39, max: 40, band: 9}, {min: 37, max: 38, band: 8.5},
    {min: 35, max: 36, band: 8}, {min: 32, max: 34, band: 7.5},
    {min: 30, max: 31, band: 7}, {min: 26, max: 29, band: 6.5},
    {min: 23, max: 25, band: 6}, {min: 18, max: 22, band: 5.5},
    {min: 16, max: 17, band: 5}, {min: 13, max: 15, band: 4.5},
    {min: 10, max: 12, band: 4}, {min: 8, max: 9, band: 3.5},
    {min: 6, max: 7, band: 3},{min: 4, max: 5, band: 2.5},
];
/* ──────────────────────────────────────────────────────────── */

export default function ListeningMock1() {
    const router = useRouter();

    /* ─── base state ─────────────────────────────── */
    /* ---------- top‑level state ---------- */
    const [showCodeModal, setShowCodeModal] = useState(true);      // ❶ first screen
    const [codeInput, setCodeInput]         = useState("");
    const [codeErr,   setCodeErr]           = useState("");
    const [showWrongModal, setShowWrongModal] = useState(false);   // ❷ wrong‑code dialog

    const [showUserForm, setShowUserForm]   = useState(false);     // ❸ appears after code
    const [userInfo, setUserInfo] = useState({
        firstName: "", lastName: "", phone: ""
    });

    const [showIntro, setShowIntro]         = useState(false);     // ❹ appears after form
    const [currentPart, setCurrentPart]     = useState<1 | 2 | 3 | 4>(1);
    const [currentIdx,  setCurrentIdx]      = useState(0);
    const [answers,     setAnswers]         = useState<string[]>(Array(40).fill(""));

    const [volume, setVolume]               = useState(1);
    const [muted,  setMuted]                = useState(false);
    const [timeLeft, setTimeLeft]           = useState(35 * 60);
    const [timeExpired, setTimeExpired]     = useState(false);

    const [submitted, setSubmitted]         = useState(false);
    const [result, setResult]               = useState<{ correct: number; band: number } | null>(null);
    const [running, setRunning]         = useState(false); // ⬅️ NEW – starts timer + audio




    /* ─── notes / highlights ─────────────────────── */
    type Note = { id: string; word: string; note: string };
    const [notes, setNotes] = useState<Note[]>([]);
    const [showPad, setShowPad] = useState(false);

    const [showActions, setShowActions] = useState(false);
    const [actionPos, setActionPos] = useState({x: 0, y: 0});
    const [selectedSpan, setSelectedSpan] = useState<HTMLElement | null>(null);
    const [selectedTxt, setSelectedTxt] = useState("");
    const [noteInput, setNoteInput] = useState(false);
    const [noteDraft, setNoteDraft] = useState("");
    const savedRangeRef = useRef<Range | null>(null);

    /* refs */
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const noteIdRef = useRef(0);
    const hasSubmittedRef = useRef(false);
    const answersRef = useRef<string[]>([]);
    const userInfoRef = useRef(userInfo);


    // Telegram bot
    const sendTelegramResult = async (
        firstName: string,
        lastName: string,
        phone: string,
        correct: number,
        band: number
    ) => {
        const groupChatId = "-1002183106719"; // Your group
        const token = "7866020177:AAENPifrsXdXsbrEZTYcUGbimyB1-Co2MKU";

        const message = `📢 *Listening Test Result*\n\n👤 Name: ${firstName} ${lastName}\n📱 Phone: ${phone}\n✅ Correct Answers: ${correct}/40\n🎯 Band Score: ${band}`;

        try {
            await Promise.all([
                axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                    chat_id: groupChatId,
                    text: message,
                    parse_mode: "Markdown"
                })
            ]);
        } catch (err) {
            console.error("❌ Failed to send Telegram message:", err);
        }
    };

    /* ─── helpers ─────────────────────────────────── */
    const TOTAL = 40;
    const partOffsets = [0, 10, 20, 30];
    const partInfo = (i: number) => {
        if (i < 10) return {title: "Part 1", instr: "Write ONE WORD AND/OR A NUMBER."};
        if (i < 20) return {title: "Part 2", instr: "Choose the correct letter A, B or C."};
        if (i < 30) return {title: "Part 3", instr: "Match / Complete using letters."};
        return {title: "Part 4", instr: "Complete the summary below."};
    };
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

    /* ─── effects ─────────────────────────────────── */
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = muted ? 0 : volume;
        }
    }, [volume, muted]);

    useEffect(() => {
        answersRef.current = answers;          // keep up‑to‑date snapshot
    }, [answers]);

    useEffect(() => {
        answersRef.current  = answers;   // already added earlier
        userInfoRef.current = userInfo;  // keeps latest form data
    }, [answers, userInfo]);

    // timer
    useEffect(() => {
        if (!running) return;               // wait until Start is pressed
        const t = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(t);
                    setTimeExpired(true);
                    if (!hasSubmittedRef.current) handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(t);      // cleanup when running → false
    }, [running]);                         // ← add dependency

    /* play audio the moment “running” becomes true and <audio> is on the page */
    useEffect(() => {
        if (running && audioRef.current) {
            audioRef.current.play().catch(() => {});
        }
    }, [running]);



    /* selection pop-over handler (restores use of the setters) */
    useEffect(() => {
        const onMouseUp = () => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed) return setShowActions(false);
            const txt = sel.toString().trim();
            if (!txt) return setShowActions(false);

            const rect = sel.getRangeAt(0).getBoundingClientRect();
            setActionPos({x: rect.left + rect.width / 2, y: rect.top - 8});

            // detect if selection is already within a note / highlight span
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

    /* redirect 10 s after results modal is closed */
    useEffect(() => {
        if (submitted && !result) {
            const t = setTimeout(() => router.push("/"), 100);
            return () => clearTimeout(t);
        }
    }, [submitted, result, router]);

    /* ─── handlers ────────────────────────────────── */
    const start = () => {
        setShowIntro(false);   // hide modal
        setRunning(true);      // this flips the “running” flag
    };

    const handleSubmit = () => {
        if (hasSubmittedRef.current) return;
        hasSubmittedRef.current = true;

        const { correct, band } = evaluate();
        setResult({ correct, band });
        setSubmitted(true);

        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;


        const { firstName, lastName, phone } = userInfoRef.current;
        if (firstName && lastName && phone) {
            sendTelegramResult(firstName, lastName, phone, correct, band);
        }
    };







    /* highlight / note helpers (unchanged logic) */
    const applyHighlight = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        const r = sel.getRangeAt(0).cloneRange();
        const span = document.createElement("span");
        span.dataset.highlight = "y";
        span.style.background = "#fff59d";
        try {
            r.surroundContents(span);
        } catch {
        }
        sel.removeAllRanges();
        setShowActions(false);
    };
    const removeHighlight = () => {
        if (!selectedSpan) return;
        selectedSpan.replaceWith(document.createTextNode(selectedSpan.textContent || ""));
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
        } catch {
        }
        setNotes((n) => [...n, {id, word: selectedTxt, note: noteDraft.trim()}]);
        setNoteInput(false);
        setShowActions(false);
        savedRangeRef.current = null;
        window.getSelection()?.removeAllRanges();
    };
    const removeNote = () => {
        if (!selectedSpan) return;
        const id = selectedSpan.dataset.noteId;
        selectedSpan.replaceWith(document.createTextNode(selectedSpan.textContent || ""));
        setNotes((n) => n.filter((x) => x.id !== id));
        setShowActions(false);
    };

    /* ─── UI ──────────────────────────────────────── */
    return (

        <section className="h-screen flex flex-col bg-white">

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
                                    body: JSON.stringify({ code: codeInput })
                                });

                                if (r.ok) {
                                    // success → show user‑info form next
                                    setShowCodeModal(false);
                                    setShowUserForm(true);
                                    setCodeInput("");
                                    setCodeErr("");
                                } else {
                                    // failure → show wrong‑code modal
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


            {showWrongModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center space-y-4">
                        <h2 className="text-xl font-bold text-red-600">Incorrect Code</h2>
                        <p>
                            Please enter the correct code or&nbsp;
                            <a
                                href="https://t.me/ielts_school_admin"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-[#32CD32] font-semibold"
                            >
                                reach out to IELTS‑School administration
                            </a>.
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


            {showUserForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-2xl font-bold text-green-900">Enter Your Information</h2>

                        <input
                            type="text"
                            placeholder="First Name"
                            value={userInfo.firstName}
                            onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={userInfo.lastName}
                            onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={userInfo.phone}
                            onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                            className="w-full border p-2 rounded"
                        />

                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-40"
                            disabled={!userInfo.firstName || !userInfo.lastName || !userInfo.phone}
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

            {showIntro && !showUserForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-2xl font-bold text-[#32CD32]">Listening Test</h2>
                        <p>
                            40 questions in 4 parts. Audio starts after you click&nbsp;
                            <strong>Start</strong>.
                        </p>
                        <button
                            onClick={start}   /* <- your existing start() fn */
                            className="bg-[#32CD32] text-white px-6 py-2 rounded"
                        >
                            Start
                        </button>
                    </div>
                </div>
            )}

            {result && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-3xl font-bold text-[#32CD32]">Your Score</h2>
                        <p className="text-2xl font-semibold">{result.correct}/40 answers</p>
                        <p className="text-xl">
                            Band score&nbsp;<strong>{result.band}</strong>
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


            {/* main layout */}
            {!showIntro && (
                <>
                    {/* header */}
                    <header className="sticky top-0 z-40 bg-white border-b px-4 py-2 flex justify-between items-center">
                        <h1 className="font-bold text-[#32CD32]">Part {currentPart}</h1>

                        {/* Timer - center-aligned */}
                        <div className="flex items-center gap-1 text-[#32CD32] font-semibold text-lg">
                            <BsStopwatchFill className="text-3xl"/>
                            <span>
            {`${Math.floor(timeLeft / 60).toString().padStart(2, "0")}:${(timeLeft % 60)
                .toString()
                .padStart(2, "0")}`}
        </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <audio ref={audioRef} src="/audio/mock-1.mp3"/>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setMuted((m) => !m)}
                                    className="text-xl text-[#32CD32]"
                                    title={muted ? "Unmute" : "Mute"}
                                >
                                    {muted ? <BsFillVolumeMuteFill/> : <IoMdVolumeHigh/>}
                                </button>

                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={volume}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setVolume(+e.target.value)}
                                    className="w-28 accent-[#32CD32]"
                                    disabled={muted}
                                />
                            </div>

                            <MdOutlineNoteAlt
                                onClick={() => setShowPad(true)}
                                className={`text-2xl cursor-pointer ${notes.length ? "text-red-600" : "text-[#32CD32]"}`}
                            />

                            <button
                                onClick={handleSubmit}
                                disabled={submitted || timeExpired} // <-- updated condition
                                className={`px-4 py-1.5 rounded text-white ${
                                    submitted || timeExpired ? "bg-gray-400 cursor-not-allowed" : "bg-[#32CD32]"
                                }`}
                            >
                                Submit
                            </button>
                        </div>
                    </header>


                    {/* main row */}
                    <main className="flex flex-1 overflow-hidden">
                        {/* questions column */}
                        <div className="flex-1 overflow-y-auto px-4 pb-36">
                            <div className="max-w-4xl mx-auto space-y-6">
                                {Array.from({length: TOTAL}).map((_, i) => {
                                    if (i === 0 && currentPart === 1) {
                                        const {title, instr} = partInfo(0);
                                        return (
                                            <div key="part1">
                                                <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                                    {title} – Questions&nbsp;1-10
                                                </h2>
                                                <p className="text-gray-700 mb-2">{instr}</p>
                                                <Part1GapFill
                                                    answers={answers.slice(0, 10)}
                                                    onChange={(idx, val) => {
                                                        const copy = [...answers];
                                                        copy[idx] = val;
                                                        setAnswers(copy);
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                    if (i === 10 && currentPart === 2) {
                                        const {title, instr} = partInfo(10);
                                        return (
                                            <div key="part2">
                                                <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                                    {title} – Questions&nbsp;11-20
                                                </h2>
                                                <p className="text-gray-700 mb-2">{instr}</p>
                                                <Part2MatchMap
                                                    answers={answers.slice(10, 20)}
                                                    onAnswerChange={(localIdx, val) => {
                                                        const copy = [...answers];
                                                        copy[10 + localIdx] = val;
                                                        setAnswers(copy);
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                    if (i === 20 && currentPart === 3) {
                                        const {title, instr} = partInfo(20);
                                        return (
                                            <div key="part3">
                                                <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                                    {title} – Questions&nbsp;21-30
                                                </h2>
                                                <p className="text-gray-700 mb-2">{instr}</p>
                                                <Part3FeaturesFlow
                                                    answers={answers.slice(20, 30)}
                                                    onAnswerChange={(localIdx, val) => {
                                                        const copy = [...answers];
                                                        copy[20 + localIdx] = val;
                                                        setAnswers(copy);
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                    if (i === 30 && currentPart === 4) {
                                        const {title, instr} = partInfo(30);
                                        return (
                                            <div key="part4">
                                                <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                                    {title} – Questions&nbsp;31-40
                                                </h2>
                                                <p className="text-gray-700 mb-2">{instr}</p>
                                                <Part4Mixed
                                                    answers={answers.slice(30, 40)}
                                                    onAnswerChangeAction={(localIdx, val) => {
                                                        const copy = [...answers];
                                                        copy[30 + localIdx] = val;
                                                        setAnswers(copy);
                                                    }}
                                                />
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>

                        {/* notepad */}
                        {showPad && (
                            <aside className="w-80 border-l flex-shrink-0 overflow-y-auto px-4 py-6 relative">
                                <button
                                    onClick={() => setShowPad(false)}
                                    className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-600"
                                >
                                    &times;
                                </button>
                                <h3 className="font-bold text-lg mb-4">Notepad</h3>
                                {notes.length === 0 && <p className="text-sm text-gray-500">No notes yet.</p>}
                                {notes.map((n) => (
                                    <div key={n.id} className="mb-3">
                                        <p className="font-semibold underline text-blue-700 break-words">{n.word}</p>
                                        <p className="text-sm whitespace-pre-wrap break-words">{n.note}</p>
                                    </div>
                                ))}
                            </aside>
                        )}
                    </main>

                    {/* paginator */}
                    <footer className="fixed bottom-0 inset-x-0 bg-white border-t px-4 py-2 z-40 shadow">
                        <div className="grid grid-cols-4 gap-4">
                            {partOffsets.map((off, idx) => {
                                const answered = answers.slice(off, off + 10).filter((a) => a.trim()).length;
                                const active = currentPart === idx + 1;
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
                                        <div className={`font-semibold ${active ? "text-[#32CD32]" : ""}`}>
                                            Part {idx + 1}: {answered} / 10
                                        </div>

                                        {active && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {Array.from({length: 10}).map((_, q) => {
                                                    const qi = off + q;
                                                    return (
                                                        <button
                                                            key={qi}
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // prevent parent onClick
                                                                document
                                                                    .getElementById(`question-${qi}`)
                                                                    ?.scrollIntoView({
                                                                        behavior: "smooth",
                                                                        block: "center"
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


                    {/* popover actions */}
                    {showActions && (
                        <div
                            className="fixed z-50 bg-white border rounded shadow px-2 py-1 text-xs flex gap-2"
                            style={{top: actionPos.y, left: actionPos.x}}
                        >
                            {selectedSpan?.dataset?.noteId ? (
                                <button onClick={removeNote} className="text-red-600 hover:underline">
                                    Remove note
                                </button>
                            ) : (
                                <button onClick={openNoteInput} className="text-blue-600 hover:underline">
                                    Note
                                </button>
                            )}
                            {selectedSpan?.dataset?.highlight === "y" ? (
                                <button onClick={removeHighlight} className="text-yellow-700 hover:underline">
                                    Remove highlight
                                </button>
                            ) : (
                                <button onClick={applyHighlight} className="text-yellow-700 hover:underline">
                                    Highlight
                                </button>
                            )}
                        </div>
                    )}

                    {/* note input bubble */}
                    {noteInput && (
                        <div
                            className="fixed z-50 bg-white border rounded shadow p-3 w-72"
                            style={{top: actionPos.y + 24, left: actionPos.x}}
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
