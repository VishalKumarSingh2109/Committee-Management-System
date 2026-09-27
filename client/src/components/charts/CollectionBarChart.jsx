import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { monthShort, formatCurrency } from '../../utils/formatters';

export default function CollectionBarChart({ months }) {
  const data = months.map((m) => ({ name: monthShort(m.month), collected: m.collected }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DAD2BE" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#1c254199' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#1c254199' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={(v) => formatCurrency(v)} cursor={{ fill: '#f7f4ec' }} />
        <Bar dataKey="collected" fill="#b8862e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
