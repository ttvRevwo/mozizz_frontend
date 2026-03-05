import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { authFetch } from '../utils/auth';
import '../Styles/AdminStats.css';

const GOLD   = '#E0AA3E';
const GOLD2  = '#c79c0f';
const RED    = '#d11922';
const TEAL   = '#00b4d8';
const GREEN  = '#52b788';
const DIM    = '#444';

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
                    {p.name === 'Bevétel' ? ' Ft' : p.name === 'Telítettség' ? '%' : ''}
                </p>
            ))}
        </div>
    );
};

const OccupancyRow = ({ item, index }) => {
    const pct = parseFloat(item.telitettseg) || 0;
    const color = pct >= 80 ? RED : pct >= 50 ? GOLD : TEAL;
    return (
        <div className="astat-occ-row" style={{ animationDelay: `${index * 50}ms` }}>
            <div className="astat-occ-info">
                <span className="astat-occ-film">{item.film}</span>
                <span className="astat-occ-time">{item.idopont}</span>
            </div>
            <div className="astat-occ-bar-wrap">
                <div className="astat-occ-bar-track">
                    <div
                        className="astat-occ-bar-fill"
                        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
                    />
                </div>
                <span className="astat-occ-pct" style={{ color }}>{item.telitettseg}</span>
            </div>
            <span className="astat-occ-tickets">{item.eladottJegyek} jegy</span>
        </div>
    );
};

const AdminStats = () => {
    const [daily,     setDaily]     = useState(null);
    const [topMovies, setTopMovies] = useState([]);
    const [occupancy, setOccupancy] = useState({ aktivVetitesek: [], archivVetitesek: [] });
    const [loading,   setLoading]   = useState(true);
    const [occTab,    setOccTab]    = useState('aktiv');

    useEffect(() => {
        const load = async () => {
            try {
                const [dRes, tRes, oRes] = await Promise.all([
                    authFetch('http://localhost:5083/api/Admin/DailyReport'),
                    authFetch('http://localhost:5083/api/Admin/TopMovies'),
                    authFetch('http://localhost:5083/api/Admin/ShowtimeOccupancy'),
                ]);

                const occData = oRes.ok ? await oRes.json() : { aktivVetitesek: [], archivVetitesek: [] };
                if (oRes.ok) setOccupancy(occData);
                if (tRes.ok) setTopMovies(await tRes.json());
                if (dRes.ok) {
                    const d = await dRes.json();
                    setDaily({
                        Datum: d.datum,
                        MaiBevetel: d.maiBevetel,
                        EladottJegyek: d.eladottJegyek,
                        FoglalasokSzama: d.foglalasokSzama,
                    });
                }

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

    const barData = topMovies.map(m => ({
        name: (m.filmCim || m.FilmCim || '').length > 18 ? (m.filmCim || m.FilmCim || '').slice(0, 16) + '…' : (m.filmCim || m.FilmCim || ''),
        fullName: m.filmCim || m.FilmCim,
        Jegyek: m.jegyekSzama ?? m.JegyekSzama ?? 0,
        Bevétel: Number(m.bevetel ?? m.Bevetel) || 0,
    }));

    const pieData = topMovies.map(m => ({
        name: m.filmCim || m.FilmCim,
        value: m.jegyekSzama ?? m.JegyekSzama ?? 0,
    }));
    const PIE_COLORS = [GOLD, RED, TEAL];

    const activeList  = occupancy.aktivVetitesek  || [];
    const archiveList = occupancy.archivVetitesek || [];

    return (
        <div className="astat-root">

            <section className="astat-section">
                <h3 className="astat-section-title">Mai nap – {daily?.Datum ?? '–'}</h3>
                <div className="astat-cards">
                    <StatCard label="Bevétel"       value={daily?.MaiBevetel    ?? '0 Ft'}  accent={GOLD}  delay={0}   />
                    <StatCard label="Eladott jegyek" value={daily?.EladottJegyek ?? '0 db'}  accent={TEAL}  delay={80}  />
                    <StatCard label="Foglalások"     value={daily?.FoglalasokSzama ?? 0}     accent={GREEN} delay={160} />
                </div>
            </section>

            <section className="astat-section">
                <h3 className="astat-section-title">Top 3 film</h3>
                {!topMovies.length ? (
                    <p className="astat-empty">Nincs adat.</p>
                ) : (
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
                                    <Pie
                                        data={pieData}
                                        cx="50%" cy="45%"
                                        innerRadius={45} outerRadius={70}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
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
                                    <span className="astat-rev-title">{m.filmCim || m.FilmCim}</span>
                                    <span className="astat-rev-amt">{(Number(m.bevetel ?? m.Bevetel) || 0).toLocaleString('hu-HU')} Ft</span>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </section>

            <section className="astat-section">
                <div className="astat-occ-header">
                    <h3 className="astat-section-title" style={{ margin: 0 }}>Vetítés telítettség</h3>
                    <div className="astat-occ-tabs">
                        <button
                            className={`astat-occ-tab ${occTab === 'aktiv' ? 'active' : ''}`}
                            onClick={() => setOccTab('aktiv')}
                        >
                            Aktív ({activeList.length})
                        </button>
                        <button
                            className={`astat-occ-tab ${occTab === 'archiv' ? 'active' : ''}`}
                            onClick={() => setOccTab('archiv')}
                        >
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

        </div>
    );
};

export default AdminStats;