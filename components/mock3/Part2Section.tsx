// components/mock3/Part2Section.tsx
"use client";

import React from "react";

interface Props {
    answers: string[];                               // slice 10..19
    onAnswerChangeAction: (idx: number, v: string) => void;
    onBulkChange?: (pairs: [number, string][]) => void;  // ← NEW (optional)
}

export default function Part2Section({
                                         answers,
                                         onAnswerChangeAction,
                                         onBulkChange,
                                     }: Props) {
    const set = (i: number, v: string) => onAnswerChangeAction(i, v);

    // === Q14–15 helpers ===
    const pickedList = () =>
        answers.slice(3, 5).map((s) => s.toUpperCase()).filter(Boolean);

    const isPicked = (letter: string) => pickedList().includes(letter);

    const writeBoth = (a: string | undefined, b: string | undefined) => {
        if (onBulkChange) onBulkChange([[3, a || ""], [4, b || ""]]);
        else {
            // fallback: still safe if parent uses functional setState
            onAnswerChangeAction(3, a || "");
            onAnswerChangeAction(4, b || "");
        }
    };

    const toggleTwoLetterPick = (letter: string) => {
        const cur = pickedList();
        let next = [...cur];

        if (cur.includes(letter)) {
            next = cur.filter((x) => x !== letter);
        } else if (cur.length < 2) {
            next.push(letter);
        } else {
            return; // already have 2 selected
        }

        writeBoth(next[0], next[1]);
    };

    return (
        <div className="space-y-8">
            {/* ===== Questions 11–13 ===== */}
            <div className="">
                <p className="text-[#32CD32] font-bold">Questions 11–13</p>
                <p className="text-sm text-gray-700">
                    Choose the correct letter, <strong>A, B</strong> or <strong>C</strong>.
                </p>
            </div>

            {/* 11 */}
            <div className="space-y-2">
                <span id="question-10" className="invisible absolute -mt-24" />
                <p className="font-semibold">11&nbsp; The Bridge Hotel is located in</p>
                {["A. the city centre", "B. the country", "C. the suburbs"].map((label) => (
                    <label key={label} className="flex items-center gap-2 pl-4">
                        <input
                            type="radio"
                            name="q11"
                            value={label[0]}
                            checked={answers[0].toUpperCase() === label[0]}
                            onChange={(e) => set(0, e.target.value)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            {/* 12 */}
            <div className="space-y-2">
                <span id="question-11" className="invisible absolute -mt-24" />
                <p className="font-semibold">12&nbsp; The newest sports facility in the hotel is</p>
                {["A. a swimming pool", "B. a fitness centre", "C. a tennis court"].map((label) => (
                    <label key={label} className="flex items-center gap-2 pl-4">
                        <input
                            type="radio"
                            name="q12"
                            value={label[0]}
                            checked={answers[1].toUpperCase() === label[0]}
                            onChange={(e) => set(1, e.target.value)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            {/* 13 */}
            <div className="space-y-2">
                <span id="question-12" className="invisible absolute -mt-24" />
                <p className="font-semibold">13&nbsp; The hotel restaurant specialises in</p>
                {["A. healthy food", "B. local food", "C. international food"].map((label) => (
                    <label key={label} className="flex items-center gap-2 pl-4">
                        <input
                            type="radio"
                            name="q13"
                            value={label[0]}
                            checked={answers[2].toUpperCase() === label[0]}
                            onChange={(e) => set(2, e.target.value)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            {/* ===== Questions 14 and 15 ===== */}
            <div className="">
                <p className="text-[#32CD32] font-bold">Questions 14 and 15</p>
                <p className="text-sm text-gray-700">
                    Choose <strong>TWO</strong> letters, <strong>A–E</strong>.
                </p>
                <p className="text-sm text-gray-700">Which <strong>TWO</strong> business facilities are mentioned?</p>
            </div>

            <div className="space-y-2">
                <span id="question-13" className="invisible absolute -mt-24" />
                <span id="question-14" className="invisible absolute -mt-24" />
                {[
                    "A. internet access",
                    "B. mobile phone hire",
                    "C. audio-visual facilities",
                    "D. airport transport",
                    "E. translation services",
                ].map((label) => {
                    const letter = label[0];
                    return (
                        <label key={label} className="flex items-center gap-2 pl-4">
                            <input
                                type="checkbox"
                                checked={isPicked(letter)}
                                onChange={() => toggleTwoLetterPick(letter)}
                            />
                            {label}
                        </label>
                    );
                })}
                <p className="text-xs text-gray-500 pl-4">
                    Selected: {answers.slice(3, 5).filter(Boolean).join(" / ") || "—"}
                </p>
            </div>

            {/*/!* ===== Questions 16–20 ===== *!/*/}
            {/*<div className="p-3 rounded border border-green-200 bg-green-50">*/}
            {/*    <p className="text-[#32CD32] font-bold">Questions 16–20</p>*/}
            {/*    <p className="text-sm text-gray-700">*/}
            {/*        Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.*/}
            {/*    </p>*/}
            {/*</div>*/}

            {/*{[*/}
            {/*    "16 (capacity of the conference room)",*/}
            {/*    "17 (when evening entertainment is available)",*/}
            {/*    "18 (type of dinner offered)",*/}
            {/*    "19 (price of dinner in dollars)",*/}
            {/*    "20 (where guests can play golf)",*/}
            {/*].map((q, i) => (*/}
            {/*    <div key={i} className="space-y-1">*/}
            {/*        <span id={`question-${15 + i}`} className="invisible absolute -mt-24" />*/}
            {/*        <label className="font-semibold">{q}</label>*/}
            {/*        <input*/}
            {/*            type="text"*/}
            {/*            value={answers[i + 5]}*/}
            {/*            onChange={(e) => set(i + 5, e.target.value)}*/}
            {/*            className="border rounded p-2 w-full max-w-md"*/}
            {/*            placeholder="Your answer"*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*))}*/}
        </div>
    );
}
