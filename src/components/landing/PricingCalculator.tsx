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
	const addOnTotal = PRICING.addOns.reduce((sum, a) => sum + (addOns[a.id] ? a.price : 0), 0);
	const total = base + addOnTotal;
	const progress = ((count - PRICING.min) / (PRICING.max - PRICING.min)) * 100;
	const fullPrice = count * PRICING.brackets[0].perHead;
	const savings = fullPrice - base;

	return (
		<div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
			{/* Scoped styles for the on-brand range slider. The shared
			    .pricing-slider class was removed, so the track/thumb are
			    restyled here with the warm palette: a marigold fill on an
			    ink track, and a hard-bordered card thumb. */}
			<style>{sliderCss}</style>

			{/* Left column — copy */}
			<div className="flex flex-col justify-center">
				<span className="mb-4 inline-flex w-fit -rotate-1 items-center gap-2 rounded-full border-2 border-paper bg-marigold px-3.5 py-1.5 font-display text-sm font-bold text-ink">
					Transparent pricing
				</span>
				<h2 className="font-display text-3xl font-extrabold text-paper md:text-4xl">
					Calculate Your Training Investment
				</h2>
				<p className="mt-4 text-lg text-paper/80">
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

			{/* Right column — calculator card. surface-light keeps it a light
			    card with dark text even on the dark slab, in both themes. */}
			<div className="surface-light rounded-[14px] border-2 border-paper bg-card p-8 text-ink shadow-[6px_6px_0_var(--color-marigold)]">
				<h3 className="font-display text-xl font-extrabold text-ink">Training Cost Calculator</h3>

				{/* Slider */}
				<div className="mt-6">
					<div className="flex items-baseline justify-between gap-3">
						<label htmlFor="engineer-count" className="text-sm font-medium text-ink-soft">
							Number of Engineers: <span className="font-display font-bold text-ink">{count}</span>
						</label>
						<span className="font-display text-sm font-bold text-ink">{fmt.format(base)}</span>
					</div>
					<input
						id="engineer-count"
						type="range"
						min={PRICING.min}
						max={PRICING.max}
						step={1}
						value={count}
						onChange={(e) => setCount(Number(e.target.value))}
						className="riso-slider mt-3 w-full cursor-pointer"
						style={{ '--progress': `${progress}%` } as React.CSSProperties}
					/>
					<div className="mt-2 flex justify-between font-mono text-xs text-ink-soft">
						<span>Minimum {PRICING.min} engineers</span>
						<span>{fmt.format(effectiveRate)} avg per engineer</span>
					</div>
					{savings > 0 && (
						<div className="mt-3 inline-flex -rotate-1 items-center rounded-full border-2 border-ink bg-pine px-3 py-1 font-display text-xs font-bold text-ink">
							Volume discount: saving {fmt.format(savings)} vs. base rate
						</div>
					)}
				</div>

				{/* Add-on */}
				{PRICING.addOns.map((addon) => (
					<div key={addon.id} className="mt-6 rounded-[10px] border-2 border-ink bg-paper-2 p-4">
						<div className="flex items-center justify-between gap-3">
							<div>
								<span className="font-display font-bold text-ink">{addon.label}</span>
								<span className="ml-2 font-mono text-sm text-ink-soft">{fmt.format(addon.price)}</span>
							</div>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setAddOns((s) => ({ ...s, [addon.id]: true }))}
									className={`rounded-full border-2 border-ink px-3.5 py-1 font-display text-sm font-bold transition-transform active:translate-y-px ${
										addOns[addon.id] ? 'bg-tomato text-paper' : 'bg-card text-ink hover:bg-paper-2'
									}`}
								>
									Yes
								</button>
								<button
									type="button"
									onClick={() => setAddOns((s) => ({ ...s, [addon.id]: false }))}
									className={`rounded-full border-2 border-ink px-3.5 py-1 font-display text-sm font-bold transition-transform active:translate-y-px ${
										!addOns[addon.id] ? 'bg-tomato text-paper' : 'bg-card text-ink hover:bg-paper-2'
									}`}
								>
									No
								</button>
							</div>
						</div>
						<p className="mt-2 text-sm text-ink-soft">{addon.description}</p>
					</div>
				))}

				{/* Divider */}
				<div className="my-6 border-t-2 border-dashed border-ink/30" />

				{/* Total */}
				<div className="flex items-baseline justify-between gap-3">
					<span className="font-display text-lg font-bold text-ink">Total Investment</span>
					<span className="font-display text-4xl font-extrabold text-tomato">{fmt.format(total)}</span>
				</div>

				{/* Larger teams note */}
				<p className="mt-4 text-center text-xs text-ink-soft">
					Larger team?{' '}
					<a href={bookingUrl} className="font-bold text-ink underline decoration-tomato decoration-2 underline-offset-2">
						Let's talk
					</a>{' '}
					and we'll put together custom pricing.
				</p>

				{/* CTA */}
				<a
					href={bookingUrl}
					className="btn btn-primary mt-5 w-full justify-center py-4 text-lg"
				>
					Schedule a Consultation
				</a>
			</div>
		</div>
	);
}

// ── On-brand range slider styles ───────────────────────────────────
const sliderCss = `
.riso-slider {
	-webkit-appearance: none;
	appearance: none;
	height: 12px;
	border-radius: 999px;
	border: 2px solid var(--color-ink);
	background: linear-gradient(
		to right,
		var(--color-marigold) 0%,
		var(--color-marigold) var(--progress),
		var(--color-paper-2) var(--progress),
		var(--color-paper-2) 100%
	);
	outline-offset: 3px;
}
.riso-slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 26px;
	height: 26px;
	border-radius: 999px;
	background: var(--color-card);
	border: 2px solid var(--color-ink);
	box-shadow: var(--shadow-hard-sm);
	cursor: pointer;
	transition: transform 0.12s cubic-bezier(0.2, 0.7, 0.3, 1), box-shadow 0.12s cubic-bezier(0.2, 0.7, 0.3, 1);
}
.riso-slider::-webkit-slider-thumb:hover {
	transform: translate(-1px, -1px);
	box-shadow: var(--shadow-hard);
}
.riso-slider::-webkit-slider-thumb:active {
	transform: translate(1px, 1px);
	box-shadow: 0 0 0 var(--color-ink);
}
.riso-slider::-moz-range-thumb {
	width: 26px;
	height: 26px;
	border-radius: 999px;
	background: var(--color-card);
	border: 2px solid var(--color-ink);
	box-shadow: var(--shadow-hard-sm);
	cursor: pointer;
}
.riso-slider::-moz-range-track {
	height: 12px;
	border-radius: 999px;
	background: transparent;
}
@media (prefers-reduced-motion: reduce) {
	.riso-slider::-webkit-slider-thumb { transition: none; }
}
`;

// ── Small helper ───────────────────────────────────────────────────
function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
	return (
		<li className="flex gap-4">
			<span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-paper bg-paper/10 text-paper">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.75}
					stroke="currentColor"
					className="size-5"
				>
					{icon}
				</svg>
			</span>
			<div>
				<h4 className="font-display font-bold text-paper">{title}</h4>
				<p className="text-sm text-paper/70">{desc}</p>
			</div>
		</li>
	);
}
