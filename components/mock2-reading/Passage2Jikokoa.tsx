"use client";

import React from "react";
import Image from "next/image";
import {
    DndContext,
    DragEndEvent,
    useDraggable,
    useDroppable,
    closestCenter,
    UniqueIdentifier,
} from "@dnd-kit/core";
import type { PassageData } from "@/app/reading/mock-2/page";

interface Props {
    part: PassageData;
    answers: string[];
    onAnswerChange(index: number, value: string): void;
}

/* helpers */
const qi = (q: number) => q - 1;

/* ────── Drag-&-drop chips for Q14-20 ────── */
const HEADINGS = [
    { v: "i",   txt: "Desirable job opportunities" },
    { v: "ii",  txt: "Design of the jikokoa" },
    { v: "iii", txt: "The impact of rising charcoal prices" },
    { v: "iv",  txt: "Benefits for the individual and the environment" },
    { v: "v",   txt: "The background to stove innovations" },
    { v: "vi",  txt: "Manufacture of the jikokoa" },
    { v: "vii", txt: "Training courses for BURN staff" },
    { v: "viii",txt: "Company plans" },
    { v: "ix",  txt: "Affordability and availability" },
];

/* chip element */
function Chip({ id, label }: { id: UniqueIdentifier; label: React.ReactNode }) {
    const { setNodeRef, attributes, listeners, transform, isDragging } =
        useDraggable({ id });

    return (
        <button
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            type="button"
            style={{
                transform: transform
                    ? `translate3d(${transform.x}px,${transform.y}px,0)`
                    : undefined,
                opacity: isDragging ? 0.5 : 1,
            }}
            className="chip cursor-move"
        >
            {label}
        </button>
    );
}

/* droppable blank */
function DropSlot({
                      id,
                      heading,
                      onClear,
                  }: {
    id: UniqueIdentifier;
    heading: string;
    onClear(): void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`inline-block min-w-[180px] min-h-[32px] border-b-2 border-dashed px-2 py-1 ${
                isOver ? "border-green-500" : "border-gray-300"
            }`}
        >
            {heading ? (
                <>
                    <strong>{heading}</strong>{" "}
                    {HEADINGS.find((h) => h.v === heading)?.txt ?? ""}
                    <button
                        type="button"
                        onClick={onClear}
                        className="ml-1 text-red-500 text-sm"
                    >
                        ×
                    </button>
                </>
            ) : (
                <span className="text-gray-400">drop heading here</span>
            )}
        </div>
    );
}

/* ================== NEW: Option text for Q21-24 ================== */
const Q21_22_OPTS = [
    { letter: "A", text: "It’s smaller in overall size." },
    { letter: "B", text: "It’s easier to control." },
    { letter: "C", text: "It uses more fuel." },
    { letter: "D", text: "It’s less expensive to buy." },
    { letter: "E", text: "It gives off fewer fumes." },
];

const Q23_24_OPTS = [
    { letter: "A", text: "It is made in China." },
    { letter: "B", text: "It can be produced very efficiently." },
    { letter: "C", text: "It can be bought on credit." },
    { letter: "D", text: "It comes in a range of colours." },
    { letter: "E", text: "It is difficult to move." },
];

/* ============== COMPONENT ============== */
export default function Passage2Jikokoa({
                                            part,
                                            answers,
                                            onAnswerChange,
                                        }: Props) {
    /* Silence “unused variable” for title */
    void part.title;

    /* ------------- Q14-20 ----------------- */
    const headingNums = [14, 15, 16, 17, 18, 19, 20];
    const chosenHeadings = headingNums.map((n) => answers[qi(n)]);
    const remaining = HEADINGS.filter((h) => !chosenHeadings.includes(h.v));

    const onDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        if (!active?.id || !over?.id) return;

        const act = String(active.id); // "heading-i" …
        const ov = String(over.id); // "slot-0" …

        if (!act.startsWith("heading-") || !ov.startsWith("slot-")) return;

        const letter = act.replace("heading-", "");
        const slot = Number(ov.replace("slot-", "")); // 0-6

        const qNum = 14 + slot;
        const alreadyThere = answers[qi(qNum)];
        if (alreadyThere === letter) return;

        onAnswerChange(qi(qNum), letter);
    };

    /* ------------- Q21-26 (logic stays) ------------- */
    const pair1 = [answers[qi(21)], answers[qi(22)]];
    const pair2 = [answers[qi(23)], answers[qi(24)]];
    const setPair = (base: number, idx: number, val: string) => {
        const other = idx === 0 ? answers[qi(base + 1)] : answers[qi(base)];
        if (val === other) val = "";
        onAnswerChange(qi(base + idx), val);
    };

    return (
        <div className="space-y-10 mt-4 text-[15px] leading-relaxed">
            {/* ===== Q14-20 chips ===== */}
            <section>
                <h3 className="text-lg font-semibold mb-2">Questions 14 – 20</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Reading Passage 2 has seven sections A-G. Drag the correct
                    heading <i>i</i>-<i>ix</i> to each section.
                </p>

                {/* heading pool & slots */}
                <DndContext onDragEnd={onDragEnd} collisionDetection={closestCenter}>
                    {/* chip pool */}
                    <div className="border mb-6 p-3 flex flex-wrap gap-2 bg-gray-50">
                        {remaining.map((h) => (
                            <Chip
                                key={h.v}
                                id={`heading-${h.v}`}
                                label={
                                    <>
                                        <strong>{h.v}</strong>&nbsp;{h.txt}
                                    </>
                                }
                            />
                        ))}
                    </div>

                    {/* slots A-G */}
                    {headingNums.map((n, idx) => (
                        <div key={n} id={`question-${n - 1}`} className="mb-4">
                            <p className="font-medium mb-1">
                                {n}. Section {String.fromCharCode(65 + idx)}
                            </p>
                            <DropSlot
                                id={`slot-${idx}`}
                                heading={answers[qi(n)]}
                                onClear={() => onAnswerChange(qi(n), "")}
                            />
                        </div>
                    ))}
                </DndContext>
            </section>

            {/* anchor */}
            <div id="question-20" className="h-0" />

            {/* ===== Q21-24 choose TWO ===== */}
            <section>
                <h3 className="text-lg font-semibold mb-2">Questions 21 – 24</h3>
                <p className="mb-4">
                    Choose <strong>TWO</strong> letters, A–E.
                </p>

                {/* pair 1 */}
                <div className="mb-6" id="question-20">
                    <p className="font-medium mb-2">
                        21-22. Which TWO claims are made about the jikokoa compared to
                        the KCJ?
                    </p>
                    {Q21_22_OPTS.map(({ letter, text }) => {
                        const checked = pair1.includes(letter);
                        return (
                            <label
                                key={letter}
                                className="flex items-center gap-2 cursor-pointer select-none pl-6 text-sm py-1"
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                        const idx = checked
                                            ? pair1.indexOf(letter)
                                            : pair1.findIndex((v) => !v);
                                        if (idx !== -1) setPair(21, idx, checked ? "" : letter);
                                    }}
                                />
                                <span>
                                    <span className="font-semibold mr-2">{letter}</span>
                                    {text}
                                </span>
                            </label>
                        );
                    })}
                </div>

                {/* pair 2 */}
                <div id="question-22">
                    <p className="font-medium mb-2">
                        23-24. Which TWO statements about the jikokoa are true?
                    </p>
                    {Q23_24_OPTS.map(({ letter, text }) => {
                        const checked = pair2.includes(letter);
                        return (
                            <label
                                key={letter}
                                className="flex items-center gap-2 cursor-pointer select-none pl-6 text-sm py-1"
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                        const idx = checked
                                            ? pair2.indexOf(letter)
                                            : pair2.findIndex((v) => !v);
                                        if (idx !== -1) setPair(23, idx, checked ? "" : letter);
                                    }}
                                />
                                <span>
                                    <span className="font-semibold mr-2">{letter}</span>
                                    {text}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </section>

            {/* anchors */}
            <div id="question-24" className="h-0" />

            {/* ===== Q25-26 diagram ===== */}
            <section>
                <h3 className="text-lg font-semibold mb-2">Questions 25 – 26</h3>
                <p className="mb-4">
                    Label the diagram below. Write <strong>NO MORE THAN TWO WORDS</strong>.
                </p>

                <Image
                    src="/jikokoa.png"
                    alt="jikokoa diagram"
                    width={600}
                    height={450}
                    className="max-w-md w-full mb-6 border"
                />

                <div className="space-y-3 max-w-md">
                    {[25, 26].map((n) => (
                        <div
                            key={n}
                            id={`question-${n - 1}`}
                            className="flex items-center gap-3"
                        >
                            <span className="w-10 font-bold">{n}.</span>
                            <input
                                type="text"
                                value={answers[qi(n)]}
                                onChange={(e) => onAnswerChange(qi(n), e.target.value)}
                                placeholder={`${n}`}
                                className="border-b border-gray-600 flex-1 p-1 focus:outline-none focus:border-green-600"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* minimal chip styling */}
            <style jsx>{`
                .chip {
                    padding: 2px 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    background: #fff;
                    font-size: 13px;
                    line-height: 1.25;
                    display: inline-flex;
                    gap: 2px;
                    white-space: nowrap;
                }
                .chip:hover {
                    background: #f3f4f6;
                }
            `}</style>
        </div>
    );
}
