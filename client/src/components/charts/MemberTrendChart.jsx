import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { monthShort, formatCurrency } from '../../utils/formatters';

export default function MemberTrendChart({ trend }) {
  const data = trend.map((t) => ({
    name: `${monthShort(t.month)} ${String(t.year).slice(2)}`,
    amount: t.status === 'paid' ? t.amount : 0,
    status: t.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DAD2BE" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#1c254199' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#1c254199' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={(v) => formatCurrency(v)} />
        <Line type="monotone" dataKey="amount" stroke="#b8862e" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
