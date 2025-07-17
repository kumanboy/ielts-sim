"use client";

import {
    DndContext,
    DragEndEvent,
    useDraggable,
    useDroppable,
    closestCenter,
} from "@dnd-kit/core";
import Image from "next/image";
import { CSSProperties, ReactNode } from "react";

type Props = {
    answers: string[]; // answers[0–9] → Q11–20
    onAnswerChange: (localIdx: number, val: string) => void;
};

const people = [
    "Mary Brown",
    "John Stevens",
    "Alison Jones",
    "Tim Smith",
    "Jenny James",
];

type Opt = { v: string; txt: string };

const responsibilityOpts: Opt[] = [
    { v: "A", txt: "Finance" },
    { v: "B", txt: "Food" },
    { v: "C", txt: "Health" },
    { v: "D", txt: "Kid's Counseling" },
    { v: "E", txt: "Organisation" },
    { v: "F", txt: "Rooms" },
    { v: "G", txt: "Sport" },
    { v: "H", txt: "Trips" },
];

const mapLabelOpts: Opt[] = [
    { v: "A", txt: "Cookery room" },
    { v: "B", txt: "Games room" },
    { v: "C", txt: "Kitchen" },
    { v: "D", txt: "Pottery room" },
    { v: "E", txt: "Sports Complex" },
    { v: "F", txt: "Staff accommodation" },
];

const getRespLabel = (v: string) =>
    responsibilityOpts.find((o) => o.v === v)?.txt ?? "";
const getMapLabel = (v: string) =>
    mapLabelOpts.find((o) => o.v === v)?.txt ?? "";

function DraggableChip({ id, label }: { id: string; label: ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id });

    const style: CSSProperties = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <button
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            className="chip cursor-move"
            type="button"
        >
            {label}
        </button>
    );
}

function DroppableSlot({
                           id,
                           number,
                           label,
                           value,
                           display,
                           onClear,
                       }: {
    id: string;
    number: number;
    label: string;
    value: string;
    display: string;
    onClear: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className="mb-4 relative">
            <p className="font-medium mb-1">
                {number}. {label}
            </p>
            <div
                ref={setNodeRef}
                className={`droppable-blank inline-block w-24 border-b border-dotted text-center px-2 py-1 ${
                    isOver ? "border-green-500" : "border-red-900"
                }`}
                data-slot-id={id}
                data-number={number}
            >
                {value ? (
                    <>
                        <span className="font-bold">{value}</span>&nbsp;
                        <span className="truncate">{display}</span>
                        <button
                            type="button"
                            onClick={onClear}
                            className="ml-1 text-red-500 text-xs hover:underline"
                        >
                            ×
                        </button>
                    </>
                ) : (
                    <span className="text-gray-400">&nbsp;</span>
                )}
            </div>
        </div>
    );
}

export default function Part2MatchMap({ answers, onAnswerChange }: Props) {
    const chosenResp = answers.slice(0, 5);
    const chosenMap = answers.slice(5, 10);

    const availableResp = responsibilityOpts.filter(
        (o) => !chosenResp.includes(o.v)
    );
    const availableMap = mapLabelOpts.filter((o) => !chosenMap.includes(o.v));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active?.id || !over?.id) return;

        const draggedId = String(active.id); // e.g. resp-A or map-D
        const zone = String(over.id);

        if (draggedId.startsWith("resp-") && zone.startsWith("drop-")) {
            const letter = draggedId.replace("resp-", "");
            const idx = parseInt(zone.replace("drop-", ""), 10);
            if (!Number.isNaN(idx)) onAnswerChange(idx, letter);
        }

        if (draggedId.startsWith("map-") && zone.startsWith("map-")) {
            const letter = draggedId.replace("map-", "");
            const idx = parseInt(zone.replace("map-", ""), 10);
            if (!Number.isNaN(idx)) onAnswerChange(5 + idx, letter);
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            {/* Responsibilities */}
            <h3 className="mt-4 font-medium">Questions 11–15</h3>
            <p className="text-sm mb-2">
                Drag the correct letter A–H to each person.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    {people.map((person, i) => {
                        const v = chosenResp[i] ?? "";
                        return (
                            <DroppableSlot
                                key={i}
                                id={`drop-${i}`}
                                number={11 + i}
                                label={person}
                                value={v}
                                display={getRespLabel(v)}
                                onClear={() => onAnswerChange(i, "")}
                            />
                        );
                    })}
                </div>
                <div>
                    <div className="flex flex-wrap gap-2">
                        {availableResp.map((o) => (
                            <DraggableChip
                                key={o.v}
                                id={`resp-${o.v}`}
                                label={
                                    <>
                                        <span className="font-bold">{o.v}</span>&nbsp;{o.txt}
                                    </>
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            <hr className="my-8" />

            {/* Map Labels */}
            <h3 className="mt-4 font-medium">Questions 16–20</h3>
            <p className="text-sm mb-2">
                Drag the correct letter A–F into each map box.
            </p>
            <Image
                src="/map.png"
                alt="Map"
                width={420}
                height={520}
                priority
                className="mt-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    {[16, 17, 18, 19, 20].map((num, i) => {
                        const v = chosenMap[i] ?? "";
                        return (
                            <DroppableSlot
                                key={i}
                                id={`map-${i}`}
                                number={num}
                                label=""
                                value={v}
                                display={getMapLabel(v)}
                                onClear={() => onAnswerChange(5 + i, "")}
                            />
                        );
                    })}
                </div>
                <div>
                    <div className="flex flex-wrap gap-2">
                        {availableMap.map((o) => (
                            <DraggableChip
                                key={o.v}
                                id={`map-${o.v}`}
                                label={
                                    <>
                                        <span className="font-bold">{o.v}</span>&nbsp;{o.txt}
                                    </>
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .chip {
                    padding: 2px 10px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    background: #fff;
                    font-size: 13px;
                    line-height: 1.25;
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    white-space: nowrap;
                }
                .chip:hover {
                    background: #f3f4f6;
                }
                .droppable-blank::before {
                    content: attr(data-number);
                    position: absolute;
                    top: -10px;
                    left: -4px;
                    font-size: 11px;
                    color: rgba(0, 0, 0, 0.15);
                    pointer-events: none;
                    z-index: 0;
                }
            `}</style>
        </DndContext>
    );
}
