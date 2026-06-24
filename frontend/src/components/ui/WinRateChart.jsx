import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function WinRateChart({ wins, losses, draws, winRate }) {
  const total = wins + losses + draws;
  const data = [
    { name: '승', value: wins, color: '#4ade80' },
    { name: '패', value: losses, color: '#f87171' },
    { name: '무', value: draws, color: '#d1d5db' },
  ].filter(d => d.value > 0);

  if (total === 0) {
    return (
      <div className="winrate-empty">
        <span>아직 기록이 없어요</span>
      </div>
    );
  }

  return (
    <div className="winrate-chart">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value}경기`, name]}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow)',
              fontSize: '0.8rem',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* 중앙 텍스트 */}
      <div className="winrate-center">
        <span className="winrate-value">{winRate.toFixed(1)}%</span>
        <span className="winrate-label">승률</span>
      </div>
      {/* 범례 */}
      <div className="winrate-legend">
        {data.map(d => (
          <div key={d.name} className="winrate-legend-item">
            <span className="winrate-legend-dot" style={{ background: d.color }} />
            <span>{d.name} {d.value}경기</span>
          </div>
        ))}
      </div>
    </div>
  );
}
