import { useMemo, useState } from 'react';
import Insights, { type InsightsData } from './Insights';

type ToolId = 'claude-code' | 'pi' | 'codex';

export interface DailyEntry {
	date: string;
	tokens: number;
	costUSD: number;
	sessions: number;
	messages: number;
	hourCounts: number[];
	byTool: Partial<Record<ToolId, { tokens: number; costUSD: number; sessions: number; messages: number }>>;
	byProvider: Record<string, { tokens: number; costUSD: number }>;
	byModel: Array<{
		tool: ToolId;
		provider: string;
		id: string;
		tokens: number;
		costUSD: number;
		sessions: number;
		messages: number;
	}>;
	byProject: Record<string, { tokens: number; costUSD: number; sessions: number }>;
}

export interface Breakdown {
	byTool: Array<{ id: ToolId; label: string; tokens: number; costUSD: number; sessions: number; messages: number }>;
	byProvider: Array<{ id: string; label: string; tokens: number; costUSD: number }>;
	byModel: Array<{
		tool: ToolId;
		provider: string;
		id: string;
		label: string;
		tokens: number;
		costUSD: number;
		sessions: number;
		messages: number;
	}>;
	byProject: Array<{ label: string; tokens: number; costUSD: number; sessions: number }>;
}

interface PullRequestSummary {
	createdAt: string;
	mergedAt: string | null;
	state: 'open' | 'merged' | 'closed';
}

interface Props {
	daily: DailyEntry[];
	breakdown: Breakdown;
	staticSummary: {
		currentStreakDays: number;
		longestStreakDays: number;
	};
	pullRequests: PullRequestSummary[];
	insights?: InsightsData;
}

type Range = 'all' | '30d' | '7d';
type Metric = 'tokens' | 'costUSD';
type View = 'overview' | 'tool' | 'provider' | 'model' | 'project';

function getCutoffDate(range: Range): string | null {
	if (range === 'all') return null;
	const days = range === '7d' ? 7 : 30;
	const cutoff = new Date();
	cutoff.setUTCDate(cutoff.getUTCDate() - days);
	return cutoff.toISOString().slice(0, 10);
}

function filterByRange(daily: DailyEntry[], range: Range): DailyEntry[] {
	const cutoff = getCutoffDate(range);
	if (!cutoff) return daily;
	return daily.filter(d => d.date >= cutoff);
}

function fmtDateRange(first: string, last: string): string {
	const fmt = (d: string) =>
		new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	return `${fmt(first)} – ${fmt(last)}`;
}

const fmtInt = new Intl.NumberFormat('en-US');
const fmtUsd = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});
const fmtVal = (m: Metric, n: number) => (m === 'costUSD' ? fmtUsd.format(n) : fmtInt.format(n));
const fmtCompactTokens = (n: number) => {
	if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
	if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
	if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
	return String(n);
};
const fmtHour = (h: number) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;

function StatsGrid({ tiles }: { tiles: Array<{ label: string; value: string }> }) {
	return (
		<div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-5">
			{tiles.map(t => (
				<div
					key={t.label}
					className="dark:border-dark-border dark:bg-dark-surface/60 rounded-lg border border-gray-200 bg-white/60 px-3 py-3 sm:p-4"
				>
					<div className="text-[11px] tracking-wide text-gray-500 uppercase dark:text-gray-400">{t.label}</div>
					<div className="mt-0.5 font-mono text-lg font-semibold sm:mt-1 sm:text-2xl">{t.value}</div>
				</div>
			))}
		</div>
	);
}

function Heatmap({ daily, metric }: { daily: DailyEntry[]; metric: Metric }) {
	if (daily.length === 0) {
		return <div className="py-8 text-center text-gray-500 dark:text-gray-400">No activity in this range.</div>;
	}
	const start = new Date(daily[0]!.date + 'T00:00:00Z');
	const end = new Date(daily[daily.length - 1]!.date + 'T00:00:00Z');
	const lookup = new Map(daily.map(d => [d.date, d[metric]]));
	const days: { date: string; value: number }[] = [];
	for (const cur = new Date(start); cur <= end; cur.setUTCDate(cur.getUTCDate() + 1)) {
		const ymd = cur.toISOString().slice(0, 10);
		days.push({ date: ymd, value: lookup.get(ymd) ?? 0 });
	}
	const max = Math.max(1, ...days.map(d => d.value));
	const bucket = (v: number) => {
		if (v <= 0) return 0;
		return Math.min(4, Math.ceil((v / max) * 4));
	};
	const cls = [
		'bg-gray-200 dark:bg-dark-surface',
		'bg-blue-200 dark:bg-blue-900/40',
		'bg-blue-300 dark:bg-blue-700/60',
		'bg-blue-400 dark:bg-blue-500/80',
		'bg-blue-500 dark:bg-blue-400',
	];
	const startDow = new Date(days[0]!.date + 'T00:00:00Z').getUTCDay();
	const padded = [...new Array<null>(startDow).fill(null), ...days];
	const cols: Array<Array<(typeof padded)[number]>> = [];
	for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7));
	return (
		<div className="overflow-x-auto py-2">
			<div className="flex gap-1">
				{cols.map((col, ci) => (
					<div key={ci} className="flex flex-col gap-1">
						{col.map((cell, ri) =>
							cell ? (
								<div
									key={cell.date}
									title={`${cell.date}: ${fmtVal(metric, cell.value)}`}
									className={`h-3 w-3 rounded-sm ${cls[bucket(cell.value)]}`}
								/>
							) : (
								<div key={`pad-${ci}-${ri}`} className="h-3 w-3" />
							),
						)}
					</div>
				))}
			</div>
		</div>
	);
}

function BreakdownTable({
	rows,
	metric,
}: {
	rows: Array<{ label: string; tokens: number; costUSD: number }>;
	metric: Metric;
}) {
	const total = rows.reduce((s, r) => s + r[metric], 0) || 1;
	return (
		<table className="w-full text-sm">
			<thead className="text-left text-xs tracking-wide text-gray-500 uppercase">
				<tr>
					<th className="py-2">Name</th>
					<th className="py-2 text-right">{metric === 'costUSD' ? 'Cost' : 'Tokens'}</th>
					<th className="w-1/3 py-2">Share</th>
				</tr>
			</thead>
			<tbody>
				{rows.map(r => (
					<tr key={r.label} className="dark:border-dark-border border-t border-gray-100">
						<td className="py-2 font-mono">{r.label}</td>
						<td className="py-2 text-right font-mono">{fmtVal(metric, r[metric])}</td>
						<td className="py-2">
							<div className="dark:bg-dark-surface h-2 rounded bg-gray-100">
								<div className="h-2 rounded bg-blue-500" style={{ width: `${(r[metric] / total) * 100}%` }} />
							</div>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

export default function Dashboard({ daily, breakdown, staticSummary, pullRequests, insights }: Props) {
	const [range, setRange] = useState<Range>('all');
	const [metric, setMetric] = useState<Metric>('tokens');
	const [view, setView] = useState<View>('overview');

	const filtered = useMemo(() => filterByRange(daily, range), [daily, range]);

	const prCount = useMemo(() => {
		const cutoff = getCutoffDate(range);
		return pullRequests.filter(pr => {
			const d = (pr.mergedAt ?? pr.createdAt).slice(0, 10);
			return !cutoff || d >= cutoff;
		}).length;
	}, [pullRequests, range]);

	const dateRange = useMemo(() => {
		if (filtered.length === 0) return '';
		return fmtDateRange(filtered[0]!.date, filtered[filtered.length - 1]!.date);
	}, [filtered]);

	const stats = useMemo(() => {
		const totalCostUSD = filtered.reduce((s, d) => s + d.costUSD, 0);
		const totalTokens = filtered.reduce((s, d) => s + d.tokens, 0);
		const sessions = filtered.reduce((s, d) => s + d.sessions, 0);
		const messages = filtered.reduce((s, d) => s + d.messages, 0);
		const activeDays = filtered.filter(d => d.messages > 0).length;
		const hourCounts = new Array<number>(24).fill(0);
		for (const d of filtered) for (let h = 0; h < 24; h++) hourCounts[h]! += d.hourCounts[h] ?? 0;
		let peakHour = 0;
		for (let h = 1; h < 24; h++) if (hourCounts[h]! > hourCounts[peakHour]!) peakHour = h;
		const modelMsgs = new Map<string, { ref: { tool: string; provider: string; id: string }; messages: number }>();
		for (const d of filtered) {
			for (const m of d.byModel) {
				const k = `${m.tool}|${m.provider}|${m.id}`;
				const slot = modelMsgs.get(k) ?? {
					ref: { tool: m.tool, provider: m.provider, id: m.id },
					messages: 0,
				};
				slot.messages += m.messages;
				modelMsgs.set(k, slot);
			}
		}
		const favorite = [...modelMsgs.values()].sort((a, b) => b.messages - a.messages)[0];
		const favoriteLabel = favorite ? favorite.ref.id : '—';
		return { totalCostUSD, totalTokens, sessions, messages, activeDays, peakHour, favoriteLabel };
	}, [filtered]);

	const tiles = useMemo(
		() => [
			{ label: 'Total cost', value: fmtUsd.format(stats.totalCostUSD) },
			{ label: 'Total tokens', value: fmtCompactTokens(stats.totalTokens) },
			{ label: 'Sessions', value: fmtInt.format(stats.sessions) },
			{ label: 'Messages', value: fmtInt.format(stats.messages) },
			{ label: 'PRs shipped', value: fmtInt.format(prCount) },
			{ label: 'Active days', value: fmtInt.format(stats.activeDays) },
			{ label: 'Current streak', value: `${staticSummary.currentStreakDays}d` },
			{ label: 'Longest streak', value: `${staticSummary.longestStreakDays}d` },
			{ label: 'Peak hour', value: fmtHour(stats.peakHour) },
			{ label: 'Favorite model', value: stats.favoriteLabel },
		],
		[stats, staticSummary, prCount],
	);

	const breakdownRows = useMemo(() => {
		switch (view) {
			case 'tool':
				return breakdown.byTool.map(r => ({ label: r.label, tokens: r.tokens, costUSD: r.costUSD }));
			case 'provider':
				return breakdown.byProvider.map(r => ({ label: r.label, tokens: r.tokens, costUSD: r.costUSD }));
			case 'model':
				return breakdown.byModel.map(r => ({
					label: `${r.label} (${r.tool})`,
					tokens: r.tokens,
					costUSD: r.costUSD,
				}));
			case 'project':
				return breakdown.byProject.map(r => ({ label: r.label, tokens: r.tokens, costUSD: r.costUSD }));
			default:
				return [];
		}
	}, [view, breakdown]);

	const pillCls = (active: boolean) =>
		`rounded-md px-3 py-1 text-sm transition ${
			active
				? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
				: 'border border-gray-300 hover:bg-gray-50 dark:border-dark-border dark:hover:bg-dark-surface'
		}`;

	return (
		<div className="space-y-6">
			<div className="text-sm text-gray-500 dark:text-gray-400">
				{dateRange && <span className="font-medium text-gray-700 dark:text-gray-300">{dateRange}</span>}
			</div>

			<StatsGrid tiles={tiles} />

			{/* Metric toggle governs the trends below AND the heatmap/breakdown. */}
			<div className="flex justify-end gap-2">
				<button className={pillCls(metric === 'tokens')} onClick={() => setMetric('tokens')}>
					Tokens
				</button>
				<button className={pillCls(metric === 'costUSD')} onClick={() => setMetric('costUSD')}>
					Cost
				</button>
			</div>

			{insights && <Insights insights={insights} metric={metric} />}

			<section className="space-y-3">
				<h2 className="font-serif text-2xl font-semibold">Daily activity</h2>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex gap-2">
						<button className={pillCls(range === 'all')} onClick={() => setRange('all')}>
							All
						</button>
						<button className={pillCls(range === '30d')} onClick={() => setRange('30d')}>
							30d
						</button>
						<button className={pillCls(range === '7d')} onClick={() => setRange('7d')}>
							7d
						</button>
					</div>
					<div className="flex gap-2">
						<button className={pillCls(view === 'overview')} onClick={() => setView('overview')}>
							Overview
						</button>
						<button className={pillCls(view === 'tool')} onClick={() => setView('tool')}>
							By Tool
						</button>
						<button className={pillCls(view === 'provider')} onClick={() => setView('provider')}>
							By Provider
						</button>
						<button className={pillCls(view === 'model')} onClick={() => setView('model')}>
							By Model
						</button>
						<button className={pillCls(view === 'project')} onClick={() => setView('project')}>
							Projects
						</button>
					</div>
				</div>

				<Heatmap daily={filtered} metric={metric} />

				{view !== 'overview' && (
					<div className="dark:border-dark-border rounded-lg border border-gray-200 p-4">
						<BreakdownTable rows={breakdownRows} metric={metric} />
					</div>
				)}
			</section>
		</div>
	);
}
