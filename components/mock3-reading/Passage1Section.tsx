// components/mock3-reading/Passage1SpiderSilk.tsx
"use client";

import React from "react";
import { PassageData } from "@/app/reading/mock-2/page"; // same type used there

type Props = {
    part: PassageData;                    // Passage 1 data (A–I sections + questions)
    answers: string[];                    // full 40-length answers array from parent
    onAnswerChange: (idx: number, val: string) => void; // idx = questionNumber-1
};

const lettersAI = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

function RadioRow({
                      name,
                      value,
                      options,
                      onChange,
                  }: {
    name: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
}) {
    return (
        <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-2 pl-1 text-sm">
            {options.map((opt) => (
                <li key={opt} className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="radio"
                            name={name}
                            value={opt}
                            checked={value.trim().toUpperCase() === opt}
                            onChange={() => onChange(opt)}
                        />
                        <span className="font-bold">{opt}</span>
                    </label>
                </li>
            ))}
        </ul>
    );
}

function TFNGGroup({
                       name,
                       value,
                       onChange,
                       labels = ["TRUE", "FALSE", "NOT GIVEN"],
                   }: {
    name: string;
    value: string;
    onChange: (v: string) => void;
    labels?: string[];
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
                            checked={value.trim().toUpperCase() === lbl}
                            onChange={() => onChange(lbl)}
                        />
                        <span className="font-semibold">{lbl}</span>
                    </label>
                </li>
            ))}
        </ul>
    );
}

function Blank({
                   value,
                   onChange,
                   width = 180,
                   placeholder,
               }: {
    value: string;
    onChange: (v: string) => void;
    width?: number;
    placeholder?: string;
}) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width }}
            placeholder={placeholder}
            className="border-0 border-b border-dotted border-gray-600 focus:border-[#32CD32] outline-none text-center text-sm mx-1"
        />
    );
}

export default function Passage1Section({ part, answers, onAnswerChange }: Props) {
    // Helper to fetch a question by number
    const q = (n: number) => part.questions.find((qq) => qq.number === n)!;

    return (
        <div className="max-w-3xl">
            {/* ───────── Questions 1–5: Which paragraph contains… ───────── */}
            <section className="mt-6">
                <h3 className="text-xl font-bold">Questions 1–5</h3>
                <p className="mt-1">Reading Passage 1 has nine paragraphs, <strong>A–I</strong>.</p>
                <p>
                    <em>Which paragraph contains the following information?</em>
                    <br />
                    <span>
            Write the correct letter, <strong>A–I</strong>, in boxes <strong>1–5</strong> on your
            answer sheet.
          </span>
                </p>

                {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} id={`question-${num - 1}`} className="mt-4">
                        <p className="font-semibold">
                            {num}. {q(num).question}
                        </p>
                        <RadioRow
                            name={`q-${num}`}
                            value={answers[num - 1] || ""}
                            options={lettersAI}
                            onChange={(v) => onAnswerChange(num - 1, v)}
                        />
                    </div>
                ))}
            </section>

            {/* ───────── Questions 6–10: Flow-chart completion ───────── */}
            <section className="mt-10">
                <h3 className="text-xl font-bold">Questions 6–10</h3>
                <p>Complete the flow-chart below.</p>
                <p>
                    <em>Choose NO MORE THAN TWO WORDS from the passage for each answer.</em>
                </p>
                <p>Write your answers in boxes <strong>6–10</strong> on your answer sheet.</p>

                <div className="mt-4 space-y-4">
                    {/* Box 1: 6 & 7 in the same box */}
                    <div className="border rounded-md p-4">
                        <p className="text-center">
                            <span className="font-semibold">Synthetic gene grown</span>
                            <br />
                            in{" "}
                            <Blank
                                value={answers[6 - 1] || ""}
                                onChange={(v) => onAnswerChange(6 - 1, v)}
                                placeholder="6"
                                width={140}
                            />{" "}
                            or{" "}
                            <Blank
                                value={answers[7 - 1] || ""}
                                onChange={(v) => onAnswerChange(7 - 1, v)}
                                placeholder="7"
                                width={140}
                            />
                        </p>
                    </div>

                    <div className="text-center text-2xl select-none">↓</div>

                    {/* Box 2: Q8 */}
                    <div id="question-7" className="border rounded-md p-4">
                        <p className="text-center">
                            globules of{" "}
                            <Blank
                                value={answers[8 - 1] || ""}
                                onChange={(v) => onAnswerChange(8 - 1, v)}
                                placeholder="8"
                                width={200}
                            />
                        </p>
                    </div>

                    <div className="text-center text-2xl select-none">↓</div>

                    {/* Box 3: Q9 */}
                    <div id="question-8" className="border rounded-md p-4">
                        <p className="text-center">
                            dissolved in{" "}
                            <Blank
                                value={answers[9 - 1] || ""}
                                onChange={(v) => onAnswerChange(9 - 1, v)}
                                placeholder="9"
                                width={220}
                            />
                        </p>
                    </div>

                    <div className="text-center text-2xl select-none">↓</div>

                    {/* Box 4: Q10 */}
                    <div id="question-9" className="border rounded-md p-4">
                        <p className="text-center">
                            passed through{" "}
                            <Blank
                                value={answers[10 - 1] || ""}
                                onChange={(v) => onAnswerChange(10 - 1, v)}
                                placeholder="10"
                                width={180}
                            />
                        </p>
                    </div>

                    <div className="text-center text-2xl select-none">↓</div>

                    {/* Final box (no answer) */}
                    <div className="border rounded-md p-4">
                        <p className="text-center">to produce a solid fibre</p>
                    </div>
                </div>
            </section>

            {/* ───────── Questions 11–13: TF/False/Not Given ───────── */}
            <section className="mt-10">
                <h3 className="text-xl font-bold">Questions 11–13</h3>
                <p>Do the following statements agree with the information given in Reading Passage 1?</p>
                <p className="mt-1">
                    In boxes <strong>11–13</strong> on your answer sheet, write
                </p>
                <p className="mt-1 font-semibold">TRUE &nbsp;&nbsp;&nbsp; if the statement agrees with the information</p>
                <p className="font-semibold">FALSE &nbsp;&nbsp; if the statement contradicts the information</p>
                <p className="font-semibold">NOT GIVEN &nbsp; if there is no information on this</p>

                {[11, 12, 13].map((num) => (
                    <div key={num} id={`question-${num - 1}`} className="mt-4">
                        <p className="font-semibold">
                            {num}. {q(num).question}
                        </p>
                        <TFNGGroup
                            name={`q-${num}`}
                            value={answers[num - 1] || ""}
                            onChange={(v) => onAnswerChange(num - 1, v)}
                        />
                    </div>
                ))}
            </section>
        </div>
    );
}
