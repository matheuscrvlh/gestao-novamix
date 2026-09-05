import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import type { EvolucaoRedeRow } from '../types/gestao'
import { formatCurrency, formatPercent } from '../lib/format'
import { formatMes } from '../lib/date'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

type EvolucaoChartProps = {
    rows: EvolucaoRedeRow[]
}

export default function EvolucaoChart({ rows }: EvolucaoChartProps) {
    return (
        <Chart
            type='bar'
            data={{
                labels: rows.map((r) => formatMes(r.MES)),
                datasets: [
                    {
                        type: 'bar' as const,
                        label: 'Faturamento',
                        data: rows.map((r) => r.FATURAMENTO),
                        backgroundColor: '#EA580C',
                        borderRadius: 4,
                        order: 2,
                        yAxisID: 'y',
                    },
                    {
                        type: 'line' as const,
                        label: 'Margem %',
                        data: rows.map((r) => r.MARGEM * 100),
                        borderColor: '#262019',
                        backgroundColor: '#262019',
                        tension: 0.35,
                        pointRadius: 4,
                        pointBackgroundColor: '#262019',
                        order: 1,
                        yAxisID: 'y1',
                    },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top', align: 'end', labels: { boxWidth: 10, usePointStyle: true } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) =>
                                ctx.dataset.yAxisID === 'y1'
                                    ? `${ctx.dataset.label}: ${formatPercent((ctx.raw as number) / 100)}`
                                    : `${ctx.dataset.label}: ${formatCurrency(ctx.raw as number)}`,
                        },
                    },
                },
                scales: {
                    y: {
                        position: 'left',
                        beginAtZero: true,
                        grid: { color: '#E1D5BE' },
                        ticks: { callback: (v) => 'R$ ' + Math.round(Number(v) / 1000) + 'k' },
                    },
                    y1: {
                        position: 'right',
                        grid: { display: false },
                        ticks: { callback: (v) => v + '%' },
                    },
                    x: { grid: { display: false } },
                },
            }}
        />
    )
}
