import React, { useState, useMemo } from 'react';

// ── Pricing config — edit values here ──────────────────────────────
// Graduated pricing (like tax brackets): each tier's rate applies only
// to the engineers within that bracket, so the total always increases.
const PRICING = {
	brackets: [
		{ upTo: 5, perHead: 3000 },
		{ upTo: 10, perHead: 2500 },
		{ upTo: 15, perHead: 2000 },
	],
	addOns: [
		{
			id: 'followup',
			label: 'Follow-Up Session',
			description:
				'A follow-up session 30-60 days after training to reinforce learnings and address new questions.',
			price: 2500,
		},
	],
	min: 3,
	max: 15,
} as const;

const fmt = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0,
});

function getGraduatedTotal(count: number) {
	let total = 0;
	let remaining = count;
	let prevUpTo = 0;
	for (const bracket of PRICING.brackets) {
		const slotSize = bracket.upTo - prevUpTo;
		const used = Math.min(remaining, slotSize);
		total += used * bracket.perHead;
		remaining -= used;
		prevUpTo = bracket.upTo;
		if (remaining <= 0) break;
	}
	return total;
}

function getEffectiveRate(count: number) {
	return Math.round(getGraduatedTotal(count) / count);
}

// ── Component ──────────────────────────────────────────────────────
interface Props {
	bookingUrl: string;
	email: string;
}

export default function PricingCalculator({ bookingUrl }: Props) {
	const [count, setCount] = useState(5);
	const [addOns, setAddOns] = useState<Record<string, boolean>>({ followup: false });

	const base = useMemo(() => getGraduatedTotal(count), [count]);
	const effectiveRate = useMemo(() => getEffectiveRate(count), [count]);
	const addOnTotal = PRICING.addOns.reduce(
		(sum, a) => sum + (addOns[a.id] ? a.price : 0),
		0,
	);
	const total = base + addOnTotal;
	const progress = ((count - PRICING.min) / (PRICING.max - PRICING.min)) * 100;
	const fullPrice = count * PRICING.brackets[0].perHead;
	const savings = fullPrice - base;

	return (
		<div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
			{/* Left column — copy */}
			<div className="flex flex-col justify-center">
				<span className="mb-4 inline-block w-fit rounded-full bg-purple-500/20 px-4 py-1.5 text-sm font-semibold text-purple-200">
					Transparent Pricing
				</span>
				<h2 className="font-serif text-3xl font-bold md:text-4xl">
					Calculate Your Training Investment
				</h2>
				<p className="mt-4 text-lg text-purple-100">
					Priced based on team size with volume discounts for larger teams.
				</p>
				<ul className="mt-8 space-y-5">
					<Feature
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
							/>
						}
						title="Volume Discounts"
						desc="Lower per-head rate for larger teams"
					/>
					<Feature
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
							/>
						}
						title="Follow-Up Sessions"
						desc="Optional reinforcement after training"
					/>
					<Feature
						icon={
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
							/>
						}
						title="Satisfaction Guarantee"
						desc="Your team ships with confidence or we make it right"
					/>
				</ul>
			</div>

			{/* Right column — calculator card */}
			<div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
				<h3 className="font-serif text-xl font-bold">Training Cost Calculator</h3>

				{/* Slider */}
				<div className="mt-6">
					<div className="flex items-baseline justify-between">
						<label htmlFor="engineer-count" className="text-sm font-medium text-purple-200">
							Number of Engineers: <span className="text-white">{count}</span>
						</label>
						<span className="text-sm font-semibold text-white">{fmt.format(base)}</span>
					</div>
					<input
						id="engineer-count"
						type="range"
						min={PRICING.min}
						max={PRICING.max}
						step={1}
						value={count}
						onChange={(e) => setCount(Number(e.target.value))}
						className="pricing-slider mt-3 w-full cursor-pointer"
						style={{ '--progress': `${progress}%` } as React.CSSProperties}
					/>
					<div className="mt-1.5 flex justify-between text-xs text-purple-300">
						<span>Minimum {PRICING.min} engineers</span>
						<span>{fmt.format(effectiveRate)} avg per engineer</span>
					</div>
					{savings > 0 && (
						<div className="mt-2 text-xs font-medium text-teal-300">
							Volume discount: saving {fmt.format(savings)} vs. base rate
						</div>
					)}
				</div>

				{/* Add-on */}
				{PRICING.addOns.map((addon) => (
					<div key={addon.id} className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
						<div className="flex items-center justify-between">
							<div>
								<span className="font-medium">{addon.label}</span>
								<span className="ml-2 text-sm text-purple-300">{fmt.format(addon.price)}</span>
							</div>
							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => setAddOns((s) => ({ ...s, [addon.id]: true }))}
									className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
										addOns[addon.id]
											? 'bg-purple-600 text-white'
											: 'bg-white/10 text-purple-200 hover:bg-white/20'
									}`}
								>
									Yes
								</button>
								<button
									type="button"
									onClick={() => setAddOns((s) => ({ ...s, [addon.id]: false }))}
									className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
										!addOns[addon.id]
											? 'bg-purple-600 text-white'
											: 'bg-white/10 text-purple-200 hover:bg-white/20'
									}`}
								>
									No
								</button>
							</div>
						</div>
						<p className="mt-2 text-sm text-purple-300">{addon.description}</p>
					</div>
				))}

				{/* Divider */}
				<div className="my-6 border-t border-white/10" />

				{/* Total */}
				<div className="flex items-baseline justify-between">
					<span className="text-lg font-medium text-purple-200">Total Investment</span>
					<span className="gradient-text text-4xl font-bold">{fmt.format(total)}</span>
				</div>

				{/* Larger teams note */}
				<p className="mt-4 text-center text-xs text-purple-300">
					Larger team? <a href={bookingUrl} className="underline hover:text-white">Let's talk</a> — we'll put together custom pricing.
				</p>

				{/* CTA */}
				<a
					href={bookingUrl}
					className="mt-4 block w-full rounded-lg bg-purple-600 py-4 text-center font-serif text-lg font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02] hover:bg-purple-500 hover:shadow-xl hover:shadow-purple-500/30"
				>
					Schedule a Consultation
				</a>
			</div>
		</div>
	);
}

// ── Small helper ───────────────────────────────────────────────────
function Feature({
	icon,
	title,
	desc,
}: {
	icon: React.ReactNode;
	title: string;
	desc: string;
}) {
	return (
		<li className="flex gap-4">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="mt-0.5 size-6 shrink-0 text-purple-300"
			>
				{icon}
			</svg>
			<div>
				<h4 className="font-semibold">{title}</h4>
				<p className="text-sm text-purple-200">{desc}</p>
			</div>
		</li>
	);
}
