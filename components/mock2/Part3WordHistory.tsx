"use client";

import React, { useState } from "react";

interface Props {
    /** answers[20-29] slice → Q21-30 */
    answers: string[];                     // length 10
    onAnswerChangeAction: (idx: number, value: string) => void;
}

/* ─────────── MCQ helper ─────────── */
type MCQOption = { letter: "A" | "B" | "C"; text: string };
interface MCQItem  { stem: string; options: MCQOption[] }

const MCQBlock = ({
                      q,
                      stem,
                      opts,
                      value,
                      onChange,
                  }: {
    q: number;
    stem: string;
    opts: MCQOption[];
    value: string;
    onChange: (v: string) => void;
}) => (
    <div id={`question-${q}`} className="space-y-1">
        <p className="font-medium leading-snug">
            {q}. {stem}
        </p>
        {opts.map(({ letter, text }) => (
            <label key={letter} className="flex items-start gap-2 ml-6">
                <input
                    type="radio"
                    name={`q${q}`}
                    value={letter.toLowerCase()}
                    checked={value === letter.toLowerCase()}
                    onChange={() => onChange(letter.toLowerCase())}
                />
                <span>
          <span className="font-semibold">{letter})</span> {text}
        </span>
            </label>
        ))}
    </div>
);

/* ─────────── Data for Q21-24 ─────────── */
const mcqData: Record<number, MCQItem> = {
    21: {
        stem: "Tom and Ruby choose to focus on the word ‘nice’ because",
        options: [
            { letter: "A", text: "it has so many different usages." },
            { letter: "B", text: "it’s so well known by many people." },
            { letter: "C", text: "its meaning has changed a lot over time." },
        ],
    },
    22: {
        stem: "What inspired Tom and Ruby to research the history of words?",
        options: [
            { letter: "A", text: "thinking about the content of a novel" },
            { letter: "B", text: "talking to classmates about their plans" },
            { letter: "C", text: "listening to a particularly interesting lecture" },
        ],
    },
    23: {
        stem: "What resource do Tom and Ruby agree they need to add to their presentation?",
        options: [
            { letter: "A", text: "interview data" },
            { letter: "B", text: "computer software" },
            { letter: "C", text: "journal articles" },
        ],
    },
    24: {
        stem: "What is Ruby most worried about the reading they have done for the presentation?",
        options: [
            { letter: "A", text: "its relevance to the course" },
            { letter: "B", text: "overlap with other modules" },
            { letter: "C", text: "the date of references" },
        ],
    },
};

/* ─────────── Drag-drop data (25-30) ─────────── */
interface DragItem { letter: string; label: string }
const actions: DragItem[] = [
    { letter: "A", label: "act out a scene" },
    { letter: "B", label: "make it longer" },
    { letter: "C", label: "explain a selection of sample texts" },
    { letter: "D", label: "get the audience to do a task" },
    { letter: "E", label: "make it substantially shorter" },
    { letter: "F", label: "consider omitting something if insufficient time" },
    { letter: "G", label: "use some visuals" },
    { letter: "H", label: "present some research findings" },
    { letter: "I", label: "play an audio recording" },
];

const parts = [
    { q: 25, slotIdx: 0, label: "Title" },
    { q: 26, slotIdx: 1, label: "Introduction" },
    { q: 27, slotIdx: 2, label: "Historical background" },
    { q: 28, slotIdx: 3, label: "Current usage" },
    { q: 29, slotIdx: 4, label: "Additional meanings" },
    { q: 30, slotIdx: 5, label: "Future directions" },
];

/* ─────────── Component ─────────── */
export default function Part3WordHistory({ answers, onAnswerChangeAction }: Props) {
    // answers: 0-3 → Q21-24, 4-9 → Q25-30
    const [dragging, setDragging] = useState<string | null>(null);

    const setAns = (idx: number, value: string) => onAnswerChangeAction(idx, value);

    const taken = new Set(answers.slice(4).map((a) => a.toUpperCase()));

    const handleDrop = (slot: number) => {
        if (!dragging) return;
        setAns(slot + 4, dragging.toLowerCase());
        setDragging(null);
    };

    return (
        <div className="space-y-10">
            {/* ───── Q21-24 (MCQs) ───── */}
            <section className="space-y-6">
                <p className="font-medium">
                    Questions 21-24 – Choose the correct letter&nbsp;A, B or C.
                </p>
                <p className="italic">
                    Write your answers in boxes 21-24 on your answer sheet.
                </p>

                {[21, 22, 23, 24].map((q, i) => (
                    <MCQBlock
                        key={q}
                        q={q}
                        stem={mcqData[q].stem}
                        opts={mcqData[q].options}
                        value={answers[i] || ""}
                        onChange={(v) => setAns(i, v)}
                    />
                ))}
            </section>

            {/* ───── Q25-30 (Drag-drop) ───── */}
            <section>
                <p className="font-medium">
                    What action do Tom and Ruby agree they will need to take for each part of
                    their presentation?
                </p>
                <p className="italic mb-4">
                    Choose SIX answers from the box and write the correct letter, A–I, in
                    boxes 25-30 on your answer sheet.
                </p>

                {/* answer bank – show only unused letters */}
                <div className="border p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mb-6">
                    {actions
                        .filter(({ letter }) => !taken.has(letter))
                        .map(({ letter, label }) => (
                            <span
                                key={letter}
                                draggable
                                onDragStart={() => setDragging(letter)}
                                onDragEnd={() => setDragging(null)}
                                className="border px-3 py-1 rounded cursor-grab select-none flex items-start gap-2 bg-white"
                            >
                <span className="font-bold">{letter})</span> {label}
              </span>
                        ))}
                </div>

                {/* drop targets */}
                <div className="space-y-3 max-w-xl">
                    {parts.map(({ q, slotIdx, label }) => (
                        <div key={q} id={`question-${q}`} className="flex items-center gap-3">
                            <span className="w-6 font-semibold">{q}.</span>
                            <span className="flex-1 min-w-[180px]">{label}</span>
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(slotIdx)}
                                className="w-16 h-9 border rounded flex items-center justify-center bg-gray-50 text-lg font-semibold"
                            >
                                {answers[slotIdx + 4]?.toUpperCase() || ""}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
