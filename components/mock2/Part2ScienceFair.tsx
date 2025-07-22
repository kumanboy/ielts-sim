// components/mock2/Part2ScienceFair.tsx
"use client";

import React from "react";
import Image from "next/image";

interface Props {
    answers: string[];                 // slice 10‑19
    onAnswerChangeAction: (idx: number, v: string) => void;
}

const OptionLetters = ["A", "B", "C", "D", "E"];

/* one line with five radio buttons (A‑E) */
const RadioRow = ({
                      q,
                      value,
                      onChange,
                  }: {
    q: number;
    value: string;
    onChange: (v: string) => void;
}) => (
    <div id={`question-${q}`} className="flex items-center gap-3 ml-6">
        <span className="w-6 font-semibold">{q}.</span>
        {OptionLetters.map((l) => (
            <label key={l} className="flex items-center gap-1">
                <input
                    type="radio"
                    name={`q${q}`}
                    value={l.toLowerCase()}
                    checked={value === l.toLowerCase()}
                    onChange={() => onChange(l.toLowerCase())}
                />
                {l}
            </label>
        ))}
    </div>
);

export default function Part2ScienceFair({
                                             answers,
                                             onAnswerChangeAction,
                                         }: Props) {
    const set = (i: number, v: string) => onAnswerChangeAction(i, v);

    /* texts & options exactly as in the PDF */
    const ablockHeading =
        "According to the speaker, what are the TWO reasons why the fair was first organised?";
    const bblockHeading =
        "What TWO things do people often forget to include in their displays?";
    const cblockHeading =
        "What are the TWO biggest growth areas at the fair?";

    const optionSets: Record<string, string[]> = {
        ablock: [
            "Science was well taught in local schools.",
            "A local factory gave generous sponsorship.",
            "Exam performance needed improvement.",
            "Another fair stopped running.",
            "A good site for the fair became available.",
        ],
        bblock: [
            "procedures followed",
            "materials used",
            "a summary of the whole project",
            "conclusions drawn",
            "photos of work in progress",
        ],
        cblock: [
            "interactive displays",
            "pre‑school projects",
            "energy conservation projects",
            "the number of people attending",
            "cutting‑edge research projects",
        ],
    };

    return (
        <div className="space-y-10">
            {/* 11‑12 */}
            <section>
                <p className="italic mb-1">{ablockHeading}</p>
                <p className="mb-2">
                    Choose TWO answers and write the correct letters A–E in boxes 11 and 12 on your answer sheet.
                </p>
                <ul className="ml-6 list-none mb-3 space-y-0.5">
                    {optionSets.ablock.map((t, i) => (
                        <li key={i}>
                            <span className="font-semibold">{OptionLetters[i]})</span> {t}
                        </li>
                    ))}
                </ul>
                {[11, 12].map((q, i) => (
                    <RadioRow
                        key={q}
                        q={q}
                        value={answers[i] || ""}
                        onChange={(v) => set(i, v)}
                    />
                ))}
            </section>

            {/* 13‑14 */}
            <section>
                <p className="italic mb-1">{bblockHeading}</p>
                <p className="mb-2">
                    Choose TWO answers and write the correct letters A–E in boxes 13 and 14 on your answer sheet.
                </p>
                <ul className="ml-6 list-none mb-3 space-y-0.5">
                    {optionSets.bblock.map((t, i) => (
                        <li key={i}>
                            <span className="font-semibold">{OptionLetters[i]})</span> {t}
                        </li>
                    ))}
                </ul>
                {[13, 14].map((q, i) => (
                    <RadioRow
                        key={q}
                        q={q}
                        value={answers[i + 2] || ""}
                        onChange={(v) => set(i + 2, v)}
                    />
                ))}
            </section>

            {/* 15‑16 */}
            <section>
                <p className="italic mb-1">{cblockHeading}</p>
                <p className="mb-2">
                    Choose TWO answers and write the correct letters A–E in boxes 15 and 16 on your answer sheet.
                </p>
                <ul className="ml-6 list-none mb-3 space-y-0.5">
                    {optionSets.cblock.map((t, i) => (
                        <li key={i}>
                            <span className="font-semibold">{OptionLetters[i]})</span> {t}
                        </li>
                    ))}
                </ul>
                {[15, 16].map((q, i) => (
                    <RadioRow
                        key={q}
                        q={q}
                        value={answers[i + 4] || ""}
                        onChange={(v) => set(i + 4, v)}
                    />
                ))}
            </section>

            {/* 17‑20 map + dropdowns */}
            <section className="pt-2 space-y-4">
                <p className="font-medium">Questions 17‑20 – Label the plan (letters A‑I)</p>

                <Image
                    src="/map2.png"
                    alt="Exhibition hall plan"
                    width={500}
                    height={200}
                    className="border"
                />

                {[
                    { q: 17, label: "Registration", i: 6 },
                    { q: 18, label: "Gaming zone", i: 7 },
                    { q: 19, label: "Commercial displays", i: 8 },
                    { q: 20, label: "Video room", i: 9 },
                ].map(({ q, label, i }) => (
                    <div key={q} id={`question-${q}`} className="flex items-center gap-2">
                        <span className="w-6 font-semibold">{q}.</span>
                        <span className="flex-1 min-w-[180px]">{label}</span>
                        <select
                            className="border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-green-300 w-20"
                            value={answers[i] || ""}
                            onChange={(e) => onAnswerChangeAction(i, e.target.value)}
                        >
                            <option value="">--</option>
                            {["A", "B", "C", "D", "E", "F", "G", "H", "I"].map((l) => (
                                <option key={l} value={l.toLowerCase()}>
                                    {l}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </section>
        </div>
    );
}
