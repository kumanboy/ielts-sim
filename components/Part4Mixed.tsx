"use client";

import React from "react";

/* ─────────────────── Types ─────────────────── */
export interface Part4MixedProps {
    /** answers slice for Q31–40 (index 0=Q31 ... 9=Q40) */
    answers: string[];
    /** bubble change back up (local 0‑9 → global Q31‑40) */
    onAnswerChangeAction: (localIdx: number, value: string) => void;
}

/* ── MCQ Questions ──────────────────────── */
const mcq = [
    {
        q: 31,
        prompt:
            "Participants in the Learner Persistence study were all drawn from the same …",
        opts: [
            ["A", "age group"],
            ["B", "geographical area"],
            ["C", "socio‑economic level"],
        ] as const,
    },
    {
        q: 32,
        prompt:
            "When starting their course, older students were most concerned about …",
        opts: [
            ["A", "effects on their home life"],
            ["B", "implications for their future career"],
            ["C", "financial constraints"],
        ] as const,
    },
] as const;

/* ── Blank field with placeholder numbers ───────────────────── */
const makeBlank =
    (ans: string[], set: Part4MixedProps["onAnswerChangeAction"]) =>
        (idx: number, w = 90) => (
            <input
                value={ans[idx]}
                onChange={(e) => set(idx + 2, e.target.value)} // offset by 2 for Q33–40
                className="border-0 border-b border-dotted border-gray-600 focus:border-[#32CD32] outline-none text-center"
                style={{ width: w }}
                placeholder={`${idx + 33}`} // shows correct Q33–40
            />
        );

/* ── Main Component ───────────────────── */
function Part4Mixed({ answers, onAnswerChangeAction }: Part4MixedProps) {
    const mcqAnswers = answers.slice(0, 2); // Q31–32
    const blankAnswers = answers.slice(2); // Q33–40

    const blank = makeBlank(blankAnswers, onAnswerChangeAction);

    return (
        <>
            {/* ───────────── MCQ 31‑32 ───────────── */}
            <h3 className="mt-8 font-medium">
                <strong>Questions 31‑32</strong> – Choose the correct letter{" "}
                <strong>A, B or C</strong>.
            </h3>

            {mcq.map(({ q, prompt, opts }) => (
                <div key={q} className="mt-4">
                    <p className="font-semibold">
                        {q}&nbsp;{prompt}
                    </p>

                    <ul className="mt-1 space-y-1 pl-6">
                        {opts.map(([ltr, txt]) => (
                            <li key={ltr} className="flex items-start gap-2">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="radio"
                                        name={`q${q}`}
                                        value={ltr}
                                        checked={mcqAnswers[q - 31] === ltr}
                                        onChange={() => onAnswerChangeAction(q - 31, ltr)}
                                    />
                                    <span>
                    <span className="font-bold">{ltr}</span> {txt}
                  </span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* ───────────── Table 33‑37 ───────────── */}
            <h3 className="mt-10 font-medium">
                <strong>Questions 33‑37</strong> – Complete the table (ONE WORD ONLY).
            </h3>

            <table className="mt-4 w-full text-[13px] border border-gray-700 border-collapse">
                <thead>
                <tr className="bg-gray-200 text-center font-semibold">
                    <th colSpan={4} className="border border-gray-700 px-6 py-6 text-base">
                        Research findings
                    </th>
                </tr>
                <tr className="bg-gray-200 text-center font-semibold leading-tight">
                    <th className="border border-gray-700 px-6 py-6 w-56" />
                    <th className="border border-gray-700 px-6 py-6 w-56">
                        Social and&nbsp;
                        <br />
                        Environmental Factors
                    </th>
                    <th className="border border-gray-700 px-6 py-6 w-44">Other Factors</th>
                    <th className="border border-gray-700 px-6 py-6 w-56">
                        Personal&nbsp;Characteristics
                    </th>
                </tr>
                </thead>
                <tbody className="[&>tr>*]:border [&>tr>*]:border-gray-700 [&>td]:px-6 [&>td]:py-6">
                <tr className="bg-gray-50 px-4 py-4">
                    <td className="font-semibold px-6 py-6">First level of importance</td>
                    <td className="font-semibold px-6 py-6">Effective support</td>
                    <td className="font-semibold px-6 py-6">Perceived success in study</td>
                    <td className="font-semibold px-6 py-6">
                        Enjoyment of a {blank(0, 70)}
                    </td>
                </tr>
                <tr>
                    <td className="font-semibold px-6 py-6">Second level of importance</td>
                    <td className="font-semibold px-6 py-6">
                        Positive experiences at {blank(1, 70)}
                    </td>
                    <td className="font-semibold px-6 py-6">Good {blank(2, 60)}</td>
                    <td className="font-semibold px-6 py-6">
                        Many {blank(3, 65)} in daily life
                    </td>
                </tr>
                <tr className="bg-gray-50">
                    <td className="font-semibold px-6 py-6">Third level of importance</td>
                    <td className="font-semibold px-6 py-6">
                        Good interaction with the {blank(4, 70)}
                    </td>
                    <td className="font-semibold px-6 py-6">No family problems</td>
                    <td className="font-semibold px-6 py-6">Capacity for multi‑tasking</td>
                </tr>
                </tbody>
            </table>

            {/* ───────────── Notes 38‑40 ───────────── */}
            <h3 className="mt-10 font-medium">
                <strong>Questions 38‑40</strong> – Complete the notes (ONE WORD ONLY).
            </h3>

            <p className="mt-4">
                Ask new students to complete questionnaires to gauge their level of{" "}
                {blank(5, 90)}.
            </p>
            <p className="mt-3">
                Train selected students to act as {blank(6, 90)}.
            </p>
            <p className="mt-3">Outside office hours, offer {blank(7, 90)} help.</p>
        </>
    );
}

Part4Mixed.displayName = "Part4Mixed";
export default Part4Mixed;
