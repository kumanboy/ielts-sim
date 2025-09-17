"use client";

import React from "react";

interface Props {
    answers: string[]; // slice for Q31–40 => indices 0..9
    onAnswerChangeAction: (idx: number, v: string) => void;
}

/** inline dotted blank with paginator anchor like the booklet */
const gap = (
    qNumber: number,
    value: string,
    set: (v: string) => void,
    width: string = "w-28"
) => (
    <>
        {/* anchor for scroll-to from paginator (0-based) */}
        <span id={`question-${qNumber - 1}`} className="invisible absolute -mt-24" />
        <input
            value={value}
            onChange={(e) => set(e.target.value)}
            placeholder={`${qNumber}`}
            className={`inline-block ${width} border-b border-dotted outline-none text-center mx-1`}
        />
    </>
);

export default function Part4Section({ answers, onAnswerChangeAction }: Props) {
    const set = (i: number, v: string) => onAnswerChangeAction(i, v);

    return (
        <article className="space-y-8 leading-7">
            {/* ===== Questions 31–33 ===== */}
            <div className="p-3 rounded border border-green-200 bg-green-50">
                <p className="text-[#32CD32] font-bold">Questions 31 – 33</p>
                <p className="text-sm text-gray-700">
                    Complete the sentences below.
                    <br />
                    Write <strong>NO MORE THAN THREE WORDS</strong> for each answer.
                </p>
            </div>

            <p className="font-bold text-center">Peregrine Falcons</p>

            <div className="space-y-3">
                <p>
                    <span className="font-semibold">31</span>&nbsp; The Peregrine falcons found in{" "}
                    {gap(31, answers[0], (v) => set(0, v))}
                    {" "}are not migratory birds.
                </p>

                <p>
                    <span className="font-semibold">32</span>&nbsp; There is disagreement about their maximum{" "}
                    {gap(32, answers[1], (v) => set(1, v), "w-36")}
                    .
                </p>

                <p>
                    <span className="font-semibold">33</span>&nbsp; When the female is guarding the nest, the male spends
                    most of his time {gap(33, answers[2], (v) => set(2, v), "w-40")}.
                </p>
            </div>

            {/* ===== Questions 34–37 (Table) ===== */}
            <div className="p-3 rounded border border-green-200 bg-green-50">
                <p className="text-[#32CD32] font-bold">Questions 34 – 37</p>
                <p className="text-sm text-gray-700">Complete the table below.</p>
                <p className="text-sm text-gray-700">
                    Write <strong>NO MORE THAN THREE WORDS</strong> for each answer.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="border border-gray-300 p-2 text-left w-40">Age of falcons</th>
                        <th className="border border-gray-300 p-2 text-left">What occurs</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="border border-gray-300 p-2">20 days old</td>
                        <td className="border border-gray-300 p-2">
                            The falcons <span className="font-semibold">34</span>{" "}
                            {gap(34, answers[3], (v) => set(3, v), "w-40")}
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2">28 days old</td>
                        <td className="border border-gray-300 p-2">
                            The falcons are <span className="font-semibold">35</span>{" "}
                            {gap(35, answers[4], (v) => set(4, v), "w-44")}
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2">2 months old</td>
                        <td className="border border-gray-300 p-2">
                            The falcons <span className="font-semibold">36</span>{" "}
                            {gap(36, answers[5], (v) => set(5, v), "w-44")} permanently
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2">1–12 months old</td>
                        <td className="border border-gray-300 p-2">
                            More than half of falcons <span className="font-semibold">37</span>{" "}
                            {gap(37, answers[6], (v) => set(6, v), "w-44")}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            {/* ===== Questions 38–40 (Notes) ===== */}
            <div className="p-3 rounded border border-green-200 bg-green-50">
                <p className="text-[#32CD32] font-bold">Questions 38 – 40</p>
                <p className="text-sm text-gray-700">Complete the notes.</p>
                <p className="text-sm text-gray-700">
                    Write <strong>NO MORE THAN THREE WORDS</strong> for each answer.
                </p>
            </div>

            <div className="grid grid-cols-[90px_1fr] gap-y-2">
                <div className="font-semibold">First:</div>
                <div>catch chicks</div>

                <div className="font-semibold">Second:</div>
                <div>
                    <span className="font-semibold">38</span>{" "}
                    {gap(38, answers[7], (v) => set(7, v), "w-32")} to legs
                </div>

                <div className="font-semibold">Third:</div>
                <div>
                    <span className="font-semibold">39</span>{" "}
                    {gap(39, answers[8], (v) => set(8, v), "w-40")} of chicks
                </div>

                <div className="font-semibold">Fourth:</div>
                <div>take blood sample to assess level of pesticide</div>

                <div className="font-semibold">Fifth:</div>
                <div>
                    check the <span className="font-semibold">40</span>{" "}
                    {gap(40, answers[9], (v) => set(9, v), "w-40")} of the birds
                </div>
            </div>
        </article>
    );
}
