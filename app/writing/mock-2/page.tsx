// =============================================================
// Writing Mock 1
// =============================================================
// UI patterned after your Reading mock (resizable split, header timer,
// bottom task tabs). No highlight / note features.
//
// Data loads from @/data/writing/mock-1.json (supports array OR legacy schema).
// =============================================================

"use client";

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    ChangeEvent,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsStopwatchFill } from "react-icons/bs";
import { AiOutlineDoubleLeft, AiOutlineDoubleRight } from "react-icons/ai";
import axios from "axios";

import writingDataJson from "@/data/writing/mock-2.json";

/* ─────────────────── Types ─────────────────── */
export interface WritingTask {
    id: string;
    title: string;
    minWords: number;
    instructions: string[];
    image?: string;
}

export interface WritingMockData {
    durationMinutes: number;
    tasks: WritingTask[];
}

/* ─────────────────── Fallback Data ─────────────────── */
const FALLBACK_WRITING_DATA: WritingMockData = {
    durationMinutes: 60,
    tasks: [
        {
            id: "task1",
            title: "Writing Task 1",
            minWords: 150,
            instructions: [
                "You should spend about 20 minutes on this task.",
                "The charts below show the different forms in which fish were sold in 1950 and 1985.",
                "Summarise the information by selecting and reporting the main features, and making comparisons where relevant.",
                "Write at least 150 words."
            ],
            image: "/fish-sales-charts.png"  // replace with your actual graphic path
        },
        {
            id: "task2",
            title: "Writing Task 2",
            minWords: 250,
            instructions: [
                "You should spend about 40 minutes on this task.",
                "Some of the world’s languages are now spoken very little, so steps should be taken to prevent their complete decline.",
                "To what extent do you agree or disagree?",
                "Give reasons for your answer, and include any relevant examples from your own knowledge or experience.",
                "Write at least 250 words."
            ]
        }
    ]
};


/* ─────────────────── Schema Guards ─────────────────── */
interface ArraySchema {
    durationMinutes?: number;
    tasks: unknown[];
}
interface LegacySchema {
    durationMinutes?: number;
    task1?: Partial<WritingTask>;
    task2?: Partial<WritingTask>;
    [k: string]: unknown;
}

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}
function isArraySchema(v: unknown): v is ArraySchema {
    return isRecord(v) && Array.isArray((v as Record<string, unknown>).tasks);
}
function isLegacySchema(v: unknown): v is LegacySchema {
    return (
        isRecord(v) &&
        ("task1" in v || "task2" in v)
    );
}

/* ─────────────────── Adapt / Pick JSON if valid ─────────────────── */
const WRITING_DATA: WritingMockData = (() => {
    try {
        const raw: unknown = writingDataJson as unknown;

        // New schema?
        if (isArraySchema(raw)) {
            const dur = Number(raw.durationMinutes ?? 60);
            const tasks = raw.tasks.map((t, i): WritingTask => {
                const obj = isRecord(t) ? t : {};
                return {
                    id: String((obj.id as string) ?? (i === 0 ? "task1" : "task2")),
                    title: String((obj.title as string) ?? (i === 0 ? "Writing Task 1" : "Writing Task 2")),
                    minWords: Number((obj.minWords as number) ?? (i === 0 ? 150 : 250)),
                    instructions: Array.isArray(obj.instructions)
                        ? (obj.instructions as unknown[]).map(String)
                        : [],
                    image: obj.image ? String(obj.image as string) : undefined,
                };
            });
            return { durationMinutes: dur, tasks };
        }

        // Legacy schema?
        if (isLegacySchema(raw)) {
            const dur = Number(raw.durationMinutes ?? 60);
            const t1 = (raw.task1 ?? {}) as Record<string, unknown>;
            const t2 = (raw.task2 ?? {}) as Record<string, unknown>;
            const tasks: WritingTask[] = [
                {
                    id: "task1",
                    title: String((t1.title as string) ?? "Writing Task 1"),
                    minWords: Number((t1.minWords as number) ?? 150),
                    instructions: Array.isArray(t1.instructions)
                        ? (t1.instructions as unknown[]).map(String)
                        : [],
                    image: t1.image ? String(t1.image as string) : undefined,
                },
                {
                    id: "task2",
                    title: String((t2.title as string) ?? "Writing Task 2"),
                    minWords: Number((t2.minWords as number) ?? 250),
                    instructions: Array.isArray(t2.instructions)
                        ? (t2.instructions as unknown[]).map(String)
                        : [],
                    image: t2.image ? String(t2.image as string) : undefined,
                },
            ];
            return { durationMinutes: dur, tasks };
        }
    } catch {
        /* ignore */
    }
    return FALLBACK_WRITING_DATA;
})();

/* ─────────────────── Telegram ─────────────────── */
// ⚠️ Update these before production (env vars).
const TELEGRAM_TOKEN = "7866020177:AAENPifrsXdXsbrEZTYcUGbimyB1-Co2MKU";
const TELEGRAM_CHAT_ID = "-4811826093"; // group or personal id

const TG_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;


// Helper: send one message (optionally with Markdown)
async function tgSend(text: string, parseMode?: "Markdown") {
    const res = await fetch(`${TG_API}/sendMessage`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: parseMode })
    });

    if (!res.ok) {                     // surface API errors for easier debugging
        console.error(
            "Telegram error",
            res.status,
            await res.text().catch(() => "<no‑body>")
        );
    }
}

/** Telegram allows max 4096 chars per message. We split long text safely. */
async function tgSendLong(label: string, body: string) {
    if (!body.trim()) {
        await tgSend(`${label}: (empty)`);
        return;
    }
    const prefix = `${label}:\n`;
    const MAX = 4000; // keep headroom
    let i = 0;
    while (i < body.length) {
        const chunk = body.slice(i, i + MAX);
        await tgSend(i === 0 ? prefix + chunk : chunk);
        i += MAX;
    }
}

/** Main send wrapper for Writing submission. */
async function sendWritingToTelegram(payload: {
    firstName: string;
    lastName: string;
    phone: string;
    task1Words: number;
    task2Words: number;
    task1Text: string;
    task2Text: string;
}) {
    const { firstName, lastName, phone, task1Words, task2Words, task1Text, task2Text } =
        payload;

    // Basic Markdown header (strip troublesome chars)
    const esc = (s: string) => s.replace(/[`_*]/g, "");
    const header =
        `✍️ *Writing Test Submission*\n\n` +
        `👤 *Name:* ${esc(firstName)} ${esc(lastName)}\n` +
        `📱 *Phone:* ${esc(phone)}\n\n` +
        `📝 *Task 1 Words:* ${task1Words}\n` +
        `📝 *Task 2 Words:* ${task2Words}`;

    try {
        // Header (Markdown)
        await tgSend(header, "Markdown");
        // Task 1 (plain)
        await tgSendLong("Task 1 Response", task1Text);
        // Task 2 (plain)
        await tgSendLong("Task 2 Response", task2Text);
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            console.error("Telegram send error:", err.response?.data ?? err.message);
        } else {
            console.error("Telegram send error:", err);
        }
    }
}

/* ─────────────────── Word Counter ─────────────────── */
function countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

/* ─────────────────── Instruction Renderers ─────────────────── */
function InstructionsBlock({ task }: { task: WritingTask }) {
    return (
        <div className="space-y-4 mt-8">
            <h2 className="text-3xl font-bold text-[#32CD32]">{task.title}</h2>
            {task.instructions.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed">
                    {p}
                </p>
            ))}

            {task.image && (
                <div className="mt-6 flex justify-center">
                    <Image
                        src={"/fish-sales-charts.png"}
                        alt="Task graphic"
                        width={700}
                        height={400}
                        className="max-w-full h-auto border rounded shadow"
                    />
                </div>
            )}
        </div>
    );
}

/* ─────────────────── Answer Panel ─────────────────── */
interface AnswerPanelProps {
    value: string;
    minWords: number;
    onChange: (v: string) => void;
    placeholder?: string;
}

function AnswerPanel({ value, minWords, onChange, placeholder }: AnswerPanelProps) {
    const wc = countWords(value);
    const ok = wc >= minWords;
    return (
        <div className="mt-8">
      <textarea
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[60vh] md:h-[70vh] border border-gray-300 rounded p-4 text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
      />
            <div className="mt-2 text-sm">
        <span className={ok ? "text-green-700" : "text-red-600 font-semibold"}>
          Words: {wc}
        </span>
                <span className="ml-2 text-gray-500">(minimum {minWords})</span>
            </div>
        </div>
    );
}

/* ─────────────────── Mobile Instruction Drawer ─────────────────── */
function MobileTaskDrawer({
                              open,
                              onClose,
                              task,
                          }: {
    open: boolean;
    onClose: () => void;
    task: WritingTask;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden" onClick={onClose}>
            <div
                className="absolute inset-x-0 bottom-0 max-h-[85%] bg-white rounded-t-lg p-4 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-4 text-2xl leading-none"
                    onClick={onClose}
                >
                    ×
                </button>
                <InstructionsBlock task={task} />
            </div>
        </div>
    );
}

/* ─────────────────── Main Component ─────────────────── */
export default function WritingMock2() {
    const router = useRouter();
    const data = WRITING_DATA;
    const tasks = data.tasks.slice(0, 2);
    const durationSec = (data.durationMinutes || 60) * 60;

    /* ---- user form ---- */


    const [userInfo, setUserInfo] = useState({ firstName: "", lastName: "", phone: "" });

    /* ---- timer ---- */
    const [running, setRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(durationSec);
    const [timeExpired, setTimeExpired] = useState(false);

    /* ---- task answers ---- */
    const [taskIdx, setTaskIdx] = useState<0 | 1>(0);
    const [answers, setAnswers] = useState<string[]>(["", ""]);

    /* ---- mobile drawer ---- */
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    /* ---- save indicator ---- */
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
    const saveTimerRef = useRef<number | null>(null);
    /* ---- access flow ---- */
    const [showCodeModal, setShowCodeModal] = useState(true);     // step 1: code
    const [codeInput, setCodeInput]         = useState("");
    const [codeErr,   setCodeErr]           = useState("");
    const [showWrongModal, setShowWrongModal] = useState(false);  // wrong‑code dialog

    /* ---- user form ---- */
    const [showUserForm, setShowUserForm] = useState(false);      // step 2: form
    const [showIntro,   setShowIntro]     = useState(false);      // step 3: start modal

    // --- refs for safe auto‑submit ---
    const hasSubmittedRef = useRef(false);
    const answersRef      = useRef<string[]>([]);
    const userInfoRef     = useRef(userInfo);


    const LOCAL_KEY = "writing-mock1-answers";
    const LOCAL_USER_KEY = "writing-mock1-user";

    /* Load from localStorage */
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr) && arr.length >= 2) {
                    setAnswers([String(arr[0] || ""), String(arr[1] || "")]);
                }
            }
            const userRaw = localStorage.getItem(LOCAL_USER_KEY);
            if (userRaw) {
                const u = JSON.parse(userRaw);
                setUserInfo({
                    firstName: u.firstName || "",
                    lastName: u.lastName || "",
                    phone: u.phone || "",
                });
            }
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        answersRef.current  = answers;
        userInfoRef.current = userInfo;
    }, [answers, userInfo]);

    /* Persist answers */
    const scheduleSave = useCallback((newAnswers: string[]) => {
        setSaveState("saving");
        if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = window.setTimeout(() => {
            try {
                localStorage.setItem(LOCAL_KEY, JSON.stringify(newAnswers));
                setSaveState("saved");
                window.setTimeout(() => setSaveState("idle"), 3000);
            } catch {
                setSaveState("idle");
            }
        }, 500);
    }, []);

    const scheduleSaveUser = useCallback(
        (u: { firstName: string; lastName: string; phone: string }) => {
            try {
                localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
            } catch {
                /* ignore */
            }
        },
        []
    );

    /* Timer tick */
    useEffect(() => {
        if (!running) return;

        const id = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    window.clearInterval(id);
                    setTimeExpired(true);

                    if (!hasSubmittedRef.current) handleSubmit();   // auto‑submit once
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(id);
    }, [running]);


    /* ---- resizable split (desktop) ---- */
    const [splitPct, setSplitPct] = useState<number>(50);
    const [isResizing, setIsResizing] = useState(false);
    const splitWrapRef = useRef<HTMLDivElement | null>(null);
    const prevBodySelectRef = useRef<string>("");
    const skipSelRef = useRef(false);

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

    /* ---- submit ---- */
    const [submitted, setSubmitted] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Clear persisted data after submit (answers + user)
    const clearPersisted = useCallback(() => {
        try {
            localStorage.removeItem(LOCAL_KEY);
            localStorage.removeItem(LOCAL_USER_KEY);
        } catch {
            /* ignore */
        }
    }, []);

    const handleSubmit = async () => {
        if (hasSubmittedRef.current) return;
        hasSubmittedRef.current = true;

        setSubmitted(true);               // <- 🔹 add this line

        const [t1, t2] = answersRef.current;
        const { firstName, lastName, phone } = userInfoRef.current;

        const payload = {
            firstName,
            lastName,
            phone,
            task1Words: countWords(t1),
            task2Words: countWords(t2),
            task1Text: t1,
            task2Text: t2,
        };

        await sendWritingToTelegram(payload);

        clearPersisted();
        setAnswers(["", ""]);
        setUserInfo({ firstName: "", lastName: "", phone: "" });
        setShowSubmitModal(true);
    };



    /* Confirm if under minimum */
    const trySubmit = () => {
        const t1ok = countWords(answers[0]) >= tasks[0].minWords;
        const t2ok = countWords(answers[1]) >= tasks[1].minWords;
        if (!t1ok || !t2ok) {
            const proceed = window.confirm(
                "One or both tasks are below the minimum word count. Submit anyway?"
            );
            if (!proceed) return;
        }
        void handleSubmit();
    };

    /* ---- header label ---- */
    const headerLabel = tasks[taskIdx]?.title ?? `Task ${taskIdx + 1}`;

    /* ---- UI ---- */
    return (
        <section className="h-screen flex flex-col bg-white">
            {/* ───────────── Code Modal ───────────── */}
            {showCodeModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-xs w-full text-center space-y-4">
                        <h2 className="text-xl font-bold text-[#32CD32]">Enter Access Code</h2>

                        <input
                            type="text"
                            maxLength={4}
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value.replace(/[^0-9]/g, ""))}
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
                                    setShowCodeModal(false);   // unlock form
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

            {/* ───────────── Wrong‑Code Modal ───────────── */}
            {showWrongModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
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

            {/* ───────────── User Form ───────────── */}
            {showUserForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md w-full text-center space-y-4">
                        <h2 className="text-2xl font-bold text-green-900">Enter Your Information</h2>
                        <p className="text-sm text-gray-600">Writing test duration is 60 minutes.</p>

                        <input
                            type="text"
                            placeholder="First Name"
                            value={userInfo.firstName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const u = { ...userInfo, firstName: e.target.value };
                                setUserInfo(u);
                                scheduleSaveUser(u);
                            }}
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={userInfo.lastName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const u = { ...userInfo, lastName: e.target.value };
                                setUserInfo(u);
                                scheduleSaveUser(u);
                            }}
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={userInfo.phone}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const u = { ...userInfo, phone: e.target.value };
                                setUserInfo(u);
                                scheduleSaveUser(u);
                            }}
                            className="w-full border p-2 rounded"
                        />

                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-40"
                            onClick={() => {
                                if (userInfo.firstName && userInfo.lastName && userInfo.phone) {
                                    setShowUserForm(false);
                                    setShowIntro(true);
                                }
                            }}
                            disabled={!userInfo.firstName || !userInfo.lastName || !userInfo.phone}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* ───────────── Start Modal ───────────── */}
            {showIntro && !showUserForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-2xl font-bold text-[#32CD32]">Writing Test</h2>
                        <p>
                            You have <strong>60 minutes</strong> to complete Task 1 and Task 2.
                        </p>
                        <p>Task 2 is worth more marks. Manage your time carefully.</p>
                        <button
                            onClick={() => {
                                setShowIntro(false);
                                setRunning(true);
                            }}
                            className="bg-[#32CD32] text-white px-6 py-2 rounded"
                        >
                            Start
                        </button>
                    </div>
                </div>
            )}

            {/* ───────────── Submitted Modal ───────────── */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-3xl font-bold text-[#32CD32]">Submitted!</h2>
                        <p>Your writing has been sent. Thank you.</p>
                        <button
                            onClick={() => {
                                setShowSubmitModal(false);
                                setTimeout(() => router.push("/"), 100);
                            }}
                            className="bg-[#32CD32] text-white px-6 py-2 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* ───────────── Main Layout ───────────── */}
            {!showIntro && !showUserForm && !showSubmitModal && !showCodeModal && !showWrongModal && (
                <>
                    {/* header */}
                    <header className="sticky top-0 z-40 bg-white border-b px-4 py-2 flex justify-between items-center">
                        <button
                            className="md:hidden text-[#32CD32] underline text-sm"
                            onClick={() => setMobileDrawerOpen(true)}
                        >
                            View Task
                        </button>

                        <h1 className="hidden md:block font-bold text-[#32CD32]">{headerLabel}</h1>

                        <div className="flex items-center gap-1 text-[#32CD32] font-semibold text-lg">
                            <BsStopwatchFill className="text-3xl" />
                            <span>
                {`${Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, "0")}:${(timeLeft % 60).toString().padStart(2, "0")}`}
              </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs md:text-sm text-gray-500">
                            {saveState === "saving" && <span>Saving…</span>}
                            {saveState === "saved" && <span>Saved ✓</span>}
                            <button
                                onClick={trySubmit}
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
                        {/* instruction panel */}
                        <div
                            className="h-full overflow-y-auto px-4 pb-36 border-r hidden md:block"
                            style={{
                                width: `${splitPct}%`,
                                transition: isResizing ? "none" : "width 150ms ease",
                                userSelect: "text",
                            }}
                        >
                            <InstructionsBlock task={tasks[taskIdx]} />
                        </div>

                        {/* drag handle */}
                        <div
                            className="hidden md:flex absolute top-0 bottom-0 z-20 items-center justify-center w-3 cursor-col-resize group select-none"
                            style={{ left: `${splitPct}%`, marginLeft: "-6px" }}
                            onMouseDown={onSplitStart}
                            onDoubleClick={() => setSplitPct(50)}
                            title="Drag to resize panels (double‑click to reset)"
                        >
                            <div className="h-full w-[3px] bg-gray-300 group-hover:bg-[#32CD32]" />
                            <AiOutlineDoubleLeft className="absolute -left-3 text-xs text-[#32CD32] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <AiOutlineDoubleRight className="absolute -right-3 text-xs text-[#32CD32] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>

                        {/* answer panel */}
                        <div
                            className="flex-1 h-full overflow-y-auto px-4 md:px-8 pb-36"
                            style={{ transition: isResizing ? "none" : "width 150ms ease" }}
                        >
                            <AnswerPanel
                                value={answers[taskIdx]}
                                minWords={tasks[taskIdx].minWords}
                                onChange={(val) => {
                                    setAnswers((prev) => {
                                        const copy = [...prev];
                                        copy[taskIdx] = val;
                                        scheduleSave(copy);
                                        return copy;
                                    });
                                }}
                                placeholder="Type your answer here…"
                            />
                        </div>
                    </main>

                    {/* bottom tabs */}
                    <footer className="fixed bottom-0 inset-x-0 bg-white border-t px-2 sm:px-4 py-2 z-40 shadow">
                        <div className="w-full grid grid-cols-2 gap-3">
                            {tasks.map((t, idx) => {
                                const wc = countWords(answers[idx]);
                                const ok = wc >= t.minWords;
                                const active = taskIdx === idx;
                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => setTaskIdx(idx as 0 | 1)}
                                        className={`border rounded p-2 cursor-pointer ${
                                            active ? "border-green-400" : "border-gray-300"
                                        }`}
                                    >
                                        <div
                                            className={`font-semibold ${
                                                active ? "text-[#32CD32]" : ""
                                            }`}
                                        >
                                            {t.title}
                                        </div>
                                        <div className="mt-1 text-sm">
                                            Words: {wc} / {t.minWords}{" "}
                                            {!ok && <span className="text-red-600">(min!)</span>}
                                            {ok && <span className="text-green-600">✓</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </footer>

                    {/* mobile drawer (prompt) */}
                    <MobileTaskDrawer
                        open={mobileDrawerOpen}
                        onClose={() => setMobileDrawerOpen(false)}
                        task={tasks[taskIdx]}
                    />
                </>
            )}
        </section>
    );
}
