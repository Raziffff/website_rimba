"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChartLine,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getKeuangan, createKeuangan } from "@/app/actions/keuangan";

interface TransaksiItem {
  id: string;
  type: "PEMASUKAN" | "PENGELUARAN";
  category: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
}

interface KeuanganSummary {
  transactions: TransaksiItem[];
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoKas: number;
}

const formatRp = (n: number) =>
  `Rp ${n.toLocaleString("id-ID")}`;

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// Format singkat untuk sumbu Y grafik agar tidak melebar
const formatRpShort = (n: number) => {
  if (Math.abs(n) >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`;
  if (Math.abs(n) >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} jt`;
  if (Math.abs(n) >= 1_000) return `Rp ${Math.round(n / 1_000)} rb`;
  return `Rp ${n}`;
};

export default function AdminKeuanganPage() {
  const [data, setData] = useState<KeuanganSummary>({
    transactions: [],
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldoKas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "PEMASUKAN" | "PENGELUARAN">("ALL");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [formData, setFormData] = useState({
    type: "PEMASUKAN" as "PEMASUKAN" | "PENGELUARAN",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getKeuangan();
      if (res.success && "data" in res && res.data) {
        setData(res.data as KeuanganSummary);
      } else {
        setError("Gagal memuat data keuangan dari database.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Masukkan jumlah yang valid.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await createKeuangan({
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        date: formData.date,
      });
      if (res.success) {
        await loadData();
        setFormData({
          type: "PEMASUKAN",
          category: "",
          amount: "",
          description: "",
          date: new Date().toISOString().slice(0, 10),
        });
      } else {
        alert("Gagal menyimpan transaksi.");
      }
    } catch {
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Daftar tahun yang bisa dipilih (dari data transaksi + tahun berjalan)
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    data.transactions.forEach((t) => years.add(new Date(t.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [data.transactions]);

  // Set default ke tahun terbaru yang memiliki data
  useEffect(() => {
    if (data.transactions.length === 0) return;
    const yearsWithData = Array.from(
      new Set(data.transactions.map((t) => new Date(t.date).getFullYear()))
    ).sort((a, b) => b - a);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedYear((prev) => (yearsWithData.includes(prev) ? prev : yearsWithData[0]));
  }, [data.transactions]);

  // Transaksi pada tahun terpilih
  const yearTransactions = useMemo(
    () => data.transactions.filter((t) => new Date(t.date).getFullYear() === selectedYear),
    [data.transactions, selectedYear]
  );

  // Total tahun terpilih (untuk kartu ringkasan)
  const yearTotals = useMemo(() => {
    const pemasukan = yearTransactions
      .filter((t) => t.type === "PEMASUKAN")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const pengeluaran = yearTransactions
      .filter((t) => t.type === "PENGELUARAN")
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran };
  }, [yearTransactions]);

  // Data agregat per bulan untuk grafik
  const chartData = useMemo(() => {
    const months = MONTH_LABELS.map((label) => ({
      bulan: label,
      pemasukan: 0,
      pengeluaran: 0,
    }));
    yearTransactions.forEach((t) => {
      const monthIndex = new Date(t.date).getMonth();
      if (t.type === "PEMASUKAN") months[monthIndex].pemasukan += t.amount;
      else months[monthIndex].pengeluaran += t.amount;
    });
    return months;
  }, [yearTransactions]);

  const filtered = useMemo(
    () => (filterType === "ALL" ? yearTransactions : yearTransactions.filter((t) => t.type === filterType)),
    [yearTransactions, filterType]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-3xl border border-border/80 shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-text">Laporan Keuangan</h2>
          <p className="text-xs sm:text-sm text-text/70 mt-0.5">
            Pencatatan pemasukan, pengeluaran, dan saldo kas organisasi.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-border/60 text-text/70 hover:text-primary hover:border-primary/40 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-linear-to-br from-primary to-primary-dark text-white shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold opacity-80">Saldo Kas</span>
          </div>
          <div className="text-2xl font-black">
            {isLoading ? "..." : formatRp(yearTotals.saldo)}
          </div>
          <p className="text-xs opacity-70 mt-1">Saldo tahun {selectedYear}</p>
        </div>
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold">Total Pemasukan</span>
          </div>
          <div className="text-2xl font-black">
            {isLoading ? "..." : formatRp(yearTotals.pemasukan)}
          </div>
          <p className="text-xs opacity-70 mt-1">Total pemasukan tahun {selectedYear}</p>
        </div>
        <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs font-bold">Total Pengeluaran</span>
          </div>
          <div className="text-2xl font-black">
            {isLoading ? "..." : formatRp(yearTotals.pengeluaran)}
          </div>
          <p className="text-xs opacity-70 mt-1">Total pengeluaran tahun {selectedYear}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grafik Pemasukan & Pengeluaran */}
      <div className="bg-surface border border-border/80 rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-text flex items-center gap-2">
              <ChartLine className="w-5 h-5 text-primary" />
              <span>Grafik Pemasukan &amp; Pengeluaran</span>
            </h3>
            <p className="text-xs text-text/60 mt-0.5">
              Rekap bulanan tahun {selectedYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="filter-tahun" className="text-xs font-bold text-text/70">
              Tahun
            </label>
            <select
              id="filter-tahun"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-text cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-text/60">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm font-semibold">Memuat grafik...</span>
          </div>
        ) : yearTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-text/50">
            <span className="text-4xl">📊</span>
            <p className="text-sm font-semibold">
              Belum ada transaksi pada tahun {selectedYear}.
            </p>
          </div>
        ) : (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="bulan"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                  tickFormatter={(value) => formatRpShort(Number(value))}
                />
                <Tooltip
                  formatter={(value) => formatRp(Number(value))}
                  labelFormatter={(label) => `Bulan ${label} ${selectedYear}`}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
                <Line
                  type="monotone"
                  dataKey="pemasukan"
                  name="Pemasukan"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transaction List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {(["ALL", "PEMASUKAN", "PENGELUARAN"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  filterType === f
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-surface border-border/60 text-text/70 hover:border-primary/40"
                }`}
              >
                {f === "ALL" ? "Semua" : f === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran"}
              </button>
            ))}
          </div>

          <div className="bg-surface border border-border/80 rounded-3xl overflow-hidden shadow-2xs">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-text/60">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-sm font-semibold">Memuat data keuangan...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-text/50">
                <span className="text-4xl">💰</span>
                <p className="text-sm font-semibold">Belum ada data transaksi.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-background border-b border-border/80 text-text/60 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Tanggal</th>
                      <th className="py-4 px-6">Kategori & Keterangan</th>
                      <th className="py-4 px-6">Tipe</th>
                      <th className="py-4 px-6 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-background/60 transition-colors">
                        <td className="py-4 px-6 text-text/70 whitespace-nowrap">
                          {new Date(item.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <div className="font-bold text-text">{item.category}</div>
                          <div className="text-text/60 mt-0.5 line-clamp-1">{item.description}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                              item.type === "PEMASUKAN"
                                ? "text-emerald-700 bg-emerald-100 border-emerald-300"
                                : "text-red-700 bg-red-100 border-red-300"
                            }`}
                          >
                            {item.type === "PEMASUKAN" ? "↑ Pemasukan" : "↓ Pengeluaran"}
                          </span>
                        </td>
                        <td
                          className={`py-4 px-6 text-right font-black text-sm ${
                            item.type === "PEMASUKAN" ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {item.type === "PEMASUKAN" ? "+" : "-"}
                          {formatRp(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="p-4 bg-background border-t border-border/60 text-xs font-semibold text-text/70">
              {filtered.length} transaksi tahun {selectedYear}
            </div>
          </div>
        </div>

        {/* Add Transaction Form */}
        <div className="lg:col-span-4 bg-surface border border-border/80 rounded-3xl p-6 shadow-2xs h-fit">
          <h3 className="text-base font-bold text-text mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Catat Transaksi</span>
          </h3>
          <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-text mb-1">Tipe Transaksi *</label>
              <div className="grid grid-cols-2 gap-2">
                {(["PEMASUKAN", "PENGELUARAN"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      formData.type === t
                        ? t === "PEMASUKAN"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-red-600 text-white border-red-600"
                        : "border-border/60 text-text/70 hover:bg-background"
                    }`}
                  >
                    {t === "PEMASUKAN" ? "↑ Pemasukan" : "↓ Pengeluaran"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-bold text-text mb-1">Kategori *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Infaq Jamaah, Logistik"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-text"
              />
            </div>
            <div>
              <label className="block font-bold text-text mb-1">Jumlah (Rp) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="Contoh: 500000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-text"
              />
              {formData.amount && Number(formData.amount) > 0 && (
                <p className="text-[11px] text-primary font-semibold mt-1">
                  = {formatRp(Number(formData.amount))}
                </p>
              )}
            </div>
            <div>
              <label className="block font-bold text-text mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-text"
              />
            </div>
            <div>
              <label className="block font-bold text-text mb-1">Keterangan</label>
              <textarea
                rows={2}
                placeholder="Deskripsi singkat transaksi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-background border border-border focus:outline-none focus:border-primary text-text resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isSaving ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
