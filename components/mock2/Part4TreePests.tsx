// components/mock2/Part4TreePests.tsx
"use client";

import React, { ChangeEvent } from "react";

interface Props {
    /** answers[30‑39] slice → Q31‑40 */
    answers: string[];                // length = 10 (Q31‑40)
    onAnswerChangeAction: (idx: number, value: string) => void;
}

/* helper for inline blanks */
const Gap = ({
                 q,
                 idx,
                 v,
                 set,
             }: {
    q: number;
    idx: number;
    v: string;
    set: (i: number, val: string) => void;
}) => (
    <input
        id={`question-${q}`}
        type="text"
        value={v}
        placeholder={`${q}`}
        onChange={(e: ChangeEvent<HTMLInputElement>) => set(idx, e.target.value)}
        className="inline-block w-28 border-b border-gray-400 px-1 text-center focus:outline-none focus:ring focus:ring-green-300 mx-1"
    />
);

export default function Part4TreePests({
                                           answers,
                                           onAnswerChangeAction,
                                       }: Props) {
    const setAns = (idx: number, val: string) => onAnswerChangeAction(idx, val);

    return (
        <div className="space-y-8 leading-relaxed text-justify">
            {/* ─────────── 31‑36 passage ─────────── */}
            <section>
                <h3 className="font-semibold text-lg">
                    Diseases and animal pests damaging trees
                </h3>

                <p className="italic text-sm mb-3">
                    Questions 31‑36&nbsp;– Complete the sentences. Write ONE WORD ONLY for
                    each answer.
                </p>

                <p>
                    <strong>The topic of presentation:</strong>{" "}
                    <em>
                        Effects of diseases and animal pests on the native tree species in
                        the UK
                    </em>
                </p>

                <ul className="list-none pl-4 space-y-3 mt-2 text-sm">
                    <li>
                        <strong>– Background</strong>
                        <br />
                        It is widely accepted that forests are tremendously important in the
                        landscape of the UK, having many benefits: they are utilised in
                        producing furniture and paper.
                        <br />
                        However, economically{" "}
                        <Gap q={31} idx={0} v={answers[0] || ""} set={setAns} /> are often
                        unreliable in the short term, and investors occasionally wait for
                        years to gain profit.
                        <br />
                        Although it has a lower profile than many other industries, forest
                        tree generates a wide range of jobs, directly and indirectly, that
                        are of a significant{" "}
                        <Gap q={32} idx={1} v={answers[1] || ""} set={setAns} /> in rural
                        economies.
                        <br />
                        In areas with little other improvement, forests also play a vital
                        role in absorbing the{" "}
                        <Gap q={33} idx={2} v={answers[2] || ""} set={setAns} /> such as
                        carbon dioxide, and protecting water quality, people must make sure
                        that this is not threatened by the effect of excess of human
                        recreational activity.
                    </li>

                    <li>
                        <strong>– Main focus</strong>
                        <br />
                        There are some reasons for choosing this topic:
                        <ul className="list-disc ml-6">
                            <li>
                                It has become common due to tree loss through Dutch elm disease.
                                This disease struck the UK in the 1970s, with the effects
                                present today.
                            </li>
                            <li>The situation is getting worse every year.</li>
                            <li>
                                There are reports of virulent new disease likely to arrive in
                                the UK soon.
                            </li>
                        </ul>
                        One fascinating report by government task force offered an
                        excellent{" "}
                        <Gap q={34} idx={3} v={answers[3] || ""} set={setAns} /> of recent
                        study on deforestation.
                    </li>

                    <li>
                        <strong>– Tackling tree loss</strong>
                        <br />
                        Threats are growing because of the increasing movement and trade
                        between the countries. This trend hinders the process of
                        controlling the{" "}
                        <Gap q={35} idx={4} v={answers[4] || ""} set={setAns} /> of various
                        pests and diseases. One practical measure is to investigate as much
                        as possible the process how particular tree species have become{" "}
                        <Gap q={36} idx={5} v={answers[5] || ""} set={setAns} />.
                    </li>

                    <li>
                        <strong>– Methods</strong>
                        <br />
                        This can be coordinated by specialists, but a lot of information is
                        required for that.
                    </li>
                </ul>
            </section>

            {/* ─────────── 37‑40 table ─────────── */}
            <section>
                <p className="font-medium">
                    Questions 37‑40&nbsp;– Complete the table. Write ONE WORD ONLY for each
                    answer.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full mt-3 text-sm border">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-6 py-6">Type of pest</th>
                            <th className="border px-6 py-6">Tree affected</th>
                            <th className="border px-6 py-6">Main means of spread</th>
                            <th className="border px-6 py-6">Knowledge gaps</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Row 1 – Q37,38 */}
                        <tr>
                            <td className="border px-6 py-6">
                                Beetle (<em>Dendroctonus micans</em>)
                                <br />
                                <em>Origin:&nbsp;Eurasia</em>
                            </td>
                            <td className="border px-6 py-6">Spruce</td>
                            <td className="border px-6 py-6">
                                – Import of logs
                                <br />
                                –{" "}
                                <Gap q={37} idx={6} v={answers[6] || ""} set={setAns} /> of
                                adult beetles
                            </td>
                            <td className="border px-6 py-6">
                                Influence of changes in{" "}
                                <Gap q={38} idx={7} v={answers[7] || ""} set={setAns} />
                            </td>
                        </tr>

                        {/* Row 2 – Q39,40 */}
                        <tr className="bg-gray-50">
                            <td className="border px-6 py-6">
                                Moth (<em>Thaumetopoea processionea</em>)
                                <br />
                                <em>Origin:&nbsp;Central&nbsp;and Southern Europe</em>
                            </td>
                            <td className="border px-6 py-6">Oak</td>
                            <td className="border px-6 py-6">
                                – Import of live saplings for{" "}
                                <Gap q={39} idx={8} v={answers[8] || ""} set={setAns} />, e.g.
                                in gardens
                                <br />
                                – Material from tree cutting
                            </td>
                            <td className="border px-6 py-6">
                                – Biology of the moth (e.g. timing of egg hatch)
                                <br />– Best methods of{" "}
                                <Gap q={40} idx={9} v={answers[9] || ""} set={setAns} />{" "}
                                movement
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
