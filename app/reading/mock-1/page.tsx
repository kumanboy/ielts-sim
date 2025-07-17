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
import readingData from "@/data/reading/mock-1.json";

/* dnd-kit (Passage 2 & 3) */
import {
    DndContext,
    DragEndEvent,
    useDroppable,
    useDraggable,
    pointerWithin,
} from "@dnd-kit/core";

/* ─────────────────── Types ─────────────────── */
export interface Question {
    number: number;
    type: string;
    question: string;
    options?: string[];
    answer: string;
}
export interface PassageData {
    title: string;
    passage?: string;
    questions: Question[];
    passageSections?: { label: string; text: string }[]; // Passage 2 only
    wordBank?: { letter: string; word: string }[]; // Passage 3 only
}
interface WordBankItem {
    letter: string;
    word: string;
}

/* ───────────────── Answer normalisers ───────────────── */
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
const canonTF = (s: string) => {
    const v = norm(s);
    if (["true", "t", "yes", "y"].includes(v)) return "true";
    if (["false", "f", "no", "n"].includes(v)) return "false";
    if (["not given", "ng", "n.g."].includes(v)) return "not given";
    return v;
};

/* ───────────────── Band table (same as Listening) ───────────────── */
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
    { min: 11, max: 12, band: 4 },
];

/* ───────────────── Correct answer overrides (1‑40) ─────────────────
 * Use this map to correct / normalise answers from the JSON file.
 * Scoring will use these first; falls back to JSON `answer` otherwise.
 */
const CORRECT_ANS_OVERRIDES: Record<number, string> = {
    // Passage 1
    1: "TRUE",
    2: "FALSE",
    3: "NOT GIVEN",
    4: "TRUE",
    5: "FALSE",
    6: "NOT GIVEN",
    7: "DISCOVERIES",
    8: "PUBLISHER",
    9: "COUNTRIES",
    10: "RECOGNITION",
    11: "STONE",
    12: "ECONOMY",
    13: "IMPORTANCE",
    // Passage 2
    14: "C",
    15: "B",
    16: "A",
    17: "C",
    18: "D",
    19: "A",
    20: "F",
    21: "C",
    22: "B",
    23: "enzymes",
    24: "bruising",
    25: "light",
    26: "peas",
    // Passage 3
    27: "C",
    28: "A",
    29: "B",
    30: "D",
    31: "D",
    32: "H",
    33: "B",
    34: "F",
    35: "G",
    36: "C",
    37: "NO", // (FALSE also accepted via canonTF when user inputs TRUE/FALSE radio)
    38: "NOT GIVEN",
    39: "NO",
    40: "YES",
};

/* ───────────────── Telegram ───────────────── */
const TELEGRAM_TOKEN =
    "7866020177:AAENPifrsXdXsbrEZTYcUGbimyB1-Co2MKU"; // TODO: env var in production
const TELEGRAM_GROUP_CHAT_ID = "-4764694665";

async function sendTelegramResult(
    firstName: string,
    lastName: string,
    phone: string,
    correct: number,
    band: number
) {
    const message =
        `📘 *Reading Test Result*\n\n` +
        `👤 Name: ${firstName} ${lastName}\n` +
        `📱 Phone: ${phone}\n` +
        `✅ Correct Answers: ${correct}/40\n` +
        `🌟 Band Score: ${band}`;
    try {
        await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
            {
                chat_id: TELEGRAM_GROUP_CHAT_ID,
                text: message,
                parse_mode: "Markdown",
            }
        );
    } catch (err) {
        console.error("Telegram send error:", err);
    }
}

/* ───────────────── Render helpers ───────────────── */
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

/* ───────────────── Question block ───────────────── */
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
                    options={q.options || []}
                />
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

/* ───────────────── Passage renderer ───────────────── */
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

/* ───────────────── Passage 2 renderer (labeled sections) ───────────────── */
function Passage2View({
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

/* ───────────────── Passage 2 Questions (Q14‑26) ───────────────── */

/* --- Q14‑18 Section Match --- */
const P2_SECTION_OPTIONS = ["", "A", "B", "C", "D", "E"];
const P2_Q14_OFFSET = 13; // Q14 => answers[13]

/* Raw Passage 2 questions for type‑safe lookups */
const PASSAGE2_QUESTIONS: Question[] = (
    readingData.reading[1].questions as Question[]
).slice();

/* Map for quick question lookup by number */
const PASSAGE2_Q_MAP = new Map<number, Question>(
    PASSAGE2_QUESTIONS.map((q) => [q.number, q])
);

/* --- Q19‑22 Match People --- */
const P2_PEOPLE = [
    { v: "A", name: "Donald Davis" },
    { v: "B", name: "Paul Finglas" },
    { v: "C", name: "Eric Decker" },
    { v: "D", name: "Carol Wagstaff" },
    { v: "E", name: "Catherine Collins" },
    { v: "F", name: "Judy Buttriss" },
];
const P2_PEOPLE_MAP: Record<string, string> = Object.fromEntries(
    P2_PEOPLE.map((p) => [p.v, p.name])
);
const P2_PEOPLE_QUESTIONS = PASSAGE2_QUESTIONS.filter(
    (q) => q.number >= 19 && q.number <= 22
).map((q) => q.question);

const P2_Q19_OFFSET = 18; // Q19 => answers[18]

/* --- Q23‑26 Fill in Blank --- */
const P2_Q23_OFFSET = 22; // Q23 => answers[22]

function P2DraggablePerson({
                               id,
                               label,
                           }: {
    id: string;
    label: React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-move p-2 rounded bg-white shadow border mb-1"
            style={{
                transform: transform
                    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                    : undefined,
                opacity: isDragging ? 0.5 : 1,
                zIndex: isDragging ? 9999 : 1,
            }}
        >
            {label}
        </div>
    );
}

function P2DroppableAnswer({
                               id,
                               answer,
                               onClear,
                           }: {
    id: string;
    answer: string;
    onClear: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <span
            ref={setNodeRef}
            className={`inline-block min-w-[200px] min-h-[30px] border-b-2 border-dashed px-2 py-1 ${
                isOver ? "border-green-500" : ""
            }`}
        >
      {answer ? (
          <>
              <strong>{answer}</strong> {P2_PEOPLE_MAP[answer]}{" "}
              <button
                  onClick={onClear}
                  className="ml-2 text-red-500 text-sm hover:underline"
                  type="button"
              >
                  ×
              </button>
          </>
      ) : (
          <span className="text-gray-400">Drop answer here</span>
      )}
    </span>
    );
}

interface Passage2PartProps {
    answers: string[];
    onAnswerChange: (index: number, value: string) => void;
}

function Passage2Part({ answers, onAnswerChange }: Passage2PartProps) {
    const chosen = [
        answers[P2_Q19_OFFSET] ?? "",
        answers[P2_Q19_OFFSET + 1] ?? "",
        answers[P2_Q19_OFFSET + 2] ?? "",
        answers[P2_Q19_OFFSET + 3] ?? "",
    ];
    const remaining = P2_PEOPLE.filter((p) => !chosen.includes(p.v));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active?.id || !over?.id) return;
        const draggedLetter = String(active.id).replace("person-", "");
        const index = parseInt(String(over.id).replace("drop-", ""), 10);
        if (Number.isNaN(index)) return;

        const prevIdx = chosen.findIndex((c) => c === draggedLetter);
        if (prevIdx !== -1 && prevIdx !== index) {
            onAnswerChange(P2_Q19_OFFSET + prevIdx, "");
        }
        onAnswerChange(P2_Q19_OFFSET + index, draggedLetter);
    };

    return (
        <div>
            {/* ---------- Q14‑18 Section Match ---------- */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-green-600">
                    Part 2 – Questions 14–18
                </h2>
                <p className="mt-2 text-sm text-gray-600 mb-4">
                    Choose the correct section (A–E) for each question.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[14, 15, 16, 17, 18].map((number, idx) => (
                        <div key={number} id={`question-${number - 1}`}>
                            <label className="block mb-1 font-medium">
                                {number}.{" "}
                                {PASSAGE2_Q_MAP.get(number)?.question || "Question text not found"}
                            </label>
                            <select
                                value={answers[P2_Q14_OFFSET + idx] || ""}
                                onChange={(e) =>
                                    onAnswerChange(P2_Q14_OFFSET + idx, e.target.value)
                                }
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                {P2_SECTION_OPTIONS.map((opt, i) => (
                                    <option key={i} value={opt} disabled={opt === ""}>
                                        {opt === "" ? "Select section" : opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* separator anchors for paginator accuracy */}
            <div id="question-18" className="h-0" />
            <div id="question-19" className="h-0" />
            <div id="question-20" className="h-0" />
            <div id="question-21" className="h-0" />

            {/* ---------- Q19‑22 Match People (DnD) ---------- */}
            <DndContext onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
                <h3 className="text-lg font-semibold mt-6">Questions 19–22</h3>
                <p className="mb-4">
                    Match each statement with the correct person. Drag and drop A–F.
                </p>

                <div className="border p-4 w-full max-w-md rounded mb-6 bg-gray-50 shadow">
                    {remaining.map((person) => (
                        <P2DraggablePerson
                            key={person.v}
                            id={`person-${person.v}`}
                            label={
                                <div className="flex items-center gap-2">
                                    <strong>{person.v}</strong>
                                    <span>{person.name}</span>
                                </div>
                            }
                        />
                    ))}
                </div>

                <div className="space-y-5">
                    {P2_PEOPLE_QUESTIONS.map((text, i) => (
                        <div
                            key={i}
                            id={`question-${18 + i}`}
                            className="flex gap-3 items-start"
                        >
                            <div className="w-6 font-bold">{19 + i}.</div>
                            <div className="flex-1">
                                <p>{text}</p>
                                <P2DroppableAnswer
                                    id={`drop-${i}`}
                                    answer={chosen[i] ?? ""}
                                    onClear={() => onAnswerChange(P2_Q19_OFFSET + i, "")}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </DndContext>

            {/* anchors for Q23‑26 */}
            <div id="question-22" className="h-0" />
            <div id="question-23" className="h-0" />
            <div id="question-24" className="h-0" />
            <div id="question-25" className="h-0" />

            {/* ---------- Q23‑26 Fill in Blank ---------- */}
            <div
                id="question-23"
                className="space-y-4 mt-8 text-[15px] leading-relaxed"
            >
                <p className="font-semibold text-lg">Questions 23 – 26</p>
                <p>Complete the summary below.</p>
                <p>
                    <strong>
                        Choose <u>ONE WORD ONLY</u> from the text for each answer.
                    </strong>
                </p>
                <p>
                    Write your answers in boxes <strong>23 - 26</strong> below.
                </p>

                <p className="font-semibold text-center">Food transportation</p>

                <p>
                    In order to prevent loss of nutrients when transporting fruit and
                    vegetables, chilling is used to slow down the effect that{" "}
                    <input
                        type="text"
                        className="border-b border-gray-500 w-28 px-1 text-center"
                        value={answers[P2_Q23_OFFSET] ?? ""}
                        onChange={(e) => onAnswerChange(P2_Q23_OFFSET, e.target.value)}
                        placeholder="23"
                    />{" "}
                    have on them. Some foods, such as tomatoes, must be picked before they
                    are ripe to avoid problems such as{" "}
                    <input
                        type="text"
                        className="border-b border-gray-500 w-28 px-1 text-center"
                        value={answers[P2_Q23_OFFSET + 1] ?? ""}
                        onChange={(e) => onAnswerChange(P2_Q23_OFFSET + 1, e.target.value)}
                        placeholder="24"
                    />{" "}
                    during transportation. Other foods, such as cabbage, lose nutrients
                    when kept in the{" "}
                    <input
                        type="text"
                        className="border-b border-gray-500 w-28 px-1 text-center"
                        value={answers[P2_Q23_OFFSET + 2] ?? ""}
                        onChange={(e) => onAnswerChange(P2_Q23_OFFSET + 2, e.target.value)}
                        placeholder="25"
                    />
                    . Vegetables such as{" "}
                    <input
                        type="text"
                        className="border-b border-gray-500 w-28 px-1 text-center"
                        value={answers[P2_Q23_OFFSET + 3] ?? ""}
                        onChange={(e) => onAnswerChange(P2_Q23_OFFSET + 3, e.target.value)}
                        placeholder="26"
                    />
                    , which are picked fresh and transported to the supermarket, may be
                    less nutritious than those which are frozen.
                </p>
            </div>
        </div>
    );
}

/* ───────────────── Passage 3 Questions (Q27‑40) ───────────────── */

/* Offset for first drag/drop gap (Q32) in the global answers array */
const P3_Q32_OFFSET = 31; // answers[31] = Q32

/* word bank letters A‑H are independent of MCQ letters */
interface Passage3PartProps {
    part: PassageData; // for texts/options
    answers: string[];
    onAnswerChange: (index: number, value: string) => void;
}

function P3DraggableWord({
                             id,
                             label,
                         }: {
    id: string;
    label: React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id });
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-move p-2 rounded bg-white shadow border mb-1"
            style={{
                transform: transform
                    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                    : undefined,
                opacity: isDragging ? 0.5 : 1,
                zIndex: isDragging ? 9999 : 1,
            }}
        >
            {label}
        </div>
    );
}

function P3DroppableGap({
                            id,
                            answer,
                            word,
                            onClear,
                        }: {
    id: string;
    answer: string;
    word?: string;
    onClear: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <span
            ref={setNodeRef}
            className={`inline-block min-w-[120px] min-h-[30px] border-b-2 border-dashed px-2 py-0 ${
                isOver ? "border-green-500" : ""
            }`}
        >
      {answer ? (
          <>
              <strong>{answer}</strong> {word}{" "}
              <button
                  onClick={onClear}
                  className="ml-1 text-red-500 text-sm hover:underline"
                  type="button"
              >
                  ×
              </button>
          </>
      ) : (
          <span className="text-gray-400">Drop</span>
      )}
    </span>
    );
}

function Passage3Part({ part, answers, onAnswerChange }: Passage3PartProps) {
    /* Build quick lookup for MCQs & word bank */
    const qMap = useMemo(
        () => new Map<number, Question>(part.questions.map((q) => [q.number, q])),
        [part.questions]
    );
    const wordBank: WordBankItem[] = (part.wordBank ?? []).slice();

    /* Word gaps chosen letters */
    const gapLetters = [
        answers[P3_Q32_OFFSET] ?? "",
        answers[P3_Q32_OFFSET + 1] ?? "",
        answers[P3_Q32_OFFSET + 2] ?? "",
        answers[P3_Q32_OFFSET + 3] ?? "",
        answers[P3_Q32_OFFSET + 4] ?? "",
    ];
    const remainingWords = wordBank.filter((w) => !gapLetters.includes(w.letter));
    const wordLookup: Record<string, string> = useMemo(() => {
        const o: Record<string, string> = {};
        wordBank.forEach((w: WordBankItem) => {
            o[w.letter] = w.word;
        });
        return o;
    }, [wordBank]);

    const handleGapDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active?.id || !over?.id) return;
        const dragLetter = String(active.id).replace("p3-word-", "");
        const gapIdx = parseInt(String(over.id).replace("p3-gap-", ""), 10);
        if (Number.isNaN(gapIdx)) return;

        const prevIdx = gapLetters.findIndex((l) => l === dragLetter);
        if (prevIdx !== -1 && prevIdx !== gapIdx) {
            onAnswerChange(P3_Q32_OFFSET + prevIdx, "");
        }
        onAnswerChange(P3_Q32_OFFSET + gapIdx, dragLetter);
    };

    /* Helpers */
    const setQAns = (qNum: number, val: string) => onAnswerChange(qNum - 1, val); // global mapping

    /* MCQ letters (A‑D) */
    const mcqLetter = (i: number) => String.fromCharCode(65 + i); // 0->A

    /* YES/NO/NOT GIVEN selects */
    const ynOpts = ["", "YES", "NO", "NOT GIVEN"];

    /* Questions */
    const q27 = qMap.get(27)!;
    const q28 = qMap.get(28)!;
    const q29 = qMap.get(29)!;
    const q30 = qMap.get(30)!;
    const q31 = qMap.get(31)!;
    const q37 = qMap.get(37)!;
    const q38 = qMap.get(38)!;
    const q39 = qMap.get(39)!;
    const q40 = qMap.get(40)!;

    return (
        <div>
            {/* ---------- Q27‑31 MCQ Selects ---------- */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-green-600">
                    Questions 27 – 31
                </h2>
                <p className="mt-2 text-sm text-gray-600 mb-4">
                    Choose the correct letter, A, B, C or D.
                </p>

                {[q27, q28, q29, q30, q31].map((q) => (
                    <div key={q.number} id={`question-${q.number - 1}`} className="mb-4">
                        <p className="font-medium mb-1">
                            {q.number}. {q.question}
                        </p>
                        <select
                            value={answers[q.number - 1] || ""}
                            onChange={(e) => setQAns(q.number, e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="" disabled>
                                Select answer
                            </option>
                            {(q.options || []).map((opt, i) => {
                                const letter = mcqLetter(i);
                                return (
                                    <option key={letter} value={letter}>
                                        {letter}. {opt}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                ))}
            </div>

            {/* ---------- Q32‑36 Drag & Drop Summary ---------- */}
            <DndContext onDragEnd={handleGapDragEnd} collisionDetection={pointerWithin}>
                <h2 id={`question-${31}`} className="font-semibold text-lg mt-10">
                    Questions 32 – 36
                </h2>
                <p>Complete the summary using the list of words, A - H, below.</p>
                <p className="mb-4">
                    Write the correct letter, A - H, in boxes 32 - 36 below.
                </p>

                {/* Word bank pool */}
                <div className="border p-4 w-full max-w-md rounded mb-6 bg-gray-50 shadow">
                    {remainingWords.map((w: WordBankItem) => (
                        <P3DraggableWord
                            key={w.letter}
                            id={`p3-word-${w.letter}`}
                            label={
                                <div className="flex items-center gap-2">
                                    <strong>{w.letter}</strong>
                                    <span>{w.word}</span>
                                </div>
                            }
                        />
                    ))}
                </div>

                <p className="font-semibold text-center mb-4">
                    Problems of Rewilding Projects
                </p>

                <p className="leading-relaxed text-[15px]">
                    Rewilding projects have to deal with numerous challenges. For example,
                    the reintroduction of beavers to Britain has faced{" "}
                    <P3DroppableGap
                        id="p3-gap-0"
                        answer={gapLetters[0]}
                        word={wordLookup[gapLetters[0]]}
                        onClear={() => onAnswerChange(P3_Q32_OFFSET + 0, "")}
                    />{" "}
                    <span className="text-gray-400 ml-1">(32)</span> from government
                    ministers together with{" "}
                    <P3DroppableGap
                        id="p3-gap-1"
                        answer={gapLetters[1]}
                        word={wordLookup[gapLetters[1]]}
                        onClear={() => onAnswerChange(P3_Q32_OFFSET + 1, "")}
                    />{" "}
                    <span className="text-gray-400 ml-1">(33)</span> on the part of
                    opponents to the scheme. Where wolves have been reintroduced in
                    western Europe, there has been widespread{" "}
                    <P3DroppableGap
                        id="p3-gap-2"
                        answer={gapLetters[2]}
                        word={wordLookup[gapLetters[2]]}
                        onClear={() => onAnswerChange(P3_Q32_OFFSET + 2, "")}
                    />{" "}
                    <span className="text-gray-400 ml-1">(34)</span> against these animals
                    among local people, despite clear{" "}
                    <P3DroppableGap
                        id="p3-gap-3"
                        answer={gapLetters[3]}
                        word={wordLookup[gapLetters[3]]}
                        onClear={() => onAnswerChange(P3_Q32_OFFSET + 3, "")}
                    />{" "}
                    <span className="text-gray-400 ml-1">(35)</span> that the species
                    poses virtually no{" "}
                    <P3DroppableGap
                        id="p3-gap-4"
                        answer={gapLetters[4]}
                        word={wordLookup[gapLetters[4]]}
                        onClear={() => onAnswerChange(P3_Q32_OFFSET + 4, "")}
                    />{" "}
                    <span className="text-gray-400 ml-1">(36)</span> to them.
                </p>
            </DndContext>

            {/* ---------- Q37‑40 YES/NO/NOT GIVEN Selects ---------- */}
            <div className="mt-12">
                <h2
                    id={`question-${36}`} // anchor at first of this block
                    className="font-semibold text-lg"
                >
                    Questions 37 – 40
                </h2>
                <p className="mb-4">
                    Do the following statements agree with the claims of the writer in the
                    text? In boxes 37 - 40 below, write
                </p>
                <ul className="mb-4 text-sm pl-6 list-disc space-y-1">
                    <li>YES if the statement agrees with the claims of the writer</li>
                    <li>NO if the statement contradicts the claims of the writer</li>
                    <li>
                        NOT GIVEN if it is impossible to say what the writer thinks about
                        this
                    </li>
                </ul>

                {[q37, q38, q39, q40].map((q) => (
                    <div key={q.number} id={`question-${q.number - 1}`} className="mb-4">
                        <p className="font-medium mb-1">
                            {q.number}. {q.question}
                        </p>
                        <select
                            value={answers[q.number - 1] || ""}
                            onChange={(e) => setQAns(q.number, e.target.value)}
                            className="w-full max-w-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {ynOpts.map((o) => (
                                <option key={o} value={o} disabled={o === ""}>
                                    {o === "" ? "Select" : o}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ───────────────── Component ───────────────── */
export default function ReadingMock1() {
    const router = useRouter();
    const passages = readingData.reading as PassageData[];

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
    const [showIntro, setShowIntro] = useState(false);
    const [showUserForm, setShowUserForm] = useState(true);
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

    /* ---- resizable split (md+) ---- */
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
                    if (!submitted) handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [running]);

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
            const t = setTimeout(() => router.push("/"), 10_000);
            return () => clearTimeout(t);
        }
    }, [submitted, result, router]);

    /* ---- evaluation ---- */
    const evaluate = () => {
        let correct = 0;

        passages.forEach((p) => {
            p.questions.forEach((q) => {
                const given = answers[q.number - 1] ?? "";
                // Use override if present; fall back to JSON key
                const actualRaw = CORRECT_ANS_OVERRIDES[q.number] ?? q.answer;
                const actual = actualRaw ?? "";

                const t = q.type.toUpperCase();

                if (t.includes("TRUE_FALSE") || t.includes("YES_NO")) {
                    // Canonical compare TRUE/FALSE/YES/NO/NOT GIVEN
                    if (canonTF(given) === canonTF(actual)) correct++;
                } else {
                    // Case/whitespace insensitive compare (letters, words, etc.)
                    if (norm(given) === norm(actual)) correct++;
                }
            });
        });

        const band =
            BAND_TABLE.find((r) => correct >= r.min && correct <= r.max)?.band ?? 0;
        return { correct, band };
    };

    const handleSubmit = () => {
        const { correct, band } = evaluate();
        setResult({ correct, band });
        setSubmitted(true);

        if (userInfo.firstName && userInfo.lastName && userInfo.phone) {
            sendTelegramResult(
                userInfo.firstName,
                userInfo.lastName,
                userInfo.phone,
                correct,
                band
            );
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

    /* ---- header label ---- */
    const headerLabel = `Passage ${currentPart + 1}`;

    /* ---- current passage meta ---- */
    const part = passages[currentPart];
    const questionRangeLabel = `Questions ${part.questions[0].number}-${part.questions[part.questions.length - 1].number}`;

    /* ---- UI ---- */
    return (
        <section className="h-screen flex flex-col bg-white">
            {/* ───────────── User Form ───────────── */}
            {showUserForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-2xl font-bold text-green-900">
                            Enter Your Information
                        </h2>
                        <p className="text-sm text-gray-600">
                            Note: Reading test duration is 1 hour.
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
                            className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-40"
                            onClick={() => {
                                if (userInfo.firstName && userInfo.lastName && userInfo.phone) {
                                    setShowUserForm(false);
                                    setShowIntro(true);
                                }
                            }}
                            disabled={
                                !userInfo.firstName || !userInfo.lastName || !userInfo.phone
                            }
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}

            {/* ───────────── Start Modal ───────────── */}
            {showIntro && !showUserForm && (
                <div
                    data-testid="start-modal"
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                >
                    <div className="bg-white p-6 rounded shadow max-w-md text-center space-y-4">
                        <h2 className="text-2xl font-bold text-[#32CD32]">Reading Test</h2>
                        <p>
                            3 passages / 40 questions. Timer starts when you click{" "}
                            <strong>Start</strong>.
                        </p>
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

            {/* ───────────── Result Modal ───────────── */}
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
                    <main
                        ref={splitWrapRef}
                        className="flex flex-1 overflow-hidden relative"
                    >
                        {/* passage panel (hidden below md) */}
                        <div
                            className="h-full overflow-y-auto px-4 pb-36 border-r hidden md:block"
                            style={{
                                width: `${splitPct}%`,
                                transition: isResizing ? "none" : "width 150ms ease",
                                userSelect: "text",
                            }}
                        >
                            <h2 className="text-3xl font-bold mt-8 text-[#32CD32]">
                                {part.title}
                            </h2>
                            {currentPart === 1 && part.passageSections ? (
                                <Passage2View sections={part.passageSections} />
                            ) : part.passage ? (
                                <PassageView passage={part.passage} />
                            ) : null}
                        </div>

                        {/* drag handle (md+) */}
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

                            {currentPart === 1 ? (
                                <Passage2Part
                                    answers={answers}
                                    onAnswerChange={(idx, val) => {
                                        setAnswers((prev) => {
                                            const copy = [...prev];
                                            copy[idx] = val;
                                            return copy;
                                        });
                                    }}
                                />
                            ) : currentPart === 2 ? (
                                <Passage3Part
                                    part={part}
                                    answers={answers}
                                    onAnswerChange={(idx, val) => {
                                        setAnswers((prev) => {
                                            const copy = [...prev];
                                            copy[idx] = val;
                                            return copy;
                                        });
                                    }}
                                />
                            ) : (
                                /* Passage 1 default rendering */
                                part.questions.map((q) => (
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

                    {/* paginator – fluid full‑width */}
                    <footer className="fixed bottom-0 inset-x-0 bg-white border-t px-2 sm:px-4 py-2 z-40 shadow">
                        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                        className={`border rounded p-2 cursor-pointer ${
                                            active ? "border-green-400" : "border-gray-300"
                                        }`}
                                    >
                                        <div
                                            className={`font-semibold ${
                                                active ? "text-[#32CD32]" : ""
                                            }`}
                                        >
                                            Passage {idx + 1}: {answered} / {nextOff - off}
                                        </div>

                                        {active && (
                                            <div className="flex flex-wrap gap-1 mt-1">
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
