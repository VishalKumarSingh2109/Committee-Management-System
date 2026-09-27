import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { monthShort, formatCurrency } from '../../utils/formatters';

export default function CollectionLineChart({ months }) {
  const data = months.map((m) => ({ name: monthShort(m.month), collected: m.collected }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DAD2BE" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#1c254199' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#1c254199' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={(v) => formatCurrency(v)} />
        <Line type="monotone" dataKey="collected" stroke="#1c2541" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
