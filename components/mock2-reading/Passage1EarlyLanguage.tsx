import React, { useMemo } from "react";
import {
    DndContext,
    DragEndEvent,
    useDraggable,
    useDroppable,
    pointerWithin,
} from "@dnd-kit/core";
import type { PassageData, Question } from "@/app/reading/mock-2/page";

interface Props {
    part: PassageData;                    // full passage object (title, questions etc.)
    answers: string[];                    // full 40‑item array held in page.tsx
    onAnswerChange(index: number, value: string): void; // idx is global (qNo‑1)
}

/* ─────────── Helpers ─────────── */
const norm = (s: string) => s.trim().toLowerCase();

function TFNGAnswer({
                        q,
                        value,
                        onChange,
                    }: {
    q: Question;
    value: string;
    onChange: (val: string) => void;
}) {
    const labels = ["TRUE", "FALSE", "NOT GIVEN"];
    return (
        <ul className="mt-1 space-y-1 pl-6 text-sm">
            {labels.map((lbl) => (
                <li key={lbl} className="flex items-start gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="radio"
                            name={`qtfng-${q.number}`}
                            value={lbl}
                            checked={norm(value) === norm(lbl)}
                            onChange={() => onChange(lbl)}
                        />
                        <span className="font-semibold">{lbl}</span>
                    </label>
                </li>
            ))}
        </ul>
    );
}

/* ─────────── Drag & Drop components ─────────── */
function DraggableEnding({ id, letter, text }: { id: string; letter: string; text: string }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-move p-2 rounded bg-white shadow border mb-1"
            style={{
                transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
                opacity: isDragging ? 0.5 : 1,
                zIndex: isDragging ? 9999 : 1,
            }}
        >
            <strong>{letter}</strong> {text}
        </div>
    );
}

function DroppableAnswer({ id, answer, fullText, onClear }: { id: string; answer: string; fullText?: string; onClear: () => void }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <span
            ref={setNodeRef}
            className={`inline-block min-w-[220px] min-h-[30px] border-b-2 border-dashed px-2 py-1 ${isOver ? "border-green-500" : ""}`}
        >
      {answer ? (
          <>
              <strong>{answer}</strong> {fullText}
              <button type="button" onClick={onClear} className="ml-2 text-red-500 text-sm hover:underline">
                  ×
              </button>
          </>
      ) : (
          <span className="text-gray-400">Drop answer here</span>
      )}
    </span>
    );
}

/* ─────────── Main component ─────────── */
export default function Passage1EarlyLanguage({ part, answers, onAnswerChange }: Props) {
    /* Offsets */
    const startIdx = part.questions[0]?.number ? part.questions[0].number - 1 : 0; // 0 for Q1

    const tfngQs = part.questions.filter((q) => q.number <= 7);
    const endingQs = part.questions.filter((q) => q.number >= 8 && q.number <= 13);

    /* shared A–J endings */
    const optionMap: Record<string, string> = useMemo(() => {
        const base = part.questions.find((q) => q.number === 8)?.options as Record<string, string>;
        return base ?? {};
    }, [part.questions]);

    const endingLetters = Object.keys(optionMap);

    /* chosen letters from answers array */
    const chosen = endingQs.map((q) => answers[q.number - 1] ?? "");
    const remaining = endingLetters.filter((l) => !chosen.includes(l));

    /* drag handler */
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over?.id || !active?.id) return;
        const letter = String(active.id).replace("ending-", "");
        const dropIdx = parseInt(String(over.id).replace("drop-", ""), 10);
        if (Number.isNaN(dropIdx)) return;

        // Remove previous placement of this letter
        const prevIdx = chosen.findIndex((l) => l === letter);
        if (prevIdx !== -1 && prevIdx !== dropIdx) {
            onAnswerChange(startIdx + 8 + prevIdx, ""); // 8th q is index 7 but +1 number difference; easier: q.number-1 mapping
        }
        onAnswerChange(endingQs[dropIdx].number - 1, letter);
    };

    return (
        <div>
            {/* ---------- Q1‑7 TRUE/FALSE/NOT‑GIVEN ---------- */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-green-600">Questions 1 – 7</h2>
                <p className="mt-2 text-sm text-gray-600 mb-4">Do the following statements agree with the views of the writer?</p>

                {tfngQs.map((q) => (
                    <div key={q.number} id={`question-${q.number - 1}`} className="mb-4">
                        <p className="font-medium">
                            {q.number}. {q.question}
                        </p>
                        <TFNGAnswer
                            q={q}
                            value={answers[q.number - 1]}
                            onChange={(val) => onAnswerChange(q.number - 1, val)}
                        />
                    </div>
                ))}
            </div>

            {/* anchors for paginator accuracy */}
            <div id="question-7" className="h-0" />

            {/* ---------- Q8‑13 Sentence endings (DnD) ---------- */}
            <DndContext onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
                <h2 className="text-xl font-semibold text-green-600 mt-10">Questions 8 – 13</h2>
                <p className="mt-2 text-sm text-gray-600 mb-4">
                    Complete each sentence with the correct ending, A – J, below.
                </p>

                {/* draggable pool */}
                <div className="border p-4 w-full max-w-md rounded mb-6 bg-gray-50 shadow">
                    {remaining.map((l) => (
                        <DraggableEnding key={l} id={`ending-${l}`} letter={l} text={optionMap[l]} />
                    ))}
                </div>

                <div className="space-y-5">
                    {endingQs.map((q, i) => (
                        <div key={q.number} id={`question-${q.number - 1}`} className="flex gap-3 items-start">
                            <div className="w-6 font-bold">{q.number}.</div>
                            <div className="flex-1">
                                <p>{q.question}</p>
                                <DroppableAnswer
                                    id={`drop-${i}`}
                                    answer={chosen[i]}
                                    fullText={optionMap[chosen[i]]}
                                    onClear={() => onAnswerChange(q.number - 1, "")}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </DndContext>
        </div>
    );
}
