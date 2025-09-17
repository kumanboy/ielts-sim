"use client";

import React from "react";

interface Props {
    answers: string[]; // 10 answers for Q21–30
    onAnswerChangeAction: (idx: number, v: string) => void;
}

/** inline dotted blank, with paginator anchor ids */
const gap = (qNumber: number, value: string, set: (v: string) => void) => {
    // qNumber is the printed number (21..30). Anchor id uses 0-based index.
    const anchorId = `question-${qNumber - 1}`;
    return (
        <>
            <span id={anchorId} className="invisible absolute -mt-24" />
            <input
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={`${qNumber}`}
                className="inline-block w-56 max-w-full border-b border-dotted outline-none text-center mx-1"
            />
        </>
    );
};

export default function Part3Section({ answers, onAnswerChangeAction }: Props) {
    const set = (i: number, v: string) => onAnswerChangeAction(i, v);

    return (
        <article className="space-y-8 leading-7">
            {/* ===== Questions 21 & 22 ===== */}
            <div className="p-3 rounded border border-green-200 bg-green-50">
                <p className="text-[#32CD32] font-bold">Questions 21 and 22</p>
                <p className="text-sm text-gray-700">
                    Complete the sentences below.
                    <br />
                    Write <strong>NO MORE THAN TWO WORDS</strong> for each answer.
                </p>
            </div>

            <div>
                <p className="font-bold text-center">Research Project</p>
                <ul className="list-disc pl-6">
                    <li>Harry and Katy have to concentrate on coastal change for their next project.</li>
                    <li>
                        <span className="font-semibold">21</span>&nbsp; Their work could be delayed by the{" "}
                        {gap(21, answers[0], (v) => set(0, v))}.
                    </li>
                    <li>They plan to get help from the Marine Biology Unit.</li>
                    <li>
                        <span className="font-semibold">22</span>&nbsp; Before they go to the beach, they need to visit the{" "}
                        {gap(22, answers[1], (v) => set(1, v))}.
                    </li>
                </ul>
            </div>

            {/* ===== Questions 23–26 ===== */}
            <div className="p-3 rounded border border-green-200 bg-green-50">
                <p className="text-[#32CD32] font-bold">Questions 23 – 26</p>
                <p className="text-sm text-gray-700">Who will do each of the following tasks?</p>
                <p className="text-sm text-gray-700">
                    Write the correct letter, <strong>A, B</strong> or <strong>C</strong>, next to questions 23–26.
                </p>
            </div>

            {/* Legend box A/B/C */}
            <div className="border rounded p-3 w-full max-w-sm">
                <p>A&nbsp;&nbsp;Katy</p>
                <p>B&nbsp;&nbsp;Harry</p>
                <p>C&nbsp;&nbsp;Both Katy and Harry</p>
            </div>

            {/* Tasks 23–26 (letters A/B/C) */}
            {[
                { q: 23, text: "take photographs" },
                { q: 24, text: "collect samples" },
                { q: 25, text: "interview people" },
                { q: 26, text: "analyse data" },
            ].map(({ q, text }, idx) => {
                const aIndex = 2 + idx; // answers[2..5]
                return (
                    <div key={q} className="space-y-1">
                        <span id={`question-${q - 1}`} className="invisible absolute -mt-24" />
                        <p className="font-semibold">
                            {q} {text}
                        </p>
                        <div className="flex items-center gap-6 pl-2">
                            {["A", "B", "C"].map((opt) => (
                                <label key={opt} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`q${q}`}
                                        value={opt}
                                        checked={answers[aIndex].toUpperCase() === opt}
                                        onChange={(e) => set(aIndex, e.target.value)}
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* ===== Questions 27–30 ===== */}
            <div className="p-3 rounded border border-green-200 bg-green-50">
                <p className="text-[#32CD32] font-bold">Questions 27 – 30</p>
                <p className="text-sm text-gray-700">
                    Choose the correct letter, <strong>A, B</strong> or <strong>C</strong>.
                </p>
            </div>

            {/* Q27 */}
            <div className="space-y-2">
                <span id="question-26" className="invisible absolute -mt-24" />
                <p className="font-semibold">27&nbsp; Why does Harry want to do the presentation?</p>
                {[
                    "A. to practise skills for his future career",
                    "B. to catch up with his course requirements",
                    "C. to get a better mark than for his last presentation",
                ].map((label) => (
                    <label key={label} className="flex items-center gap-2 pl-4">
                        <input
                            type="radio"
                            name="q27"
                            value={label[0]}
                            checked={answers[6].toUpperCase() === label[0]}
                            onChange={(e) => set(6, e.target.value)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            {/* Q28 */}
            <div className="space-y-2">
                <span id="question-27" className="invisible absolute -mt-24" />
                <p className="font-semibold">28&nbsp; What is Katy’s attitude to writing up the project?</p>
                {[
                    "A. She is worried about the time available for writing.",
                    "B. She thinks it is unfair if she has to do all the writing.",
                    "C. She is concerned that some parts will be difficult.",
                ].map((label) => (
                    <label key={label} className="flex items-center gap-2 pl-4">
                        <input
                            type="radio"
                            name="q28"
                            value={label[0]}
                            checked={answers[7].toUpperCase() === label[0]}
                            onChange={(e) => set(7, e.target.value)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            {/* Q29 */}
            <div className="space-y-2">
                <span id="question-28" className="invisible absolute -mt-24" />
                <p className="font-semibold">
                    29&nbsp; Why does Harry want to involve the other students at the end of the presentation?
                </p>
                {[
                    "A. to get their opinions about the conclusions",
                    "B. to help him and Katy reach firm conclusions",
                    "C. to see if they have reached similar conclusions",
                ].map((label) => (
                    <label key={label} className="flex items-center gap-2 pl-4">
                        <input
                            type="radio"
                            name="q29"
                            value={label[0]}
                            checked={answers[8].toUpperCase() === label[0]}
                            onChange={(e) => set(8, e.target.value)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            {/* Q30 */}
            <div className="space-y-2">
                <span id="question-29" className="invisible absolute -mt-24" />
                <p className="font-semibold">30&nbsp; Katy agrees to deal with any questions because</p>
                {[
                    "A. she feels she will be confident about the material.",
                    "B. Harry will be doing the main presentation.",
                    "C. she has already told Dr Smith she will do this.",
                ].map((label) => (
                    <label key={label} className="flex items-center gap-2 pl-4">
                        <input
                            type="radio"
                            name="q30"
                            value={label[0]}
                            checked={answers[9].toUpperCase() === label[0]}
                            onChange={(e) => set(9, e.target.value)}
                        />
                        {label}
                    </label>
                ))}
            </div>
        </article>
    );
}
