import { AreaChart, BarChart, StackedAreaChart, DivergingBars, type Pt, type Series } from './charts';

type ToolId = 'claude-code' | 'pi' | 'codex';
type Metric = 'tokens' | 'costUSD';

export interface InsightsWeek {
	weekEnding: string;
	tokens: number;
	costUSD: number;
	sessions: number;
	messages: number;
	byTool: Partial<Record<ToolId, { tokens: number; costUSD: number }>>;
	prsMerged: number;
	additions: number;
	deletions: number;
}

export interface InsightsData {
	weekly: InsightsWeek[];
	hourCounts: number[];
	weekdayCounts: number[];
}

const fmtInt = new Intl.NumberFormat('en-US');
const fmtUsd = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
	maximumFractionDigits: 0,
});
const fmtCompact = (n: number) => {
	if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
	if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
	if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
	return String(Math.round(n));
};
const fmtHour = (h: number) => `${h % 12 || 12}${h < 12 ? 'a' : 'p'}`;
const weekLabel = (weekEnding: string) =>
	new Date(weekEnding + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const TOOL_META: Record<ToolId, { label: string; colorClass: string }> = {
	'claude-code': { label: 'Claude Code', colorClass: 'text-orange-500 dark:text-orange-400' },
	codex: { label: 'Codex', colorClass: 'text-emerald-500 dark:text-emerald-400' },
	pi: { label: 'Pi', colorClass: 'text-violet-500 dark:text-violet-400' },
};
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
	return (
		<div className="dark:border-dark-border dark:bg-dark-surface/40 rounded-lg border border-gray-200 p-4">
			<h3 className="text-sm font-semibold">{title}</h3>
			{subtitle && <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
			<div className="mt-2">{children}</div>
		</div>
	);
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
	return (
		<div>
			<h2 className="font-serif text-2xl font-semibold">{title}</h2>
			{subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
		</div>
	);
}

export default function Insights({ insights, metric }: { insights: InsightsData; metric: Metric }) {
	const { weekly, hourCounts, weekdayCounts } = insights;
	if (weekly.length === 0) return null;

	const isCost = metric === 'costUSD';
	const metricVal = (w: InsightsWeek) => (isCost ? w.costUSD : w.tokens);
	const metricFmt = isCost ? (n: number) => fmtUsd.format(n) : fmtCompact;
	const labelOf = (w: InsightsWeek) => weekLabel(w.weekEnding);

	const tokensOrCost: Pt[] = weekly.map(w => ({ label: labelOf(w), value: metricVal(w) }));
	const sessionsPts: Pt[] = weekly.map(w => ({ label: labelOf(w), value: w.sessions }));
	const messagesPts: Pt[] = weekly.map(w => ({ label: labelOf(w), value: w.messages }));
	const prsPts: Pt[] = weekly.map(w => ({ label: labelOf(w), value: w.prsMerged }));

	const hourPts: Pt[] = hourCounts.map((v, h) => ({ label: fmtHour(h), value: v }));
	const peakHour = hourCounts.reduce((best, v, i, a) => (v > a[best]! ? i : best), 0);
	const weekdayPts: Pt[] = weekdayCounts.map((v, i) => ({ label: WEEKDAYS[i]!, value: v }));

	const presentTools = (['claude-code', 'codex', 'pi'] as ToolId[]).filter(t => weekly.some(w => w.byTool[t]));
	const toolSeries: Series[] = presentTools.map(t => ({
		name: TOOL_META[t].label,
		colorClass: TOOL_META[t].colorClass,
		values: weekly.map(w => {
			const s = w.byTool[t];
			return s ? (isCost ? s.costUSD : s.tokens) : 0;
		}),
	}));
	const weekLabels = weekly.map(labelOf);

	const totalAdds = weekly.reduce((s, w) => s + w.additions, 0);
	const totalDels = weekly.reduce((s, w) => s + w.deletions, 0);
	const totalPrs = weekly.reduce((s, w) => s + w.prsMerged, 0);
	const divergingWeeks = weekly.map(w => ({ label: labelOf(w), additions: w.additions, deletions: w.deletions }));

	return (
		<div className="space-y-10">
			<section className="space-y-3">
				<SectionHeading title="Trends over time" subtitle="Weekly activity across the full history." />
				<div className="grid gap-3 md:grid-cols-2">
					<ChartCard title={isCost ? 'Cost per week' : 'Tokens per week'}>
						<AreaChart points={tokensOrCost} format={metricFmt} colorClass="text-blue-500 dark:text-blue-400" />
					</ChartCard>
					<ChartCard title="PRs merged per week" subtitle={`${fmtInt.format(totalPrs)} total`}>
						<AreaChart points={prsPts} format={fmtInt.format} colorClass="text-amber-500 dark:text-amber-400" />
					</ChartCard>
					<ChartCard title="Sessions per week">
						<AreaChart points={sessionsPts} format={fmtInt.format} colorClass="text-indigo-500 dark:text-indigo-400" />
					</ChartCard>
					<ChartCard title="Messages per week">
						<AreaChart points={messagesPts} format={fmtInt.format} colorClass="text-teal-500 dark:text-teal-400" />
					</ChartCard>
				</div>
			</section>

			<section className="space-y-3">
				<SectionHeading
					title="Tool mix over time"
					subtitle={isCost ? 'Cost split per week' : 'Tokens split per week'}
				/>
				<div className="dark:border-dark-border dark:bg-dark-surface/40 rounded-lg border border-gray-200 p-4">
					<StackedAreaChart labels={weekLabels} series={toolSeries} format={metricFmt} />
				</div>
			</section>

			<section className="space-y-3">
				<SectionHeading title="When I code" subtitle="All-time message activity by local hour and weekday." />
				<div className="grid gap-3 md:grid-cols-2">
					<ChartCard title="By hour of day" subtitle={`Peak: ${fmtHour(peakHour)}`}>
						<BarChart
							points={hourPts}
							format={fmtInt.format}
							highlightIndex={peakHour}
							maxLabels={8}
							colorClass="text-blue-500 dark:text-blue-400"
						/>
					</ChartCard>
					<ChartCard title="By day of week">
						<BarChart points={weekdayPts} format={fmtInt.format} colorClass="text-blue-500 dark:text-blue-400" />
					</ChartCard>
				</div>
			</section>

			<section className="space-y-3">
				<SectionHeading title="Lines changed" subtitle="Across merged public PRs." />
				<div className="grid grid-cols-2 gap-3 sm:max-w-sm">
					<div className="dark:border-dark-border dark:bg-dark-surface/40 rounded-lg border border-gray-200 px-3 py-3">
						<div className="text-[11px] tracking-wide text-gray-500 uppercase dark:text-gray-400">Additions</div>
						<div className="mt-0.5 font-mono text-xl font-semibold text-emerald-600 dark:text-emerald-400">
							+{fmtInt.format(totalAdds)}
						</div>
					</div>
					<div className="dark:border-dark-border dark:bg-dark-surface/40 rounded-lg border border-gray-200 px-3 py-3">
						<div className="text-[11px] tracking-wide text-gray-500 uppercase dark:text-gray-400">Deletions</div>
						<div className="mt-0.5 font-mono text-xl font-semibold text-rose-600 dark:text-rose-400">
							−{fmtInt.format(totalDels)}
						</div>
					</div>
				</div>
				<div className="dark:border-dark-border dark:bg-dark-surface/40 rounded-lg border border-gray-200 p-4">
					<DivergingBars weeks={divergingWeeks} format={fmtCompact} />
				</div>
			</section>
		</div>
	);
}
