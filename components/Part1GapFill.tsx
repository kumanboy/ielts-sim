/* Part1GapFill.tsx */
import React from "react";

type Props = {
    answers: string[];
    onChange: (idx: number, val: string) => void;
};

const blank = (i: number, val: string, set: (v: string) => void) => (
    <input
        key={i}
        value={val}
        onChange={(e) => set(e.target.value)}
        className="inline-block w-24 border-b border-dotted outline-none text-center mx-1"
        placeholder={`${i}`}
    />
);

export default function Part1GapFill({ answers, onChange }: Props) {
    return (
        <article className="leading-7 space-y-3">
            <p className="font-semibold">Items:</p>

            <p>
                <span className="font-semibold">Dining table:&nbsp;</span>
                – {blank(1, answers[0], (v) => onChange(0, v))} shape
                <br />– medium size
                <br />– {blank(2, answers[1], (v) => onChange(1, v))} old
                <br />– price: £25.00
            </p>

            <p>
                <span className="font-semibold">Dining chairs:&nbsp;</span>
                – set of &nbsp;
                {blank(3, answers[2], (v) => onChange(2, v))} chairs
                <br />– seats covered in &nbsp;
                {blank(4, answers[3], (v) => onChange(3, v))} material
                <br />– in &nbsp;
                {blank(5, answers[4], (v) => onChange(4, v))} condition
                <br />– price: £20.00
            </p>

            <p>
                <span className="font-semibold">Desk:&nbsp;</span>
                – length: 1 metre 20
                <br />– 3 drawers. Top drawer has a &nbsp;
                {blank(6, answers[5], (v) => onChange(5, v))}
                <br />– price: £ &nbsp;
                {blank(7, answers[6], (v) => onChange(6, v))}
            </p>

            <p className="font-semibold">Address:</p>
            <p>
                &nbsp;{blank(8, answers[7], (v) => onChange(7, v))}&nbsp;Old Lane, Stonethorpe
            </p>

            <p className="font-semibold">Directions:</p>
            <p>
                Take the Hawcroft road out of Stonethorpe.
                <br />
                Go past the secondary school, then turn &nbsp;
                {blank(9, answers[8], (v) => onChange(8, v))} at the crossroads.
                <br />
                House is down this road, opposite the &nbsp;
                {blank(10, answers[9], (v) => onChange(9, v))}
            </p>
        </article>
    );
}
