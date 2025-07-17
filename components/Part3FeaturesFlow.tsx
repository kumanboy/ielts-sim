"use client";

import React from "react";
import {
    DndContext,
    DragEndEvent,
    useDroppable,
    useDraggable,
    pointerWithin,
} from "@dnd-kit/core";
import { CSSProperties, ReactNode } from "react";

// Types

type Props = {
    answers: string[];
    onAnswerChange: (localIdx: number, val: string) => void;
};

// Constants

const letters21_25 = [
    { v: "A", txt: "They are very rare type of plant fossils" },
    { v: "B", txt: "They do not contain any organic matter" },
    { v: "C", txt: "They are found in soft, wet ground" },
    { v: "D", txt: "They can be found far from normal fossil areas" },
    { v: "E", txt: "They are three-dimensional" },
    { v: "F", txt: "They provide information about plant cells" },
];

const letters26_30 = [
    { v: "A", txt: "contamination" },
    { v: "B", txt: "vehicle" },
    { v: "C", txt: "heat" },
    { v: "D", txt: "results" },
    { v: "E", txt: "radiation" },
    { v: "F", txt: "site" },
    { v: "G", txt: "microbes" },
    { v: "H", txt: "water" },
];

const map21_25 = Object.fromEntries(letters21_25.map((o) => [o.v, o.txt]));
const map26_30 = Object.fromEntries(letters26_30.map((o) => [o.v, o.txt]));

function DraggableChip({ id, label }: { id: string; label: ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id });

    const style: CSSProperties = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 9999 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            className="chip cursor-move"
        >
            {label}
        </div>
    );
}

function DroppableBlank({
                            id,
                            answer,
                            labelMap,
                            onClear,
                        }: {
    id: string;
    answer: string;
    labelMap: Record<string, string>;
    onClear: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    const blankIdx = parseInt(id.replace("blank-", ""), 10);
    const questionNumber = blankIdx + 21;

    return (
        <span
            ref={setNodeRef}
            className={`inline-block min-w-[170px] min-h-[28px] border-b border-dotted outline-none text-left px-2 py-1 ${isOver ? "border-green-500" : ""}`}
        >
            {answer ? (
                <>
                    <span className="font-bold">{answer}</span>&nbsp;
                    <span>{labelMap[answer]}</span>
                    <button
                        onClick={onClear}
                        className="ml-1 text-red-500 text-sm hover:underline"
                        type="button"
                    >
                        ×
                    </button>
                </>
            ) : (
                <span className="text-gray-400 font-semibold">{questionNumber}</span>
            )}
        </span>
    );
}

export default function Part3FeaturesFlow({ answers, onAnswerChange }: Props) {
    const chosen21_25 = answers.slice(0, 5);
    const chosen26_30 = answers.slice(5, 10);

    const remaining21_25 = letters21_25.filter((o) => !chosen21_25.includes(o.v));
    const remaining26_30 = letters26_30.filter((o) => !chosen26_30.includes(o.v));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active?.id || !over?.id) return;

        const dragged = String(active.id);
        const letter = dragged.slice(2);
        const targetId = String(over.id);

        const idx = parseInt(targetId.replace("blank-", ""), 10);
        if (!Number.isNaN(idx)) {
            onAnswerChange(idx, letter);
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
            <p className="mt-8 font-medium">
                <strong>Questions 21–25</strong> – Which feature do the speakers identify for each of the following categories of fossil?
            </p>

            <ul className="border mt-3 p-4 space-y-1 w-max text-sm leading-5">
                {remaining21_25.map((l) => (
                    <DraggableChip
                        key={l.v}
                        id={`21${l.v}`}
                        label={
                            <li className="flex items-start gap-3">
                                <span className="font-bold">{l.v}</span>
                                <span>{l.txt}</span>
                            </li>
                        }
                    />
                ))}
            </ul>

            <div className="mt-4 space-y-2 text-sm">
                {["Impression fossils", "Cast fossils", "Permineralisation fossils", "Compaction fossils", "Fusain fossils"].map((name, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="w-6 pt-1 font-bold">{21 + i}</div>
                        <div className="w-56">{name}</div>
                        <DroppableBlank
                            id={`blank-${i}`}
                            answer={chosen21_25[i] ?? ""}
                            labelMap={map21_25}
                            onClear={() => onAnswerChange(i, "")}
                        />
                    </div>
                ))}
            </div>

            <p className="mt-10 font-medium">
                <strong>Questions 26–30</strong> – Complete the flow-chart. Choose the correct letter A–H.
            </p>

            <div className="border mt-3 p-4 grid grid-cols-2 gap-x-10 gap-y-1 w-max text-sm">
                {remaining26_30.map((l) => (
                    <DraggableChip
                        key={l.v}
                        id={`26${l.v}`}
                        label={
                            <div className="flex items-start gap-3">
                                <span className="font-bold">{l.v}</span>
                                <span>{l.txt}</span>
                            </div>
                        }
                    />
                ))}
            </div>

            <div className="mt-6 space-y-5 text-sm">
                {[26, 27, 28, 29, 30].map((q, i) => (
                    <div key={q} className="flex gap-3 items-start">
                        <div className="w-4 pt-1 font-bold">{q}.</div>
                        <div className="flex-1 border p-2 rounded shadow-sm">
                            {(() => {
                                switch (q) {
                                    case 26:
                                        return (
                                            <>A spacecraft lands on a planet and sends out a rover. The rover is directed to a <DroppableBlank id="blank-5" answer={chosen26_30[0] ?? ""} labelMap={map26_30} onClear={() => onAnswerChange(5, "")} /> which has organic material.</>
                                        );
                                    case 27:
                                        return (
                                            <>It collects a sample from below the surface (in order to avoid the effects of <DroppableBlank id="blank-6" answer={chosen26_30[1] ?? ""} labelMap={map26_30} onClear={() => onAnswerChange(6, "")} />). The soil and rocks are checked to look for evidence of fossils. The sample is converted to powder.</>
                                        );
                                    case 28:
                                        return (
                                            <>The sample is subjected to <DroppableBlank id="blank-7" answer={chosen26_30[2] ?? ""} labelMap={map26_30} onClear={() => onAnswerChange(7, "")} />.</>
                                        );
                                    case 29:
                                        return (
                                            <>A mass spectrometer is used to search for potential proof of life, e.g. <DroppableBlank id="blank-8" answer={chosen26_30[3] ?? ""} labelMap={map26_30} onClear={() => onAnswerChange(8, "")} />.</>
                                        );
                                    case 30:
                                        return (
                                            <>The <DroppableBlank id="blank-9" answer={chosen26_30[4] ?? ""} labelMap={map26_30} onClear={() => onAnswerChange(9, "")} /> are compared with existing data from Earth.</>
                                        );
                                }
                            })()}
                        </div>
                    </div>
                ))}
            </div>
        </DndContext>
    );
}
