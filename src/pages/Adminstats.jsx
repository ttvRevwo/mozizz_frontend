import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { authFetch } from '../utils/auth';
import '../Styles/AdminStats.css';

const GOLD   = '#E0AA3E';
const GOLD2  = '#c79c0f';
const RED    = '#d11922';
const TEAL   = '#00b4d8';
const GREEN  = '#52b788';
const DIM    = '#444';

const HUNGARIAN_MONTHS = [
    '', 'Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún',
    'Júl', 'Aug', 'Sze', 'Okt', 'Nov', 'Dec'
];

const StatCard = ({ label, value, sub, accent, delay = 0 }) => (
    <div className="astat-card" style={{ '--accent': accent, animationDelay: `${delay}ms` }}>
        <span className="astat-label">{label}</span>
        <span className="astat-value">{value}</span>
        {sub && <span className="astat-sub">{sub}</span>}
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="astat-tooltip">
            {label && <p className="tt-label">{label}</p>}
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || GOLD }}>
                    {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString('hu-HU') : p.value}</strong>
                    {p.name === 'Bevétel' ? ' Ft' : ''}
                </p>
            ))}
        </div>
    );
};

const OccupancyRow = ({ item, index }) => {
    const film        = item.film        ?? item.Film        ?? '–';
    const idopont     = item.idopont     ?? item.Idopont     ?? '–';
    const telitettseg = item.telitettseg ?? item.Telitettseg ?? '0%';
    const eladott     = item.eladottJegyek ?? item.EladottJegyek ?? 0;
    const pct = parseFloat(telitettseg) || 0;
    const color = pct >= 80 ? RED : pct >= 50 ? GOLD : TEAL;
    return (
        <div className="astat-occ-row" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="astat-occ-info">
                <span className="astat-occ-film">{film}</span>
                <span className="astat-occ-time">{idopont}</span>
            </div>
            <div className="astat-occ-bar-wrap">
                <div className="astat-occ-bar-track">
                    <div className="astat-occ-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                </div>
                <span className="astat-occ-pct" style={{ color }}>{telitettseg}</span>
            </div>
            <span className="astat-occ-tickets">{eladott} jegy</span>
        </div>
    );
};

const parseDateStr = (str) => {
    if (!str) return '';
    const m = String(str).match(/(\d{4})[.\s]+(\d{1,2})[.\s]+(\d{1,2})/);
    if (m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
    const d = new Date(str);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return '';
};

const DailyTab = ({ daily, occupancy }) => {
    const [occTab, setOccTab] = useState('aktiv');
    const activeList  = occupancy.aktivVetitesek  ?? occupancy.AktivVetitesek  ?? [];
    const archiveList = occupancy.archivVetitesek ?? occupancy.ArchivVetitesek ?? [];

    return (
        <>
            <section className="astat-section">
                <h3 className="astat-section-title">Mai nap – {daily?.Datum ?? '–'}</h3>
                <div className="astat-cards">
                    <StatCard label="Bevétel"        value={daily?.MaiBevetel      ?? '0 Ft'} accent={GOLD}  delay={0}   />
                    <StatCard label="Eladott jegyek" value={daily?.EladottJegyek   ?? '0 db'} accent={TEAL}  delay={80}  />
                    <StatCard label="Foglalások"     value={daily?.FoglalasokSzama ?? 0}      accent={GREEN} delay={160} />
                </div>
            </section>

            <section className="astat-section">
                <div className="astat-occ-header">
                    <h3 className="astat-section-title" style={{ margin: 0 }}>Vetítés telítettség</h3>
                    <div className="astat-occ-tabs">
                        <button className={`astat-occ-tab ${occTab === 'aktiv' ? 'active' : ''}`} onClick={() => setOccTab('aktiv')}>
                            Aktív ({activeList.length})
                        </button>
                        <button className={`astat-occ-tab ${occTab === 'archiv' ? 'active' : ''}`} onClick={() => setOccTab('archiv')}>
                            Archív ({archiveList.length})
                        </button>
                    </div>
                </div>
                <div className="astat-occ-list">
                    {(occTab === 'aktiv' ? activeList : archiveList).length === 0 ? (
                        <p className="astat-empty">Nincs adat.</p>
                    ) : (
                        (occTab === 'aktiv' ? activeList : archiveList).map((item, i) => (
                            <OccupancyRow key={i} item={item} index={i} />
                        ))
                    )}
                </div>
            </section>
        </>
    );
};

const RevenueTab = ({ mode }) => {
    const [data,    setData]    = useState([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoint = mode === 'monthly'
                    ? 'http://localhost:5083/api/Admin/MonthlyRevenue'
                    : 'http://localhost:5083/api/Admin/YearlyRevenue';
                const res = await authFetch(endpoint);
                if (!res.ok) throw new Error('Nem sikerült betölteni az adatokat.');
                const json = await res.json();
                setData(Array.isArray(json) ? json.reverse() : []);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [mode]);

    const chartData = data.map(d => ({
        label: mode === 'monthly'
            ? `${HUNGARIAN_MONTHS[d.honap ?? d.Honap]} ${String(d.ev ?? d.Ev).slice(2)}`
            : String(d.ev ?? d.Ev),
        Bevétel:    Number(d.bevetel          ?? d.Bevetel)          || 0,
        Jegyek:     Number(d.eladottJegyek    ?? d.EladottJegyek)    || 0,
        Foglalások: Number(d.foglalasokSzama  ?? d.FoglalasokSzama)  || 0,
    }));

    const totalRevenue = chartData.reduce((s, d) => s + d['Bevétel'], 0);
    const totalTickets = chartData.reduce((s, d) => s + d.Jegyek, 0);

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>
            <div className="astat-spinner" style={{ margin: '0 auto 12px' }} />
            Betöltés...
        </div>
    );
    if (error) return <p className="astat-empty" style={{ color: '#e05c5c' }}>{error}</p>;
    if (!chartData.length) return <p className="astat-empty">Nincs adat.</p>;

    return (
        <section className="astat-section">
            <h3 className="astat-section-title">
                {mode === 'monthly' ? 'Havi bevétel riport' : 'Évi bevétel riport'}
            </h3>

            <div className="astat-cards" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <StatCard
                    label={mode === 'monthly' ? 'Összes bevétel (12 hó)' : 'Összes bevétel'}
                    value={totalRevenue.toLocaleString('hu-HU') + ' Ft'}
                    accent={GOLD}
                />
                <StatCard
                    label={mode === 'monthly' ? 'Eladott jegyek (12 hó)' : 'Eladott jegyek'}
                    value={totalTickets.toLocaleString('hu-HU') + ' db'}
                    accent={TEAL}
                />
            </div>

            <div className="astat-chart-box">
                <p className="astat-chart-label">Bevétel (Ft)</p>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                        <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                            tick={{ fill: '#555', fontSize: 10 }}
                            axisLine={false} tickLine={false}
                            tickFormatter={v => v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(224,170,62,0.05)' }} />
                        <Bar dataKey="Bevétel" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, i) => (
                                <Cell key={i} fill={i === chartData.length - 1 ? GOLD : GOLD2} opacity={0.65 + (i / chartData.length) * 0.35} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="astat-chart-box">
                <p className="astat-chart-label">Eladott jegyek & Foglalások (db)</p>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                        <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="Jegyek"     stroke={TEAL}  strokeWidth={2} dot={{ fill: TEAL,  r: 3 }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="Foglalások" stroke={GREEN} strokeWidth={2} dot={{ fill: GREEN, r: 3 }} activeDot={{ r: 5 }} />
                        <Legend formatter={(val) => <span style={{ color: '#aaa', fontSize: '0.75rem' }}>{val}</span>} iconType="circle" iconSize={8} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="astat-chart-box">
                <p className="astat-chart-label">Részletes bontás</p>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #222' }}>
                                <th style={{ textAlign: 'left',  padding: '6px 8px', color: '#555', fontWeight: 600 }}>{mode === 'monthly' ? 'Hónap' : 'Év'}</th>
                                <th style={{ textAlign: 'right', padding: '6px 8px', color: '#555', fontWeight: 600 }}>Bevétel</th>
                                <th style={{ textAlign: 'right', padding: '6px 8px', color: '#555', fontWeight: 600 }}>Jegyek</th>
                                <th style={{ textAlign: 'right', padding: '6px 8px', color: '#555', fontWeight: 600 }}>Foglalások</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...chartData].reverse().map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #1a1a1a', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                                    <td style={{ padding: '7px 8px', color: '#ccc', fontFamily: 'Courier New, monospace' }}>{row.label}</td>
                                    <td style={{ padding: '7px 8px', color: GOLD,  fontWeight: 700, textAlign: 'right', fontFamily: 'Courier New, monospace' }}>{row['Bevétel'].toLocaleString('hu-HU')} Ft</td>
                                    <td style={{ padding: '7px 8px', color: TEAL,  textAlign: 'right', fontFamily: 'Courier New, monospace' }}>{row.Jegyek.toLocaleString('hu-HU')}</td>
                                    <td style={{ padding: '7px 8px', color: GREEN, textAlign: 'right', fontFamily: 'Courier New, monospace' }}>{row.Foglalások.toLocaleString('hu-HU')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

const TopMoviesTab = ({ topMovies }) => {
    const PIE_COLORS = [GOLD, RED, TEAL];

    const barData = topMovies.map(m => ({
        name: (m.filmCim ?? m.FilmCim ?? '').length > 18
            ? (m.filmCim ?? m.FilmCim ?? '').slice(0, 16) + '…'
            : (m.filmCim ?? m.FilmCim ?? ''),
        Jegyek:  m.jegyekSzama ?? m.JegyekSzama ?? 0,
        Bevétel: Number(m.bevetel ?? m.Bevetel) || 0,
    }));

    const pieData = topMovies.map(m => ({
        name:  m.filmCim ?? m.FilmCim,
        value: m.jegyekSzama ?? m.JegyekSzama ?? 0,
    }));

    if (!topMovies.length) return <p className="astat-empty">Nincs adat.</p>;

    return (
        <section className="astat-section">
            <h3 className="astat-section-title">Top 3 film</h3>
            <div className="astat-charts-row">
                <div className="astat-chart-box">
                    <p className="astat-chart-label">Eladott jegyek</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                            <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(224,170,62,0.06)' }} />
                            <Bar dataKey="Jegyek" radius={[4, 4, 0, 0]}>
                                {barData.map((_, i) => (
                                    <Cell key={i} fill={i === 0 ? GOLD : i === 1 ? GOLD2 : DIM} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="astat-chart-box">
                    <p className="astat-chart-label">Megoszlás</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                            <Pie data={pieData} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                formatter={(val) => <span style={{ color: '#aaa', fontSize: '0.75rem' }}>{val}</span>}
                                iconType="circle" iconSize={8}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="astat-chart-box astat-revenue-list">
                    <p className="astat-chart-label">Bevétel</p>
                    {topMovies.map((m, i) => (
                        <div key={i} className="astat-rev-row">
                            <span className="astat-rev-rank" style={{ color: PIE_COLORS[i] }}>#{i + 1}</span>
                            <span className="astat-rev-title">{m.filmCim ?? m.FilmCim}</span>
                            <span className="astat-rev-amt">
                                {(Number(m.bevetel ?? m.Bevetel) || 0).toLocaleString('hu-HU')} Ft
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


const REPORT_TABS = [
    { key: 'daily',   label: '📅 Mai nap' },
    { key: 'monthly', label: '📆 Havi riport' },
    { key: 'yearly',  label: '📈 Évi riport' },
    { key: 'top',     label: '🏆 Top filmek' },
];

const AdminStats = () => {
    const [activeTab, setActiveTab] = useState('daily');
    const [daily,     setDaily]     = useState(null);
    const [topMovies, setTopMovies] = useState([]);
    const [occupancy, setOccupancy] = useState({ aktivVetitesek: [], archivVetitesek: [] });
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [tRes, oRes] = await Promise.all([
                    authFetch('http://localhost:5083/api/Admin/TopMovies'),
                    authFetch('http://localhost:5083/api/Admin/ShowtimeOccupancy'),
                ]);

                const occData = oRes.ok
                    ? await oRes.json()
                    : { aktivVetitesek: [], archivVetitesek: [] };

                if (oRes.ok) setOccupancy(occData);
                if (tRes.ok) setTopMovies(await tRes.json());

                const todayISO = new Date().toISOString().slice(0, 10);
                const allShowtimes = [
                    ...(occData.aktivVetitesek  ?? occData.AktivVetitesek  ?? []),
                    ...(occData.archivVetitesek ?? occData.ArchivVetitesek ?? []),
                ];
                const todayShowtimes = allShowtimes.filter(s => {
                    const idopont = s.idopont ?? s.Idopont ?? '';
                    return parseDateStr(String(idopont)) === todayISO;
                });
                const todayTickets = todayShowtimes.reduce(
                    (sum, s) => sum + (s.eladottJegyek ?? s.EladottJegyek ?? 0), 0
                );
                setDaily({
                    Datum:           new Date().toLocaleDateString('hu-HU'),
                    MaiBevetel:      (todayTickets * 2500).toLocaleString('hu-HU') + ' Ft',
                    EladottJegyek:   todayTickets + ' db',
                    FoglalasokSzama: todayShowtimes.length,
                });
            } catch (e) {
                console.error('Stats hiba:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div className="astat-loading">
            <div className="astat-spinner" />
            <p>Statisztikák betöltése...</p>
        </div>
    );

    return (
        <div className="astat-root">
            <div className="astat-report-switcher">
                {REPORT_TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`astat-report-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'daily'   && <DailyTab     daily={daily} occupancy={occupancy} />}
            {activeTab === 'top'     && <TopMoviesTab  topMovies={topMovies} />}
            {activeTab === 'monthly' && <RevenueTab    mode="monthly" />}
            {activeTab === 'yearly'  && <RevenueTab    mode="yearly" />}
        </div>
    );
};

export default AdminStats;