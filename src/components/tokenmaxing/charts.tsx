// Hand-rolled SVG chart primitives for the /tokens insights section.
// No charting dependency — matches the existing div-heatmap / CSS-bar aesthetic.
// All charts use a fixed viewBox and scale to their container (width: 100%).
// Color is driven by a Tailwind text-* class via `currentColor`.

export interface Pt {
	label: string;
	value: number;
}

const VB_W = 560; // viewBox width units; height passed per chart
const PAD = { top: 10, right: 10, bottom: 22, left: 40 };

const identity = (n: number) => String(n);

// Evenly pick ~`max` label indices so dense x-axes don't overlap.
function labelIndices(count: number, max: number): Set<number> {
	if (count <= max) return new Set(Array.from({ length: count }, (_, i) => i));
	const step = (count - 1) / (max - 1);
	const out = new Set<number>();
	for (let i = 0; i < max; i++) out.add(Math.round(i * step));
	out.add(count - 1);
	return out;
}

// Catmull-Rom → cubic bézier, with control points clamped to the plot band so
// the smoothed curve (and its fill) never bows past the axis.
function smoothPath(pts: Array<{ x: number; y: number }>, yMin: number, yMax: number): string {
	if (pts.length === 0) return '';
	if (pts.length === 1) return `M${pts[0]!.x},${pts[0]!.y}`;
	const clamp = (y: number) => Math.max(yMin, Math.min(yMax, y));
	let d = `M${pts[0]!.x},${pts[0]!.y}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[i - 1] ?? pts[i]!;
		const p1 = pts[i]!;
		const p2 = pts[i + 1]!;
		const p3 = pts[i + 2] ?? p2;
		const c1x = p1.x + (p2.x - p0.x) / 6;
		const c1y = clamp(p1.y + (p2.y - p0.y) / 6);
		const c2x = p2.x - (p3.x - p1.x) / 6;
		const c2y = clamp(p2.y - (p3.y - p1.y) / 6);
		d += `C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
	}
	return d;
}

function YAxis({ max, height, format }: { max: number; height: number; format: (n: number) => string }) {
	const plotTop = PAD.top;
	const plotBottom = height - PAD.bottom;
	const ticks = [max, max / 2, 0];
	return (
		<g className="text-gray-400 dark:text-gray-500">
			{ticks.map((t, i) => {
				const y = plotBottom - (t / (max || 1)) * (plotBottom - plotTop);
				return (
					<g key={i}>
						<line
							x1={PAD.left}
							x2={VB_W - PAD.right}
							y1={y}
							y2={y}
							stroke="currentColor"
							strokeOpacity={0.18}
							strokeWidth={1}
						/>
						<text x={PAD.left - 6} y={y + 3} textAnchor="end" fontSize={10} fill="currentColor">
							{format(t)}
						</text>
					</g>
				);
			})}
		</g>
	);
}

export function AreaChart({
	points,
	format = identity,
	height = 180,
	colorClass = 'text-blue-500 dark:text-blue-400',
}: {
	points: Pt[];
	format?: (n: number) => string;
	height?: number;
	colorClass?: string;
}) {
	if (points.length === 0) {
		return <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No data.</div>;
	}
	const plotL = PAD.left;
	const plotR = VB_W - PAD.right;
	const plotT = PAD.top;
	const plotB = height - PAD.bottom;
	const max = Math.max(1, ...points.map(p => p.value));
	const xOf = (i: number) =>
		points.length === 1 ? (plotL + plotR) / 2 : plotL + (i / (points.length - 1)) * (plotR - plotL);
	const yOf = (v: number) => plotB - (v / max) * (plotB - plotT);
	const coords = points.map((p, i) => ({ x: xOf(i), y: yOf(p.value) }));
	const line = smoothPath(coords, plotT, plotB);
	const area = `${line} L${coords[coords.length - 1]!.x},${plotB} L${coords[0]!.x},${plotB} Z`;
	const showMarkers = points.length <= 20;
	const labelsToShow = labelIndices(points.length, 7);

	return (
		<svg viewBox={`0 0 ${VB_W} ${height}`} className="h-auto w-full" role="img">
			<YAxis max={max} height={height} format={format} />
			<g className={colorClass}>
				<path d={area} fill="currentColor" fillOpacity={0.14} stroke="none" />
				<path d={line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
				{coords.map((c, i) =>
					showMarkers ? (
						<circle key={i} cx={c.x} cy={c.y} r={2.5} fill="currentColor">
							<title>{`${points[i]!.label}: ${format(points[i]!.value)}`}</title>
						</circle>
					) : null,
				)}
			</g>
			<g className="text-gray-500 dark:text-gray-400">
				{points.map((p, i) =>
					labelsToShow.has(i) ? (
						<text key={i} x={xOf(i)} y={height - 7} textAnchor="middle" fontSize={10} fill="currentColor">
							{p.label}
						</text>
					) : null,
				)}
			</g>
		</svg>
	);
}

export function BarChart({
	points,
	format = identity,
	height = 180,
	colorClass = 'text-blue-500 dark:text-blue-400',
	highlightIndex,
	maxLabels = 12,
}: {
	points: Pt[];
	format?: (n: number) => string;
	height?: number;
	colorClass?: string;
	highlightIndex?: number;
	maxLabels?: number;
}) {
	if (points.length === 0) {
		return <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No data.</div>;
	}
	const plotL = PAD.left;
	const plotR = VB_W - PAD.right;
	const plotT = PAD.top;
	const plotB = height - PAD.bottom;
	const max = Math.max(1, ...points.map(p => p.value));
	const slot = (plotR - plotL) / points.length;
	const barW = Math.max(1, slot * 0.7);
	const yOf = (v: number) => plotB - (v / max) * (plotB - plotT);
	const labelsToShow = labelIndices(points.length, maxLabels);

	return (
		<svg viewBox={`0 0 ${VB_W} ${height}`} className="h-auto w-full" role="img">
			<YAxis max={max} height={height} format={format} />
			<g className={colorClass}>
				{points.map((p, i) => {
					const x = plotL + i * slot + (slot - barW) / 2;
					const y = yOf(p.value);
					const dim = highlightIndex !== undefined && highlightIndex !== i;
					return (
						<rect
							key={i}
							x={x}
							y={y}
							width={barW}
							height={Math.max(0, plotB - y)}
							rx={1.5}
							fill="currentColor"
							fillOpacity={dim ? 0.35 : 0.9}
						>
							<title>{`${p.label}: ${format(p.value)}`}</title>
						</rect>
					);
				})}
			</g>
			<g className="text-gray-500 dark:text-gray-400">
				{points.map((p, i) =>
					labelsToShow.has(i) ? (
						<text
							key={i}
							x={plotL + i * slot + slot / 2}
							y={height - 7}
							textAnchor="middle"
							fontSize={10}
							fill="currentColor"
						>
							{p.label}
						</text>
					) : null,
				)}
			</g>
		</svg>
	);
}

export interface Series {
	name: string;
	values: number[];
	colorClass: string;
}

// Straight-segment stacked area (linear, not smoothed — keeps layers from
// crossing). `labels` and every series' `values` share one index space.
export function StackedAreaChart({
	labels,
	series,
	format = identity,
	height = 200,
}: {
	labels: string[];
	series: Series[];
	format?: (n: number) => string;
	height?: number;
}) {
	const n = labels.length;
	if (n === 0 || series.length === 0) {
		return <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No data.</div>;
	}
	const plotL = PAD.left;
	const plotR = VB_W - PAD.right;
	const plotT = PAD.top;
	const plotB = height - PAD.bottom;
	const totals = labels.map((_, i) => series.reduce((s, ser) => s + (ser.values[i] ?? 0), 0));
	const max = Math.max(1, ...totals);
	const xOf = (i: number) => (n === 1 ? (plotL + plotR) / 2 : plotL + (i / (n - 1)) * (plotR - plotL));
	const yOf = (v: number) => plotB - (v / max) * (plotB - plotT);
	const labelsToShow = labelIndices(n, 7);

	// Build cumulative bands bottom-up.
	const cum = new Array<number>(n).fill(0);
	const bands = series.map(ser => {
		const lower = cum.slice();
		const upper = cum.map((c, i) => c + (ser.values[i] ?? 0));
		for (let i = 0; i < n; i++) cum[i] = upper[i]!;
		const top = upper.map((v, i) => `${xOf(i)},${yOf(v)}`);
		const bottom = lower.map((v, i) => `${xOf(i)},${yOf(v)}`).reverse();
		return { name: ser.name, colorClass: ser.colorClass, d: `M${[...top, ...bottom].join(' L')} Z` };
	});

	return (
		<div>
			<svg viewBox={`0 0 ${VB_W} ${height}`} className="h-auto w-full" role="img">
				<YAxis max={max} height={height} format={format} />
				{bands.map((b, i) => (
					<path key={i} className={b.colorClass} d={b.d} fill="currentColor" fillOpacity={0.6} stroke="none" />
				))}
				<g className="text-gray-500 dark:text-gray-400">
					{labels.map((l, i) =>
						labelsToShow.has(i) ? (
							<text key={i} x={xOf(i)} y={height - 7} textAnchor="middle" fontSize={10} fill="currentColor">
								{l}
							</text>
						) : null,
					)}
				</g>
			</svg>
			<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
				{series.map(s => (
					<span key={s.name} className="inline-flex items-center gap-1.5">
						<span className={`inline-block h-2.5 w-2.5 rounded-sm ${s.colorClass}`}>
							<svg viewBox="0 0 10 10" className="h-full w-full">
								<rect width="10" height="10" rx="2" fill="currentColor" fillOpacity={0.6} />
							</svg>
						</span>
						{s.name}
					</span>
				))}
			</div>
		</div>
	);
}

// Diverging weekly bars: additions up (green), deletions down (red).
export function DivergingBars({
	weeks,
	height = 160,
	format = identity,
}: {
	weeks: Array<{ label: string; additions: number; deletions: number }>;
	height?: number;
	format?: (n: number) => string;
}) {
	if (weeks.length === 0) {
		return <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No data.</div>;
	}
	const plotL = PAD.left;
	const plotR = VB_W - PAD.right;
	const plotT = PAD.top;
	const plotB = height - PAD.bottom;
	const mid = (plotT + plotB) / 2;
	const max = Math.max(1, ...weeks.map(w => Math.max(w.additions, w.deletions)));
	const slot = (plotR - plotL) / weeks.length;
	const barW = Math.max(1, slot * 0.7);
	const hOf = (v: number) => (v / max) * (mid - plotT);
	const labelsToShow = labelIndices(weeks.length, 7);

	return (
		<svg viewBox={`0 0 ${VB_W} ${height}`} className="h-auto w-full" role="img">
			<line
				x1={plotL}
				x2={plotR}
				y1={mid}
				y2={mid}
				stroke="currentColor"
				strokeOpacity={0.2}
				className="text-gray-400"
			/>
			{weeks.map((w, i) => {
				const x = plotL + i * slot + (slot - barW) / 2;
				const addH = hOf(w.additions);
				const delH = hOf(w.deletions);
				return (
					<g key={i}>
						<rect
							x={x}
							y={mid - addH}
							width={barW}
							height={addH}
							rx={1}
							className="text-emerald-500 dark:text-emerald-400"
							fill="currentColor"
							fillOpacity={0.85}
						>
							<title>{`${w.label}: +${format(w.additions)}`}</title>
						</rect>
						<rect
							x={x}
							y={mid}
							width={barW}
							height={delH}
							rx={1}
							className="text-rose-500 dark:text-rose-400"
							fill="currentColor"
							fillOpacity={0.85}
						>
							<title>{`${w.label}: −${format(w.deletions)}`}</title>
						</rect>
					</g>
				);
			})}
			<g className="text-gray-500 dark:text-gray-400">
				{weeks.map((w, i) =>
					labelsToShow.has(i) ? (
						<text
							key={i}
							x={plotL + i * slot + slot / 2}
							y={height - 7}
							textAnchor="middle"
							fontSize={10}
							fill="currentColor"
						>
							{w.label}
						</text>
					) : null,
				)}
			</g>
		</svg>
	);
}
