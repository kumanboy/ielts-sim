/* app/components/mock2‑reading/Passage3TimeHistory.tsx
   Passage 3 – Time & History (Questions 27‑40)
*/
"use client";

import React, { useMemo } from "react";
import type { PassageData, Question } from "@/app/reading/mock-2/page";

/* ───────── helpers & types ───────── */

interface Props {
    part: PassageData;
    answers: string[];
    onAnswerChange(i: number, v: string): void;
}
const qi = (q: number) => q - 1;

/* ───────── tiny reusable UI bits ───────── */

function RadioList({
                       name,
                       value,
                       opts,
                       onChange,
                   }: {
    name: string;
    value: string;
    opts: { v: string; label: string }[];
    onChange: (v: string) => void;
}) {
    return (
        <ul className="mt-1 space-y-1 pl-6 text-sm">
            {opts.map((o) => (
                <li key={o.v}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="radio"
                            name={name}
                            value={o.v}
                            checked={value === o.v}
                            onChange={() => onChange(o.v)}
                        />
                        <span>
              <strong>{o.v}.</strong> {o.label}
            </span>
                    </label>
                </li>
            ))}
        </ul>
    );
}

/* ───────── main component ───────── */

export default function Passage3TimeHistory({
                                                part,
                                                answers,
                                                onAnswerChange,
                                            }: Props) {
    const qMap = useMemo(
        () => new Map<number, Question>(part.questions.map((q) => [q.number, q])),
        [part.questions],
    );

    /* ---------- 27‑31 MCQ ---------- */
    const mcqNums = [27, 28, 29, 30, 31] as const;
    const letterFor = (i: number) => String.fromCharCode(65 + i); // 0→A

    /* ---------- 32‑33 “Choose TWO” ---------- */
    const twoLetterOpts = ["A", "B", "C", "D", "E"] as const;
    const pair32 = [answers[qi(32)], answers[qi(33)]];
    const setPair = (base: number, idx: 0 | 1, v: string) => {
        const other = answers[qi(base + (idx ^ 1))];
        onAnswerChange(qi(base + idx), v === other ? "" : v);
    };

    /* ---------- 34‑39 sentence endings (A‑H) ---------- */
    const endingNums = [34, 35, 36, 37, 38, 39] as const;
    const collectEndingOpts = () => {
        // if data file has an options object (A‑H) on any of these, reuse it
        const sample = qMap.get(34)?.options;
        if (sample && typeof sample === "object" && !Array.isArray(sample))
            return Object.entries(sample as Record<string, string>).map(([v, l]) => ({
                v,
                label: l,
            }));
        // else fall back to a hard‑coded list taken from your screenshots
        return [
            { v: "A", label: "ships at sea" },
            { v: "B", label: "cheap, mechanical clocks" },
            { v: "C", label: "government offices" },
            { v: "D", label: "the train companies" },
            { v: "E", label: "news broadcasts" },
            { v: "F", label: "limits on working hours" },
            { v: "G", label: "objects which register the time" },
            { v: "H", label: "standard national time" },
        ];
    };
    const endingOpts = collectEndingOpts();

    /* ---------- 40 single MCQ ---------- */
    const q40 = qMap.get(40);

    /* ───────── render ───────── */

    return (
        <div className="space-y-10 mt-4 text-[15px] leading-relaxed">
            <h2 className="sr-only">{part.title}</h2>

            {/* 27‑31 MCQ --------------------------------------------------- */}
            <section>
                <h3 className="text-lg font-semibold mb-2">Questions 27 – 31</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Choose the correct letter, A – D.
                </p>

                {mcqNums.map((n) => {
                    const q = qMap.get(n)!;
                    const opts: { v: string; label: string }[] = Array.isArray(q.options)
                        ? (q.options as string[]).map((txt, i) => ({
                            v: letterFor(i),
                            label: txt,
                        }))
                        : Object.entries(
                            (q.options as Record<string, string>) ?? {},
                        ).map(([v, l]) => ({ v, label: l }));

                    return (
                        <div key={n} id={`question-${n - 1}`} className="mb-4">
                            <p className="font-medium mb-1">
                                {n}. {q.question}
                            </p>
                            <RadioList
                                name={`mcq-${n}`}
                                value={answers[qi(n)]}
                                onChange={(v) => onAnswerChange(qi(n), v)}
                                opts={opts}
                            />
                        </div>
                    );
                })}
            </section>

            {/* 32‑33 TWO letters ------------------------------------------ */}
            <section>
                <h3 className="text-lg font-semibold mb-2">Questions 32 – 33</h3>
                <p className="mb-4">
                    Below are some possible reasons why there were no detailed transport
                    timetables in 18th‑century Britain. Which <strong>TWO</strong> of
                    these reasons are mentioned by the writer?
                    <br />
                    Choose <strong>TWO</strong> letters, A‑E.
                </p>

                {twoLetterOpts.map((opt) => {
                    const checkedCount =
                        (pair32[0] === opt ? 1 : 0) + (pair32[1] === opt ? 1 : 0);
                    const checked = checkedCount > 0;
                    const disabled = !checked && pair32.every(Boolean); // already two chosen
                    return (
                        <label
                            key={opt}
                            className={`flex items-center gap-2 cursor-pointer select-none pl-6 text-sm ${
                                disabled ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => {
                                    const slot: 0 | 1 =
                                        checked && pair32[0] === opt
                                            ? 0
                                            : checked && pair32[1] === opt
                                                ? 1
                                                : pair32[0]
                                                    ? 1
                                                    : 0;
                                    setPair(32, slot, checked ? "" : opt);
                                }}
                            />
                            <span className="font-semibold">{opt}</span>
                        </label>
                    );
                })}
            </section>

            {/* 34‑39 sentence endings ------------------------------------- */}
            <section>
                <h3 className="text-lg font-semibold mb-2">Questions 34 – 39</h3>
                <p className="mb-4">
                    Complete each sentence with the correct ending, A‑H, from the list
                    below. Write the correct letter A‑H in boxes 34‑39.
                </p>


                {endingNums.map((n) => (
                    <div key={n} id={`question-${n - 1}`} className="mb-4">
                        <p className="font-medium mb-1">
                            {n}. {qMap.get(n)?.question}
                        </p>
                        <RadioList
                            name={`end-${n}`}
                            value={answers[qi(n)]}
                            onChange={(v) => onAnswerChange(qi(n), v)}
                            opts={endingOpts}
                        />
                    </div>
                ))}
            </section>

            {/* Question 40 single MCQ ------------------------------------ */}
            {q40 && (
                <section>
                    <h3 className="text-lg font-semibold mb-2">Question 40</h3>
                    <p className="font-medium mb-1">{q40.question}</p>
                    <RadioList
                        name="q40"
                        value={answers[qi(40)]}
                        onChange={(v) => onAnswerChange(qi(40), v)}
                        opts={Array.isArray(q40.options)
                            ? (q40.options as string[]).map((txt, i) => ({
                                v: letterFor(i),
                                label: txt,
                            }))
                            : Object.entries(
                                (q40.options as Record<string, string>) ?? {},
                            ).map(([v, l]) => ({ v, label: l }))}
                    />
                </section>
            )}
        </div>
    );
}
