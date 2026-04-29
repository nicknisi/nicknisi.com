import { useMemo, useState } from 'react';

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

interface Props {
	daily: DailyEntry[];
	breakdown: Breakdown;
}

type Range = 'all' | '30d' | '7d';
type Metric = 'tokens' | 'costUSD';
type View = 'overview' | 'tool' | 'provider' | 'model' | 'project';

function filterByRange(daily: DailyEntry[], range: Range): DailyEntry[] {
	if (range === 'all') return daily;
	const days = range === '7d' ? 7 : 30;
	const cutoff = new Date();
	cutoff.setUTCDate(cutoff.getUTCDate() - days);
	const cutoffYmd = cutoff.toISOString().slice(0, 10);
	return daily.filter(d => d.date >= cutoffYmd);
}

const fmtInt = new Intl.NumberFormat('en-US');
const fmtUsd = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});
const fmtVal = (m: Metric, n: number) => (m === 'costUSD' ? fmtUsd.format(n) : fmtInt.format(n));

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
			<thead className="text-left text-xs uppercase tracking-wide text-gray-500">
				<tr>
					<th className="py-2">Name</th>
					<th className="py-2 text-right">{metric === 'costUSD' ? 'Cost' : 'Tokens'}</th>
					<th className="w-1/3 py-2">Share</th>
				</tr>
			</thead>
			<tbody>
				{rows.map(r => (
					<tr key={r.label} className="border-t border-gray-100 dark:border-dark-border">
						<td className="py-2 font-mono">{r.label}</td>
						<td className="py-2 text-right font-mono">{fmtVal(metric, r[metric])}</td>
						<td className="py-2">
							<div className="h-2 rounded bg-gray-100 dark:bg-dark-surface">
								<div
									className="h-2 rounded bg-blue-500"
									style={{ width: `${(r[metric] / total) * 100}%` }}
								/>
							</div>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

export default function Dashboard({ daily, breakdown }: Props) {
	const [range, setRange] = useState<Range>('all');
	const [metric, setMetric] = useState<Metric>('tokens');
	const [view, setView] = useState<View>('overview');

	const filtered = useMemo(() => filterByRange(daily, range), [daily, range]);

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
				<div className="flex gap-2">
					<button className={pillCls(metric === 'tokens')} onClick={() => setMetric('tokens')}>
						Tokens
					</button>
					<button className={pillCls(metric === 'costUSD')} onClick={() => setMetric('costUSD')}>
						Cost
					</button>
				</div>
			</div>

			<Heatmap daily={filtered} metric={metric} />

			{view !== 'overview' && (
				<div className="rounded-lg border border-gray-200 p-4 dark:border-dark-border">
					<BreakdownTable rows={breakdownRows} metric={metric} />
				</div>
			)}
		</div>
	);
}
