import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = { Paid: '#1c2541', Due: '#b8862e' };

export default function PaidDuePieChart({ paid, due }) {
  const data = [
    { name: 'Paid', value: paid },
    { name: 'Due', value: due },
  ];

  const total = paid + due;
  if (total === 0) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-ink/40">No payment records yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip formatter={(v, name) => [`${v} (${((v / total) * 100).toFixed(0)}%)`, name]} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
