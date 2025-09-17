// components/mock3-reading/Passage2Section.tsx
import React, { useState } from "react";

type Props = {
    answers: string[];
    onAnswerChange: (idx: number, val: string) => void;
};

const qi = (n: number) => n - 1;

/* small UI helpers */
const SubHeader = ({ title, note }: { title: string; note: React.ReactNode }) => (
    <div className="mt-10">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-gray-700">{note}</p>
    </div>
);

const Radio = ({
                   name, value, current, label, onChange,
               }: {
    name: string; value: string; current: string; label: string;
    onChange: (v: string) => void;
}) => (
    <label className="flex items-start gap-2 cursor-pointer select-none">
        <input
            type="radio"
            name={name}
            value={value}
            checked={current.trim().toLowerCase() === value.trim().toLowerCase()}
            onChange={() => onChange(value)}
            className="mt-1"
        />
        <span className="font-semibold">{label}</span>
    </label>
);

const Blank = ({
                   value, onChange, w = 160, placeholder,
               }: {
    value: string; onChange: (v: string) => void; w?: number; placeholder?: string;
}) => (
    <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: w }}
        placeholder={placeholder}
        className="inline-block border-0 border-b border-dotted border-gray-600 focus:border-[#32CD32] outline-none text-center"
    />
);

export default function Passage2Section({ answers, onAnswerChange }: Props) {
    /* ─── Matching A–D (Q19–21) ─── */
    const targetIdxs = [qi(19), qi(20), qi(21)];
    const allLetters = [
        { letter: "A", name: "Mercator" },
        { letter: "B", name: "Ptolemy" },
        { letter: "C", name: "Cassini family" },
        { letter: "D", name: "Eratosthenes" },
    ];
    const used = new Set(targetIdxs.map((i) => answers[i]?.toUpperCase()).filter(Boolean));
    const [selected, setSelected] = useState<string | null>(null);

    const placeLetter = (idx: number, letter: string) => {
        // keep uniqueness across 19–21
        targetIdxs.forEach((i) => {
            if (answers[i]?.toUpperCase() === letter) onAnswerChange(i, "");
        });
        onAnswerChange(idx, letter);
    };

    const onDrop = (qnum: number, e: React.DragEvent<HTMLSpanElement>) => {
        e.preventDefault();
        const letter = e.dataTransfer.getData("text/map-letter");
        if (!["A", "B", "C", "D"].includes(letter)) return;
        placeLetter(qi(qnum), letter);
    };

    const DropInline = ({ qnum, text }: { qnum: number; text: string }) => {
        const idx = qi(qnum);
        const val = (answers[idx] || "").toUpperCase();
        return (
            <p id={`question-${idx}`} className="font-semibold leading-7">
                <span className="mr-2">{qnum}</span>
                {/* compact inline drop box */}
                <span
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(qnum, e)}
                    onClick={() => {
                        if (selected) {
                            placeLetter(idx, selected);
                            setSelected(null);
                        }
                    }}
                    className={`inline-flex align-middle justify-center items-center
            w-16 h-9 rounded-md border border-dashed text-base font-bold mr-2 select-none
            ${val ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-gray-300 text-gray-400"}`}
                    title="Drag A–D here (or tap a letter above, then tap this box)"
                >
          {val || "—"}
        </span>
                {text}
                {val && (
                    <button
                        onClick={() => onAnswerChange(idx, "")}
                        className="ml-3 text-xs text-red-600"
                        aria-label="Clear"
                        title="Clear this box"
                    >
                        Clear
                    </button>
                )}
            </p>
        );
    };

    return (
        <section className="space-y-8 mt-6">
            <header className="space-y-1">
                <h2 className="text-3xl font-bold text-[#32CD32]">Part 2 – Questions 14–26</h2>
            </header>

            {/* ───────── Q14–18 MCQs ───────── */}
            <SubHeader
                title="Questions 14–18"
                note={<>Choose the correct letter, <strong>A, B, C</strong> or <strong>D</strong>.</>}
            />
            <section className="space-y-6">
                {/* 14 */}
                <div id={`question-${qi(14)}`} className="space-y-2">
                    <p className="font-semibold">
                        14 According to the first paragraph, mapmakers in the 21<sup>st</sup> century
                    </p>
                    <ul className="pl-6 space-y-1 text-sm">
                        <li><Radio name="q14" value="A" current={answers[qi(14)]} onChange={(v) => onAnswerChange(qi(14), v)} label="A. combine techniques to chart unknown territory."/></li>
                        <li><Radio name="q14" value="B" current={answers[qi(14)]} onChange={(v) => onAnswerChange(qi(14), v)} label="B. still rely on being able to see what they map."/></li>
                        <li><Radio name="q14" value="C" current={answers[qi(14)]} onChange={(v) => onAnswerChange(qi(14), v)} label="C. are now able to visit the darkest jungle."/></li>
                        <li><Radio name="q14" value="D" current={answers[qi(14)]} onChange={(v) => onAnswerChange(qi(14), v)} label="D. need input from experts in other fields."/></li>
                    </ul>
                </div>

                {/* 15 */}
                <div id={`question-${qi(15)}`} className="space-y-2">
                    <p className="font-semibold">15 The Library of Congress offers an opportunity to</p>
                    <ul className="pl-6 space-y-1 text-sm">
                        <li><Radio name="q15" value="A" current={answers[qi(15)]} onChange={(v) => onAnswerChange(qi(15), v)} label="A. borrow from their collection of Dutch maps."/></li>
                        <li><Radio name="q15" value="B" current={answers[qi(15)]} onChange={(v) => onAnswerChange(qi(15), v)} label="B. learn how to restore ancient and fragile maps."/></li>
                        <li><Radio name="q15" value="C" current={answers[qi(15)]} onChange={(v) => onAnswerChange(qi(15), v)} label="C. enjoy the atmosphere of the reading room."/></li>
                        <li><Radio name="q15" value="D" current={answers[qi(15)]} onChange={(v) => onAnswerChange(qi(15), v)} label="D. create individual computer maps to order."/></li>
                    </ul>
                </div>

                {/* 16 */}
                <div id={`question-${qi(16)}`} className="space-y-2">
                    <p className="font-semibold">16 Ptolemy alerted his contemporaries to the importance of</p>
                    <ul className="pl-6 space-y-1 text-sm">
                        <li><Radio name="q16" value="A" current={answers[qi(16)]} onChange={(v) => onAnswerChange(qi(16), v)} label="A. measuring the circumference of the world."/></li>
                        <li><Radio name="q16" value="B" current={answers[qi(16)]} onChange={(v) => onAnswerChange(qi(16), v)} label="B. organising maps to reflect accurate ratios of distance."/></li>
                        <li><Radio name="q16" value="C" current={answers[qi(16)]} onChange={(v) => onAnswerChange(qi(16), v)} label="C. working out the distance between parallels of latitude."/></li>
                        <li><Radio name="q16" value="D" current={answers[qi(16)]} onChange={(v) => onAnswerChange(qi(16), v)} label="D. accuracy and precision in mapping."/></li>
                    </ul>
                </div>

                {/* 17 */}
                <div id={`question-${qi(17)}`} className="space-y-2">
                    <p className="font-semibold">17 The invention of the printing press</p>
                    <ul className="pl-6 space-y-1 text-sm">
                        <li><Radio name="q17" value="A" current={answers[qi(17)]} onChange={(v) => onAnswerChange(qi(17), v)} label="A. revitalised interest in scientific knowledge."/></li>
                        <li><Radio name="q17" value="B" current={answers[qi(17)]} onChange={(v) => onAnswerChange(qi(17), v)} label="B. enabled maps to be produced more cheaply."/></li>
                        <li><Radio name="q17" value="C" current={answers[qi(17)]} onChange={(v) => onAnswerChange(qi(17), v)} label="C. changed the approach to mapmaking."/></li>
                        <li><Radio name="q17" value="D" current={answers[qi(17)]} onChange={(v) => onAnswerChange(qi(17), v)} label="D. ensured that the work of Ptolemy was continued."/></li>
                    </ul>
                </div>

                {/* 18 */}
                <div id={`question-${qi(18)}`} className="space-y-2">
                    <p className="font-semibold">18 The writer concludes by stating that</p>
                    <ul className="pl-6 space-y-1 text-sm">
                        <li><Radio name="q18" value="A" current={answers[qi(18)]} onChange={(v) => onAnswerChange(qi(18), v)} label="A. mapmaking has become too specialised."/></li>
                        <li><Radio name="q18" value="B" current={answers[qi(18)]} onChange={(v) => onAnswerChange(qi(18), v)} label="B. cartographers work in very harsh conditions."/></li>
                        <li><Radio name="q18" value="C" current={answers[qi(18)]} onChange={(v) => onAnswerChange(qi(18), v)} label="C. the fundamental aims of mapmaking remain unchanged."/></li>
                        <li><Radio name="q18" value="D" current={answers[qi(18)]} onChange={(v) => onAnswerChange(qi(18), v)} label="D. the possibilities of satellite mapping are infinite."/></li>
                    </ul>
                </div>
            </section>

            {/* ───────── Q19–21 Matching (bank on top, inline drop boxes) ───────── */}
            <SubHeader
                title="Questions 19–21"
                note={
                    <>
                        Match each achievement with the correct mapmaker, <strong>A–D</strong>.
                        <br />
                        Drag a card into a box, or tap a letter then tap a box. Each letter can be used once.
                    </>
                }
            />

            {/* Bank */}
            <div className="border rounded-xl p-3 bg-gray-50">
                <p className="font-semibold text-center mb-2">List of Mapmakers</p>
                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {allLetters.map(({ letter, name }) => {
                        const isUsed = used.has(letter);
                        const isSel = selected === letter;
                        return (
                            <li
                                key={letter}
                                draggable={!isUsed}
                                onDragStart={(e) => e.dataTransfer.setData("text/map-letter", letter)}
                                onClick={() => !isUsed && setSelected(isSel ? null : letter)}
                                className={`h-12 rounded-md border px-3 py-2 flex items-center justify-between select-none
                ${isUsed ? "bg-white text-gray-400 border-gray-200 cursor-not-allowed"
                                    : isSel ? "bg-green-100 border-green-500 cursor-pointer"
                                        : "bg-white hover:bg-green-50 border-gray-300 cursor-pointer"}`}
                                title={isUsed ? "Already used" : "Drag or tap to select"}
                            >
                <span className="font-semibold">
                  <strong>{letter}</strong> {name}
                </span>
                                {!isUsed && <span className="text-xs text-gray-500">{isSel ? "selected" : "drag"}</span>}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Inline rows */}
            <div className="space-y-2">
                <DropInline qnum={19} text="came very close to accurately measuring the distance round the Earth" />
                <DropInline qnum={20} text="produced maps showing man-made landmarks" />
                <DropInline qnum={21} text="laid the foundation for our modern time zones" />
            </div>

            {/* ───────── Q22–26 Summary ───────── */}
            <SubHeader
                title="Questions 22–26"
                note={
                    <>
                        Complete the summary below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the
                        passage for each answer.
                    </>
                }
            />
            <div className="text-[15px] leading-7">
                <p id={`question-${qi(22)}`}>
                    Ancient maps allow us to see how we have come to make sense of the world. They also
                    reflect the attitudes and knowledge of the day. The first great step in mapmaking took
                    place in <Blank value={answers[qi(22)]} onChange={(v) => onAnswerChange(qi(22), v)} placeholder="22" w={140} /> in the 3
                    <sup>rd</sup> century BC. Work continued in this tradition until the 2
                    <sup>nd</sup> century AD but was then abandoned for over a thousand years, during which
                    time maps were the responsibility of <Blank value={answers[qi(23)]} onChange={(v) => onAnswerChange(qi(23), v)} placeholder="23" w={160} /> rather than scientists. Fortunately, however, the writings
                    of <Blank value={answers[qi(24)]} onChange={(v) => onAnswerChange(qi(24), v)} placeholder="24" w={150} /> had been kept, and interest in scientific mapmaking was revived as
                    scholars sought to produce maps, inspired by the accounts of travellers.
                </p>
                <p className="mt-3" id={`question-${qi(25)}`}>
                    These days, <Blank value={answers[qi(25)]} onChange={(v) => onAnswerChange(qi(25), v)} placeholder="25" w={180} /> are vital to the creation of maps and radar has allowed
                    cartographers to map areas beyond our immediate world. In addition, this high-tech
                    equipment is not only used to map faraway places, but cheaper versions have also been
                    developed for use in <Blank value={answers[qi(26)]} onChange={(v) => onAnswerChange(qi(26), v)} placeholder="26" w={150} />.
                </p>
            </div>
        </section>
    );
}
