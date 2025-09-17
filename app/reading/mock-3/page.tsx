// app/reading/mock-3/page.tsx
"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { BsStopwatchFill } from "react-icons/bs";
import { MdOutlineNoteAlt } from "react-icons/md";
import { AiOutlineDoubleLeft, AiOutlineDoubleRight } from "react-icons/ai";
import axios from "axios";

/* 🔽 Mock-3 data (JSON) */
import rawReadingData from "@/data/reading/mock-3.json";

/* 🔽 Passage-level components (you’ll create these) */
import Passage1Section from "@/components/mock3-reading/Passage1Section";
import Passage2Section from "@/components/mock3-reading/Passage2Section";
import Passage3Section from "@/components/mock3-reading/Passage3Section";

/* ─────────────────── Types ─────────────────── */
export interface Question {
    number: number;
    type: string;
    question: string;
    options?: string[] | Record<string, string>;
    answer?: string | string[];
    image?: string;
}
export interface PassageData {
    title: string;
    passage?: string;
    questions: Question[];
    passageSections?: { label: string; text: string }[];
    wordBank?: { letter: string; word: string }[];
}

/* ───────────────── Answer helpers ───────────────── */
const norm = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, " ").replace(/£|\$/g, "");
const canonTF = (s: string) => {
    const v = norm(s);
    if (["true", "t", "yes", "y"].includes(v)) return "true";
    if (["false", "f", "no", "n"].includes(v)) return "false";
    if (["not given", "ng", "n.g."].includes(v)) return "not given";
    return v;
};

/* ───────────────── IELTS band table ───────────────── */
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

/* ───────────────── Correct answer overrides (Mock-3, Q1-40) ─────────────────
   Based on your photo key.
*/
const CORRECT_ANS_OVERRIDES: Record<number, string> = {
    // Section 1 (Q1–13)
    1: "E",
    2: "H",
    3: "I",
    4: "D",
    5: "G",
    6: "YEAST" ,
    7: "BACTERIA",
    8: "PROTEIN",
    9: "CHEMICAL SOLVENTS",
    10: "SMALL HOLES",
    11: "FALSE",
    12: "TRUE",
    13: "NOT GIVEN",

    // Section 2 (Q14–26)
    14: "A",
    15: "D",
    16: "B",
    17: "C",
    18: "C",
    19: "D",
    20: "C",
    21: "B",
    22: "EGYPT",
    23: "MONKS",
    24: "PTOLEMY",
    25: "NAVIGATION SATELLITES",
    26: "SOME CARS",

    // Section 3 (Q27–40)
    27: "iv",
    28: "vii",
    29: "v",
    30: "i",
    31: "iii",
    32: "B",
    33: "B",
    34: "D",
    35: "A",
    36: "D",
    37: "FALSE",
    38: "NOT GIVEN",
    39: "TRUE",
    40: "FALSE",
};

/* Extra acceptable variants for short answers */
const ALT_EQUIV: Record<number, string[]> = {
    10: ["holes", "small holes", "tiny holes"],
    9: ["solvents", "chemical solvent", "chemicals solvents"],
    25: ["satellites", "navigation satellite", "gps satellites", "gps"],
    26: ["cars", "some cars"],
};

/* ───────────────── Telegram ───────────────── */
const TELEGRAM_TOKEN =
    "7866020177:AAENPifrsXdXsbrEZTYcUGbimyB1-Co2MKU"; // TODO: env
const TELEGRAM_GROUP_CHAT_ID = "-4764694665"; // same group as mock-2 reading

async function sendTelegramResult(
    firstName: string,
    lastName: string,
    phone: string,
    correct: number,
    band: number
) {
    const text =
        `📘 *Reading Test 3 Result*\n\n` +
        `👤 Name: ${firstName} ${lastName}\n` +
        `📱 Phone: ${phone}\n` +
        `✅ Correct Answers: ${correct}/40\n` +
        `🌟 Band Score: ${band}`;
    try {
        await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
            { chat_id: TELEGRAM_GROUP_CHAT_ID, text, parse_mode: "Markdown" }
        );
    } catch (e) {
        console.error("Telegram error", e);
    }
}

/* ───────────────── Small render helpers (fallbacks) ───────────────── */
type OnAnsFn = (val: string) => void;

function TextAnswer({
                        value,
                        onChange,
                        width = 160,
                        placeholder,
                    }: {
    value: string;
    onChange: OnAnsFn;
    width?: number;
    placeholder?: string;
}) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width }}
            placeholder={placeholder}
            className="border-0 border-b border-dotted border-gray-600 focus:border-[#32CD32] outline-none text-center text-sm"
        />
    );
}
function TFNGAnswer({
                        value,
                        onChange,
                        labels = ["TRUE", "FALSE", "NOT GIVEN"],
                        name,
                    }: {
    value: string;
    onChange: OnAnsFn;
    labels?: string[];
    name: string;
}) {
    return (
        <ul className="mt-1 space-y-1 pl-6 text-sm">
            {labels.map((lbl) => (
                <li key={lbl} className="flex items-start gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="radio"
                            name={name}
                            value={lbl}
                            checked={canonTF(value) === canonTF(lbl)}
                            onChange={() => onChange(lbl)}
                        />
                        <span className="font-semibold">{lbl}</span>
                    </label>
                </li>
            ))}
        </ul>
    );
}
function MCQAnswer({
                       value,
                       onChange,
                       options,
                       name,
                   }: {
    value: string;
    onChange: OnAnsFn;
    options: string[];
    name: string;
}) {
    return (
        <ul className="mt-1 space-y-1 pl-6 text-sm">
            {options.map((opt) => (
                <li key={opt} className="flex items-start gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="radio"
                            name={name}
                            value={opt}
                            checked={norm(value) === norm(opt)}
                            onChange={() => onChange(opt)}
                        />
                        <span className="font-bold">{opt}</span>
                    </label>
                </li>
            ))}
        </ul>
    );
}
function QuestionBlock({
                           q,
                           ans,
                           onChange,
                       }: {
    q: Question;
    ans: string;
    onChange: OnAnsFn;
}) {
    const name = `q-${q.number}`;
    const t = q.type.toUpperCase();

    if (t.includes("TRUE_FALSE_NOT_GIVEN")) {
        return (
            <div id={`question-${q.number - 1}`} className="mt-4">
                <p className="font-semibold">
                    {q.number}. {q.question}
                </p>
                <TFNGAnswer name={name} value={ans} onChange={onChange} />
            </div>
        );
    }
    if (t.includes("YES_NO_NOT_GIVEN")) {
        return (
            <div id={`question-${q.number - 1}`} className="mt-4">
                <p className="font-semibold">
                    {q.number}. {q.question}
                </p>
                <TFNGAnswer
                    name={name}
                    value={ans}
                    onChange={onChange}
                    labels={["YES", "NO", "NOT GIVEN"]}
                />
            </div>
        );
    }
    if (t.includes("MULTIPLE_CHOICE")) {
        return (
            <div id={`question-${q.number - 1}`} className="mt-4">
                <p className="font-semibold">
                    {q.number}. {q.question}
                </p>
                <MCQAnswer
                    name={name}
                    value={ans}
                    onChange={onChange}
                    options={(q.options as string[]) || []}
                />
            </div>
        );
    }
    if (t.includes("FILL_IN_THE_BLANK")) {
        const segs = q.question.split(/_{3,}/);
        return (
            <div id={`question-${q.number - 1}`} className="mt-4">
                <p className="font-semibold mb-1">
                    {q.number}.{" "}
                    {segs.map((part, i) => (
                        <React.Fragment key={i}>
                            {part}
                            {i < segs.length - 1 && (
                                <TextAnswer
                                    value={ans}
                                    onChange={onChange}
                                    placeholder={`${q.number}`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </p>
            </div>
        );
    }
    return (
        <div id={`question-${q.number - 1}`} className="mt-4">
            <p className="font-semibold mb-1">
                {q.number}. {q.question}
            </p>
            <TextAnswer value={ans} onChange={onChange} placeholder={`${q.number}`} />
        </div>
    );
}

/* ───────────────── Passage renderers for header panel ───────────────── */
function PassageView({ passage }: { passage: string }) {
    const paras = passage.trim().split(/\n\s*\n/);
    return (
        <article className="prose prose-sm max-w-none [&_p]:my-3">
            {paras.map((p, i) => (
                <p key={i}>{p.trim()}</p>
            ))}
        </article>
    );
}
function PassageSectionsView({
                                 sections,
                             }: {
    sections: { label: string; text: string }[];
}) {
    return (
        <article className="prose prose-sm max-w-none [&_p]:my-3">
            {sections.map((s) => (
                <p key={s.label}>
                    <strong>{s.label}</strong> {s.text?.trim() ?? ""}
                </p>
            ))}
        </article>
    );
}

/* ───────────────── JSON helper ───────────────── */
function getReadingRoot(data: unknown): PassageData[] {
    const root = data as Record<string, unknown>;
    if (Array.isArray(root?.reading))
        return ((root.reading[0] as { passages: PassageData[] }).passages);
    if (Array.isArray(root?.passages)) return root.passages as PassageData[];
    return [];
}

/* ───────────────── Component ───────────────── */
export default function ReadingMock3() {
    const router = useRouter();

    /* ---- source data ---- */
    const passages = useMemo(() => getReadingRoot(rawReadingData), []);

    /* ---- derived counts ---- */
    const partOffsets = useMemo(() => {
        const offs: number[] = [];
        let acc = 0;
        passages.forEach((p) => {
            offs.push(acc);
            acc += p.questions.length;
        });
        return offs;
    }, [passages]);

    const TOTAL = useMemo(
        () => passages.reduce((sum, p) => sum + p.questions.length, 0),
        [passages]
    );

    /* ---- state ---- */
    const [showCodeModal, setShowCodeModal] = useState(true);
    const [showUserForm, setShowUserForm] = useState(false);
    const [showIntro, setShowIntro] = useState(false);

    const [codeInput, setCodeInput] = useState("");
    const [codeErr, setCodeErr] = useState("");
    const [showWrongModal, setShowWrongModal] = useState(false);

    const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        phone: "",
    });

    const [currentPart, setCurrentPart] = useState<0 | 1 | 2>(0);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<string[]>(Array(TOTAL).fill(""));
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<{ correct: number; band: number } | null>(
        null
    );

    const [timeLeft, setTimeLeft] = useState(60 * 60);
    const [running, setRunning] = useState(false);
    const [timeExpired, setTimeExpired] = useState(false);

    /* ---- notes / highlights ---- */
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
    const hasSubmittedRef = useRef(false);
    const answersRef = useRef<string[]>([]);
    const userInfoRef = useRef(userInfo);

    /* ---- resizable split ---- */
    const [splitPct, setSplitPct] = useState<number>(50);
    const [isResizing, setIsResizing] = useState(false);
    const splitWrapRef = useRef<HTMLDivElement | null>(null);
    const skipSelRef = useRef(false);
    const prevBodySelectRef = useRef<string>("");

    const onSplitStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const sel = window.getSelection();
        if (sel) sel.removeAllRanges();
        prevBodySelectRef.current = document.body.style.userSelect;
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";
        skipSelRef.current = true;
        setIsResizing(true);
    }, []);
    const onSplitMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !splitWrapRef.current) return;
            const rect = splitWrapRef.current.getBoundingClientRect();
            const rawPct = ((e.clientX - rect.left) / rect.width) * 100;
            const clamped = Math.min(75, Math.max(25, rawPct));
            setSplitPct(clamped);
            window.getSelection()?.removeAllRanges();
        },
        [isResizing]
    );
    const endSplitDrag = useCallback(() => {
        if (!isResizing) return;
        setIsResizing(false);
        skipSelRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = prevBodySelectRef.current;
        window.getSelection()?.removeAllRanges();
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", onSplitMove);
        window.addEventListener("mouseup", endSplitDrag);
        return () => {
            window.removeEventListener("mousemove", onSplitMove);
            window.removeEventListener("mouseup", endSplitDrag);
        };
    }, [onSplitMove, endSplitDrag]);

    /* ---- timer ---- */
    useEffect(() => {
        if (!running) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeExpired(true);
                    if (!hasSubmittedRef.current) handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [running]);

    useEffect(() => {
        answersRef.current = answers;
        userInfoRef.current = userInfo;
    }, [answers, userInfo]);

    /* ---- selection popover ---- */
    useEffect(() => {
        const onMouseUp = () => {
            if (skipSelRef.current) {
                setShowActions(false);
                return;
            }
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

    /* ---- redirect after closing results ---- */
    useEffect(() => {
        if (submitted && !result) {
            const t = setTimeout(() => router.push("/"), 100);
            return () => clearTimeout(t);
        }
    }, [submitted, result, router]);

    /* ---- evaluation ---- */
    const evaluate = () => {
        let correct = 0;
        const handled = new Set<number>();

        // Special pair: Q6 & Q7 = {yeast, bacteria} in any order
        const a6 = norm(answersRef.current[5] || "");
        const a7 = norm(answersRef.current[6] || "");
        const validPair = new Set(["yeast", "bacteria"]);
        const uniq = new Set<string>();
        if (validPair.has(a6)) uniq.add(a6);
        if (validPair.has(a7)) uniq.add(a7);
        correct += uniq.size; // 0, 1 or 2
        handled.add(6);
        handled.add(7);

        // General per-question check
        passages.forEach((p) => {
            p.questions.forEach((q) => {
                const n = q.number;
                if (handled.has(n)) return;

                const idx = n - 1;
                const given = answersRef.current[idx] ?? "";
                const override = CORRECT_ANS_OVERRIDES[n];
                const actualRaw = override ?? q.answer;
                const actual = Array.isArray(actualRaw)
                    ? actualRaw.join(" ")
                    : actualRaw ?? "";

                const t = q.type.toUpperCase();

                if (t.includes("TRUE_FALSE") || t.includes("YES_NO")) {
                    if (canonTF(given) === canonTF(actual)) correct++;
                    return;
                }

                // Accept alt spellings/variants
                const alts = ALT_EQUIV[n] || [];
                const normGiven = norm(given);
                if (alts.map(norm).includes(normGiven)) {
                    correct++;
                    return;
                }

                if (normGiven === norm(actual)) correct++;
            });
        });

        const band =
            BAND_TABLE.find((r) => correct >= r.min && correct <= r.max)?.band ?? 0;
        return { correct, band };
    };

    const handleSubmit = () => {
        if (hasSubmittedRef.current) return;
        hasSubmittedRef.current = true;

        const { correct, band } = evaluate();
        setResult({ correct, band });
        setSubmitted(true);

        const { firstName, lastName, phone } = userInfoRef.current;
        if (firstName && lastName && phone) {
            sendTelegramResult(firstName, lastName, phone, correct, band);
        }
    };

    /* ---- note/highlight helpers ---- */
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
            /* ignore */
        }
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
        } catch {
            /* ignore */
        }
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

    /* ---- header label & current passage meta ---- */
    const headerLabel = `Passage ${currentPart + 1}`;
    const part = passages[currentPart];
    const questionRangeLabel = part
        ? `Questions ${part.questions[0].number}-${part.questions[part.questions.length - 1].number}`
        : "";

    /* ---- UI ---- */
    return (
        <section className="h-screen flex flex-col bg-white">
            {/* 1) ACCESS CODE */}
            {showCodeModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow max-w-xs w-full space-y-4 text-center">
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
                                const res = await fetch("/api/verify-code", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ code: codeInput }),
                                });

                                if (res.ok) {
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

            {/* Wrong-code */}
            {showWrongModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow max-w-xs w-full space-y-4 text-center">
                        <h2 className="text-xl font-bold text-red-600">Invalid Code</h2>
                        <p>
                            Please enter the correct code or{" "}
                            <a
                                href="https://t.me/ielts_school"
                                target="_blank"
                                rel="noopener"
                                className="text-blue-600 underline"
                            >
                                reach out to IELTS-School administration
                            </a>
                            .
                        </p>

                        <button
                            className="bg-gray-300 px-4 py-1 rounded w-full"
                            onClick={() => {
                                setShowWrongModal(false);
                                setShowCodeModal(true);
                                setCodeInput("");
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* 2) USER INFO */}
            {showUserForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-2xl font-bold text-green-900">
                            Enter Your Information
                        </h2>
                        <p className="text-sm text-gray-600">
                            Note: Reading test duration is 1&nbsp;hour.
                        </p>

                        <input
                            type="text"
                            placeholder="First Name"
                            value={userInfo.firstName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setUserInfo({ ...userInfo, firstName: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={userInfo.lastName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setUserInfo({ ...userInfo, lastName: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={userInfo.phone}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setUserInfo({ ...userInfo, phone: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        />

                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded w-full disabled:opacity-40"
                            disabled={!userInfo.firstName || !userInfo.lastName || !userInfo.phone}
                            onClick={() => {
                                setShowUserForm(false);
                                setShowIntro(true);
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* 3) START MODAL */}
            {showIntro && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-2xl font-bold text-[#32CD32]">Reading Test</h2>
                        <p>
                            3 passages / 40 questions. Timer starts when you click{" "}
                            <strong>Start</strong>.
                        </p>

                        <button
                            className="bg-[#32CD32] text-white px-6 py-2 rounded"
                            onClick={() => {
                                setShowIntro(false);
                                setRunning(true);
                            }}
                        >
                            Start
                        </button>
                    </div>
                </div>
            )}

            {/* 4) RESULT */}
            {result && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-3xl font-bold text-[#32CD32]">Your Score</h2>
                        <p className="text-2xl font-semibold">{result.correct}/40 answers</p>
                        <p className="text-xl">
                            Band score&nbsp;<strong>{result.band}</strong>
                        </p>

                        <button
                            className="bg-[#32CD32] text-white px-6 py-2 rounded"
                            onClick={() => {
                                setResult(null);
                                setTimeout(() => router.push("/"), 10_000);
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* ───────────── Main Layout ───────────── */}
            {!showIntro && !showUserForm && (
                <>
                    {/* header */}
                    <header className="sticky top-0 z-40 bg-white border-b px-4 py-2 flex justify-between items-center">
                        <h1 className="font-bold text-[#32CD32]">{headerLabel}</h1>

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

                        <div className="flex items-center gap-3">
                            <MdOutlineNoteAlt
                                onClick={() => setShowPad(true)}
                                className={`text-2xl cursor-pointer ${
                                    notes.length ? "text-red-600" : "text-[#32CD32]"
                                }`}
                                title="Open notepad"
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

                    {/* main row with draggable split */}
                    <main ref={splitWrapRef} className="flex flex-1 overflow-hidden relative">
                        {/* passage panel (md+) */}
                        <div
                            className="h-full overflow-y-auto px-4 pb-36 border-r hidden md:block"
                            style={{
                                width: `${splitPct}%`,
                                transition: isResizing ? "none" : "width 150ms ease",
                                userSelect: "text",
                            }}
                        >
                            <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                {part?.title ?? ""}
                            </h2>
                            {part?.passageSections ? (
                                <PassageSectionsView sections={part.passageSections} />
                            ) : part?.passage ? (
                                <PassageView passage={part.passage} />
                            ) : null}
                        </div>

                        {/* drag handle */}
                        <div
                            className="hidden md:flex absolute top-0 bottom-0 z-20 items-center justify-center w-3 cursor-col-resize group select-none"
                            style={{ left: `${splitPct}%`, marginLeft: "-6px" }}
                            onMouseDown={onSplitStart}
                            onDoubleClick={() => setSplitPct(50)}
                            title="Drag to resize panels (double-click to reset)"
                        >
                            <div className="h-full w-[3px] bg-gray-300 group-hover:bg-[#32CD32]" />
                            <AiOutlineDoubleLeft className="absolute -left-3 text-xs text-[#32CD32] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <AiOutlineDoubleRight className="absolute -right-3 text-xs text-[#32CD32] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>

                        {/* questions panel */}
                        <div
                            className="flex-1 h-full overflow-y-auto px-4 md:px-8 pb-36"
                            style={{
                                transition: isResizing ? "none" : "width 150ms ease",
                                userSelect: "text",
                            }}
                        >
                            <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                {questionRangeLabel}
                            </h2>

                            {currentPart === 0 ? (
                                <Passage1Section
                                    part={passages[0]}
                                    answers={answers}
                                    onAnswerChange={(idx, val) => {
                                        const copy = [...answers];
                                        copy[idx] = val;
                                        setAnswers(copy);
                                    }}
                                />
                            ) : currentPart === 1 ? (
                                <Passage2Section
                                    answers={answers}
                                    onAnswerChange={(idx, val) =>
                                        setAnswers((prev) => {
                                            const copy = [...prev];
                                            copy[idx] = val;
                                            return copy;
                                        })
                                    }
                                />
                            ) : currentPart === 2 ? (
                                <Passage3Section
                                    part={passages[2]}
                                    answers={answers}
                                    onAnswerChange={(idx, val) =>
                                        setAnswers((prev) => {
                                            const copy = [...prev];
                                            copy[idx] = val;
                                            return copy;
                                        })
                                    }
                                />
                            ) : (
                                /* Fallback generic */
                                part?.questions?.map((q) => (
                                    <QuestionBlock
                                        key={q.number}
                                        q={q}
                                        ans={answers[q.number - 1]}
                                        onChange={(val) => {
                                            const copy = [...answers];
                                            copy[q.number - 1] = val;
                                            setAnswers(copy);
                                        }}
                                    />
                                ))
                            )}
                        </div>

                        {/* notepad */}
                        {showPad && (
                            <aside className="w-80 border-l flex-shrink-0 overflow-y-auto px-4 py-6 relative hidden lg:block">
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

                    {/* paginator */}
                    <footer className="fixed inset-x-0 bottom-0 bg-white border-t shadow z-20">
                        <div className="flex gap-3 px-2 sm:px-4 py-1 overflow-x-auto">
                            {partOffsets.map((off, idx) => {
                                const nextOff =
                                    idx + 1 < partOffsets.length ? partOffsets[idx + 1] : TOTAL;
                                const answered = answers
                                    .slice(off, nextOff)
                                    .filter((a) => a.trim()).length;
                                const active = currentPart === idx;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setCurrentPart(idx as 0 | 1 | 2);
                                            setCurrentIdx(off);
                                        }}
                                        className={`cursor-pointer transition-all duration-150 select-none ${
                                            active
                                                ? "flex-1 min-w-[280px] border border-green-400 rounded-lg px-3 py-2"
                                                : "min-w-[160px] border border-gray-300 rounded-lg px-3 py-2"
                                        }`}
                                    >
                                        <div
                                            className={`whitespace-nowrap font-semibold leading-none ${
                                                active ? "text-[#32CD32]" : ""
                                            }`}
                                        >
                                            Passage {idx + 1}: {answered} / {nextOff - off}
                                        </div>

                                        {active && (
                                            <div className="mt-1 flex gap-0.5 overflow-x-auto">
                                                {Array.from({ length: nextOff - off }).map((_, q) => {
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
                                                            className={`w-6 h-6 rounded-full border text-xs leading-none ${
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
                            style={{ top: actionPos.y, left: actionPos.x }}
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
