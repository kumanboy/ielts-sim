"use client";

import React from "react";

interface Props {
    answers: string[]; // 0..9
    onAnswerChangeAction: (idx: number, v: string) => void;
}

/* inline blank identical to your style (dotted underline) */
const blank = (i: number, val: string, set: (v: string) => void) => (
    <input
        key={i}
        id={`question-${i - 1}`} // anchor for paginator scroll (Q3 => question-2)
        value={val}
        onChange={(e) => set(e.target.value)}
        className="inline-block w-24 border-b border-dotted outline-none text-center mx-1"
        placeholder={`${i}`}
    />
);

export default function Part1JobInterview({ answers, onAnswerChangeAction }: Props) {
    const set = (i: number, v: string) => onAnswerChangeAction(i, v);

    return (
        <article className="leading-7 space-y-5">
            {/* Instruction for Q1–2 */}
            <p className="text-sm text-gray-700">
                <span id="question-0" className="invisible absolute -mt-24" />
                Q1–2: Choose the correct letter A, B or C.
            </p>

            {/* Q1 */}
            <div className="space-y-2">
                <p className="font-semibold">1&nbsp;&nbsp;What kind of shop is it?</p>
                {[
                    "A. a ladies’ dress shop",
                    "B. a department store",
                    "C. a children’s clothes shop",
                ].map((label) => (
                    <label key={label} className="flex items-center gap-2 pl-4">
                        <input
                            type="radio"
                            name="q1"
                            value={label[0]}
                            checked={answers[0].toUpperCase() === label[0]}
                            onChange={(e) => set(0, e.target.value)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            {/* Q2 */}
            <div className="space-y-2">
                <span id="question-1" className="invisible absolute -mt-24" />
                <p className="font-semibold">
                    2&nbsp;&nbsp;What is the name of the section Penny will be working in?
                </p>
                {["A. the Youngster", "B. the Youngset", "C. the Young Set"].map(
                    (label) => (
                        <label key={label} className="flex items-center gap-2 pl-4">
                            <input
                                type="radio"
                                name="q2"
                                value={label[0]}
                                checked={answers[1].toUpperCase() === label[0]}
                                onChange={(e) => set(1, e.target.value)}
                            />
                            {label}
                        </label>
                    )
                )}
            </div>

            {/* ===== Header for Q3–10 ===== */}
            <div className="">
                <p className="text-[#32CD32] font-bold">Questions 3–10</p>
                <p className="text-sm text-gray-700">
                    Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.
                </p>
            </div>

            {/* Q3–10 gap-fill notes */}
            <div className="space-y-3">
                <p className="font-semibold">Pay:</p>
                <p>$6.50 an hour</p>

                <p className="font-semibold">Breaks:</p>
                <p>
                    one hour for lunch and {blank(3, answers[2], (v) => set(2, v))} coffee breaks
                </p>

                <p className="font-semibold">Holidays:</p>
                <p>
                    three weeks a year in the first two years
                    <br />
                    four weeks a year in the {blank(4, answers[3], (v) => set(3, v))}
                </p>

                <p className="font-semibold">Staff training:</p>
                <p>
                    held on the {blank(5, answers[4], (v) => set(4, v))} of every month
                </p>

                <p className="font-semibold">Special staff benefits or ‘perks’:</p>
                <p>
                    staff discount of {blank(6, answers[5], (v) => set(5, v))} on
                    <br />
                    everything except sale goods
                </p>

                <p className="font-semibold">Information on pension:</p>
                <p>
                    see Personnel Manager, office in {blank(7, answers[6], (v) => set(6, v))}
                </p>

                <p className="font-semibold">Boss’s name:</p>
                <p>{blank(8, answers[7], (v) => set(7, v))}</p>

                <p className="font-semibold">Duties:</p>
                <p>
                    serve customers
                    <br />
                    {blank(9, answers[8], (v) => set(8, v))}
                    <br />
                    check for shoplifters
                    <br />
                    check the stock
                </p>

                <p className="font-semibold">Expected to wear:</p>
                <p>
                    a {blank(10, answers[9], (v) => set(9, v))}, a red blouse,
                    <br />
                    and a name badge
                </p>
            </div>
        </article>
    );
}
