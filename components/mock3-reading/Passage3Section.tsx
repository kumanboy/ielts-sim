// components/mock3-reading/Passage3Section.tsx
"use client";

import React, { useMemo } from "react";
import { PassageData, Question } from "@/app/reading/mock-2/page"; // adjust import to your types

type Props = {
    part: PassageData;
    answers: string[];
    onAnswerChange: (index: number, value: string) => void;
};

const idx = (qNum: number) => qNum - 1;
const norm = (s: string) => s.trim().toLowerCase();

export default function Passage3Section({ part, answers, onAnswerChange }: Props) {
    /* ---------------- Q27–31: List of Headings (drag & drop) ---------------- */
    const q27to31 = useMemo(
        () => part.questions.filter((q) => q.number >= 27 && q.number <= 31),
        [part.questions]
    );

    const headings: Record<string, string> = useMemo(() => {
        const base = (q27to31[0]?.options || {}) as Record<string, string>;
        return base;
    }, [q27to31]);

    const bankKeys = useMemo(
        () =>
            Object.keys(headings)
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
                .map((k) => k.toLowerCase()),
        [headings]
    );

    const usedKeys = useMemo(() => {
        const set = new Set<string>();
        q27to31.forEach((q) => {
            const v = norm(answers[idx(q.number)] || "");
            if (v) set.add(v);
        });
        return set;
    }, [answers, q27to31]);

    const onDragStart = (key: string) => (e: React.DragEvent) => {
        e.dataTransfer.setData("text/plain", key);
        e.dataTransfer.effectAllowed = "move";
    };
    const onDropTo = (q: Question) => (e: React.DragEvent) => {
        e.preventDefault();
        const droppedKey = (e.dataTransfer.getData("text/plain") || "").toLowerCase();
        if (!droppedKey) return;
        onAnswerChange(idx(q.number), droppedKey);
    };
    const allowDrop = (e: React.DragEvent) => e.preventDefault();
    const clearSlot = (q: Question) => onAnswerChange(idx(q.number), "");

    /* ---------------- Q32–36: MCQs ---------------- */
    const q32to36 = part.questions.filter((q) => q.number >= 32 && q.number <= 36);

    /* ---------------- Q37–40: TRUE / FALSE / NOT GIVEN ---------------- */
    const q37to40 = part.questions.filter((q) => q.number >= 37 && q.number <= 40);

    return (
        <div className="mt-6 space-y-10">
            {/* ==================== Q27–31 Headings (drag & drop) ==================== */}
            <section>
                <h3 className="text-2xl font-bold text-[#32CD32] mb-1">Questions 27–31</h3>
                <p className="text-sm">Reading Passage 3 has five sections, <strong>A–E</strong>.</p>
                <p className="text-sm">
                    Choose the correct heading for each section from the list of headings below.
                </p>
                <p className="text-sm mb-4">
                    Write the correct number, <strong>i–vii</strong>, in boxes <strong>27–31</strong> on your
                    answer sheet.
                </p>

                {/* Word bank */}
                <div className="border rounded-lg p-3 mb-5">
                    <div className="font-semibold text-center mb-2">List of Headings</div>
                    <ul className="grid md:grid-cols-2 gap-2">
                        {bankKeys.map((k) => {
                            const isUsed = usedKeys.has(k);
                            return (
                                <li key={k}>
                                    <div
                                        draggable={!isUsed}
                                        onDragStart={onDragStart(k)}
                                        className={`flex items-start gap-2 rounded border px-3 py-2 text-sm ${
                                            isUsed
                                                ? "bg-gray-100 text-gray-400 border-gray-200"
                                                : "bg-white hover:bg-green-50 border-gray-300 cursor-move"
                                        }`}
                                        title={isUsed ? "Already placed" : "Drag to a question slot"}
                                    >
                                        <span className="font-bold uppercase w-6">{k}</span>
                                        <span>{headings[k]}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Inline drop zones (one line each) */}
                <div className="space-y-3">
                    {q27to31.map((q) => {
                        const val = (answers[idx(q.number)] || "").toLowerCase();
                        const filled = val && headings[val];

                        return (
                            <div key={q.number} className="flex items-center gap-3">
                                <div className="whitespace-nowrap font-semibold w-36">
                                    {q.number} Section {String.fromCharCode(64 + (q.number - 26))}
                                </div>

                                <div
                                    onDragOver={allowDrop}
                                    onDrop={onDropTo(q)}
                                    className="flex-1 min-w-[240px] border-2 border-dashed rounded-md px-3 py-1.5 bg-white"
                                >
                                    {filled ? (
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold uppercase">{val}</span>
                                            <span className="truncate">{headings[val]}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Drag heading here</span>
                                    )}
                                </div>

                                {filled && (
                                    <button
                                        className="ml-2 text-xs px-2 py-1 rounded border hover:bg-gray-50"
                                        onClick={() => clearSlot(q)}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ==================== Q32–36 (MCQs styled like other passages) ==================== */}
            <section>
                <h3 className="text-2xl font-bold text-[#32CD32] mb-1">Questions 32–36</h3>
                <p className="text-sm mb-4">
                    Choose the correct letter, <strong>A, B, C</strong> or <strong>D</strong>.
                </p>

                <div className="space-y-6">
                    {q32to36.map((q) => {
                        const opts = (q.options || {}) as Record<string, string>;
                        const letters = Object.keys(opts).sort();
                        const sel = (answers[idx(q.number)] || "").toUpperCase();

                        return (
                            <div id={`question-${idx(q.number)}`} key={q.number} className="text-[15px]">
                                <p className="font-semibold mb-2">
                                    {q.number} {q.question}
                                </p>
                                <div className="pl-6">
                                    {letters.map((L) => (
                                        <label
                                            key={L}
                                            className="flex items-start gap-2 cursor-pointer select-none mb-1"
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${q.number}`}
                                                value={L}
                                                checked={sel === L}
                                                onChange={() => onAnswerChange(idx(q.number), L)}
                                            />
                                            <span className="text-sm">
                        <span className="font-bold mr-2">{L}.</span>
                                                {opts[L]}
                      </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ==================== Q37–40 (TF/NG styled like Passage 1) ==================== */}
            <section>
                <h3 className="text-2xl font-bold text-[#32CD32] mb-1">Questions 37–40</h3>
                <p className="text-sm">
                    Do the following statements agree with the information given in Reading Passage 3?
                </p>
                <p className="text-sm mb-4">
                    In boxes <strong>37–40</strong> on your answer sheet, write{" "}
                    <strong>TRUE</strong> if the statement agrees with the information,{" "}
                    <strong>FALSE</strong> if it contradicts the information,{" "}
                    <strong>NOT GIVEN</strong> if there is no information on this.
                </p>

                <div className="space-y-6">
                    {q37to40.map((q) => {
                        const val = (answers[idx(q.number)] || "").toUpperCase();
                        const choices = ["TRUE", "FALSE", "NOT GIVEN"];
                        return (
                            <div id={`question-${idx(q.number)}`} key={q.number} className="text-[15px]">
                                <p className="font-semibold mb-2">
                                    {q.number} {q.question}
                                </p>
                                <div className="pl-6">
                                    {choices.map((c) => (
                                        <label
                                            key={c}
                                            className="flex items-start gap-2 cursor-pointer select-none mb-1"
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${q.number}`}
                                                value={c}
                                                checked={val === c}
                                                onChange={() => onAnswerChange(idx(q.number), c)}
                                            />
                                            <span className="text-sm font-semibold">{c}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
