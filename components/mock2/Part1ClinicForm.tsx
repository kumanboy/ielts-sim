"use client";

import React from "react";

interface Props {
    /** answers slice 0-9 (Q1-10) */
    answers: string[];
    /** callback enforced by TS71007 */
    onAnswerChangeAction: (idx: number, value: string) => void;
}

/* inline-gap helper */
const Gap = ({
                 q,
                 value,
                 onChange,
             }: {
    q: number;
    value: string;
    onChange: (v: string) => void;
}) => (
    <input
        id={`question-${q}`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-b border-gray-500 text-center focus:border-green-500 outline-none px-1 w-32 mx-1 inline-block"
        placeholder={`${q}`}
    />
);

export default function Part1ClinicForm({
                                            answers,
                                            onAnswerChangeAction,
                                        }: Props) {
    const set = (q: number, v: string) => onAnswerChangeAction(q - 1, v);

    return (
        <div className="space-y-6 text-sm leading-relaxed max-w-lg">

            <h3 className="font-semibold text-center text-lg mb-2">
                CLINIC REGISTRATION FORM
            </h3>

            {/* Address block with Q1 */}
            <p>
                <span className="font-semibold">Date of birth: </span>
                <br/>
                24/8/1972
                <br/>
                <span className="font-semibold">Present address: </span>

                Flat&nbsp;A, 37,&nbsp;
                <Gap q={1} value={answers[0] || ""} onChange={(v) => set(1, v)} /> House
                Plympton PL7&nbsp;8BH
            </p>

            {/* Q2 occupation */}
            <p>
                <span className="font-semibold">Current occupation:</span>{" "}
                <Gap q={2} value={answers[1] || ""} onChange={(v) => set(2, v)} />
            </p>

            {/* Q3 special need */}
            <p>
                <span className="font-semibold">Special needs:</span> Partially{" "}
                <Gap q={3} value={answers[2] || ""} onChange={(v) => set(3, v)} />
            </p>

            {/* Medical history – Q4 & Q5 */}
            <p className="font-semibold">Medical history (last 12 months)</p>
            <p>
                A stay in{" "}
                <Gap q={4} value={answers[3] || ""} onChange={(v) => set(4, v)} /> (June,
                one day)
            </p>
            <p>
                Injury: a{" "}
                <Gap q={5} value={answers[4] || ""} onChange={(v) => set(5, v)} />
            </p>

            {/* Additional notes – Q6 & Q7 */}
            <p className="font-semibold">Additional notes</p>
            <ul className="list-disc ml-6">
                <li>
                    a{" "}
                    <Gap q={6} value={answers[5] || ""} onChange={(v) => set(6, v)} /> (recent)
                </li>
                <li>
                    one{" "}
                    <Gap q={7} value={answers[6] || ""} onChange={(v) => set(7, v)} /> (e.g.
                    water)
                </li>
            </ul>

            {/* ────────── MCQs 8-10 (unchanged) ────────── */}
            <div className="space-y-4 pt-6 text-base">

                {/* Q8 */}
                <div id="question-8">
                    <p className="font-medium mb-1">
                        8. When will Alan have his clinic appointment?
                    </p>
                    {["A", "B", "C"].map((opt, i) => {
                        const txt = ["Tuesday", "Wednesday", "Thursday"][i];
                        return (
                            <label key={opt} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="q8"
                                    value={opt.toLowerCase()}
                                    checked={answers[7]?.toLowerCase() === opt.toLowerCase()}
                                    onChange={() => onAnswerChangeAction(7, opt.toLowerCase())}
                                />
                                {opt}) {txt}
                            </label>
                        );
                    })}
                </div>

                {/* Q9 */}
                <div id="question-9">
                    <p className="font-medium mb-1">
                        9. Transport Alan will use to get to the clinic:
                    </p>
                    {["A", "B", "C"].map((opt, i) => {
                        const txt = ["Own car", "Bus", "Taxi"][i];
                        return (
                            <label key={opt} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="q9"
                                    value={opt.toLowerCase()}
                                    checked={answers[8]?.toLowerCase() === opt.toLowerCase()}
                                    onChange={() => onAnswerChangeAction(8, opt.toLowerCase())}
                                />
                                {opt}) {txt}
                            </label>
                        );
                    })}
                </div>

                {/* Q10 */}
                <div id="question-10">
                    <p className="font-medium mb-1">
                        10. How did Alan find out about the clinic?
                    </p>
                    {["A", "B", "C"].map((opt, i) => {
                        const txt = ["The Internet", "A list in the library", "A colleague"][i];
                        return (
                            <label key={opt} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="q10"
                                    value={opt.toLowerCase()}
                                    checked={answers[9]?.toLowerCase() === opt.toLowerCase()}
                                    onChange={() => onAnswerChangeAction(9, opt.toLowerCase())}
                                />
                                {opt}) {txt}
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
