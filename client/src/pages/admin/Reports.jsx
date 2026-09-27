import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { TrendingUp, FileDown } from 'lucide-react';
import { getMonthlyStatistics, getAllMembersStatistics, exportMembersCsv } from '../../services/statisticsService';
import { downloadBlob } from '../../utils/download';
import Loader from '../../components/common/Loader';
import CollectionBarChart from '../../components/charts/CollectionBarChart';
import PaidDuePieChart from '../../components/charts/PaidDuePieChart';
import MemberTrendModal from '../../components/modals/MemberTrendModal';
import { formatCurrency } from '../../utils/formatters';

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1];

export default function Reports() {
  const [year, setYear] = useState(currentYear);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [memberStats, setMemberStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendMemberId, setTrendMemberId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [monthlyRes, membersRes] = await Promise.all([
          getMonthlyStatistics(year),
          getAllMembersStatistics(),
        ]);
        setMonthlyStats(monthlyRes.data.data);
        setMemberStats(membersRes.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not load reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year]);

  const handleExport = async () => {
    try {
      const res = await exportMembersCsv();
      downloadBlob(res.data, 'member-statistics.csv');
    } catch (err) {
      toast.error('Could not export statistics');
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">Reports</h1>
          <p className="mt-1 text-sm text-ink/50">Statistics across the club</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading || !monthlyStats ? (
        <Loader label="Loading reports…" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="rounded-lg border border-line bg-white p-5 lg:col-span-2">
              <h2 className="font-serif text-lg text-ink">Monthly Statistics</h2>
              <p className="text-xs text-ink/40">{year}</p>
              <div className="mt-2">
                <CollectionBarChart months={monthlyStats.months} />
              </div>
            </div>

            <div className="rounded-lg border border-line bg-white p-5">
              <h2 className="font-serif text-lg text-ink">Paid vs Due</h2>
              <p className="text-xs text-ink/40">Across {year}</p>
              <div className="mt-2">
                <PaidDuePieChart paid={monthlyStats.paidVsDue.paid} due={monthlyStats.paidVsDue.due} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-serif text-lg text-ink">Member-wise Statistics</h2>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink/70 transition hover:bg-ink/5"
              >
                <FileDown size={14} />
                Export CSV
              </button>
            </div>
            {memberStats.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink/40">No members yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink/40">
                      <th className="px-5 py-3 font-medium">Member</th>
                      <th className="px-5 py-3 font-medium">Total Paid</th>
                      <th className="px-5 py-3 font-medium">Total Due</th>
                      <th className="px-5 py-3 font-medium">Paid Months</th>
                      <th className="px-5 py-3 font-medium">Due Months</th>
                      <th className="px-5 py-3 font-medium text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberStats.map((m) => (
                      <tr key={m.member_id} className="border-b border-line last:border-0">
                        <td className="px-5 py-3 text-ink">{m.name}</td>
                        <td className="px-5 py-3 text-emerald-700">{formatCurrency(m.totalPaid)}</td>
                        <td className="px-5 py-3 text-rose-700">{formatCurrency(m.totalDue)}</td>
                        <td className="px-5 py-3 text-ink/70">{m.paidMonths}</td>
                        <td className="px-5 py-3 text-ink/70">{m.dueMonths}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => setTrendMemberId(m.member_id)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-ink/70 transition hover:bg-ink/5"
                          >
                            <TrendingUp size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {trendMemberId && <MemberTrendModal memberId={trendMemberId} onClose={() => setTrendMemberId(null)} />}
    </div>
  );
}
