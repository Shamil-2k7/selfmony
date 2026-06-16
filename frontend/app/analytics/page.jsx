"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "../../utils/api";
import "./analytics.css";

export default function Analytics() {
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Filter checkbox states
    const [daily, setDaily] = useState(false);
    const [weekly, setWeekly] = useState(false);
    const [monthly, setMonthly] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchData();
    }, [router]);

    async function fetchData() {
        try {
            setLoading(true);
            const data = await apiService.getTransactions();
            setTransactions(data);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load transactions.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteAll() {
        if (!confirm("Are you sure you want to delete ALL transactions and todos? This action cannot be undone.")) {
            return;
        }

        try {
            setLoading(true);
            await apiService.clearAllData();
            setTransactions([]);
            alert("All data cleared successfully!");
        } catch (err) {
            console.error("Error deleting all data:", err);
            setError("Failed to clear data.");
        } finally {
            setLoading(false);
        }
    }

    // Filter transaction list
    // Only display type === 'expense'
    const allExpenses = transactions.filter(t => t.type === 'expense');

    // Filter by categories if any checkbox is active
    const hasActiveFilter = daily || weekly || monthly;
    const filteredExpenses = hasActiveFilter 
        ? allExpenses.filter(t => {
            if (daily && (t.category === 'daily' || t.category === 'general')) return true;
            if (weekly && t.category === 'weekly') return true;
            if (monthly && t.category === 'monthly') return true;
            return false;
          })
        : allExpenses;

    // Calculate sum of filtered expenses
    const totalExpensesAmount = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Group filtered expenses for rendering in the graph (latest 6 transactions)
    const graphData = filteredExpenses.slice(0, 7).reverse();

    // Custom SVG Bar Chart Configuration
    const svgWidth = 500;
    const svgHeight = 200;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    const maxVal = graphData.length > 0 
        ? Math.max(...graphData.map(d => d.amount)) 
        : 100;

    // Rounded max value for neat graph labels
    const displayMaxVal = Math.ceil(maxVal / 10) * 10 || 100;

    return (
        <>
            <div className="Main">
                <div className="monthlyexpeneswrapper">
                    <div className="filterwrapper">
                        <div className="filter">
                            <span>Daily</span>
                            <input 
                                type="checkbox" 
                                name="Daly" 
                                id="Daly" 
                                checked={daily}
                                onChange={(e) => setDaily(e.target.checked)}
                            />
                        </div>
                        <div className="filter">
                            <span>Weekly</span>
                            <input 
                                type="checkbox" 
                                name="Weekly" 
                                id="Weekly" 
                                checked={weekly}
                                onChange={(e) => setWeekly(e.target.checked)}
                            />
                        </div>
                        <div className="filter">
                            <span>Monthly</span>
                            <input 
                                type="checkbox" 
                                name="Monthly" 
                                id="Monthly" 
                                checked={monthly}
                                onChange={(e) => setMonthly(e.target.checked)}
                            />
                        </div>
                    </div>
                    <div className="ContentWrapper">
                        <h3>Total Expenses</h3>
                        <h1 id="Amout">INR {loading ? "..." : totalExpensesAmount.toFixed(2)}</h1>
                    </div>
                </div>

                <div className="garph">
                    {loading ? (
                        <p style={{ color: "#888" }}>Loading charts...</p>
                    ) : error ? (
                        <p style={{ color: "#ff4d4d" }}>{error}</p>
                    ) : graphData.length === 0 ? (
                        <p style={{ color: "#888", fontSize: "14px", fontWeight: "normal" }}>No expense data available to display.</p>
                    ) : (
                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%">
                            {/* Definitions for visual gradient */}
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#555555" stopOpacity={0.2} />
                                </linearGradient>
                            </defs>

                            {/* Horizontal grid lines */}
                            <line 
                                x1={paddingLeft} 
                                y1={paddingTop} 
                                x2={svgWidth - paddingRight} 
                                y2={paddingTop} 
                                stroke="#222" 
                                strokeWidth={1} 
                                strokeDasharray="4 4"
                            />
                            <line 
                                x1={paddingLeft} 
                                y1={paddingTop + plotHeight / 2} 
                                x2={svgWidth - paddingRight} 
                                y2={paddingTop + plotHeight / 2} 
                                stroke="#222" 
                                strokeWidth={1} 
                                strokeDasharray="4 4"
                            />
                            <line 
                                x1={paddingLeft} 
                                y1={paddingTop + plotHeight} 
                                x2={svgWidth - paddingRight} 
                                y2={paddingTop + plotHeight} 
                                stroke="#444" 
                                strokeWidth={1}
                            />

                            {/* Y Axis Labels */}
                            <text x={paddingLeft - 10} y={paddingTop + 5} fill="#888" fontSize="10" textAnchor="end" fontFamily="monospace">
                                {displayMaxVal}
                            </text>
                            <text x={paddingLeft - 10} y={paddingTop + plotHeight / 2 + 4} fill="#888" fontSize="10" textAnchor="end" fontFamily="monospace">
                                {Math.round(displayMaxVal / 2)}
                            </text>
                            <text x={paddingLeft - 10} y={paddingTop + plotHeight + 3} fill="#888" fontSize="10" textAnchor="end" fontFamily="monospace">
                                0
                            </text>

                            {/* Render bars dynamically */}
                            {graphData.map((d, index) => {
                                const barWidth = (plotWidth / graphData.length) * 0.6;
                                const spacing = (plotWidth / graphData.length);
                                const x = paddingLeft + (index * spacing) + (spacing * 0.2);
                                
                                const barHeight = (d.amount / displayMaxVal) * plotHeight;
                                const y = paddingTop + plotHeight - barHeight;

                                return (
                                    <g key={d._id}>
                                        {/* Bar rect */}
                                        <rect
                                            x={x}
                                            y={y}
                                            width={barWidth}
                                            height={barHeight}
                                            fill="url(#barGradient)"
                                            rx="4"
                                            style={{ transition: "all 0.3s ease" }}
                                        />

                                        {/* Value Label above Bar */}
                                        <text
                                            x={x + barWidth / 2}
                                            y={y - 5}
                                            fill="#fff"
                                            fontSize="9"
                                            textAnchor="middle"
                                            fontFamily="monospace"
                                            fontWeight="normal"
                                        >
                                            {d.amount}
                                        </text>

                                        {/* X Axis Label below Bar */}
                                        <text
                                            x={x + barWidth / 2}
                                            y={paddingTop + plotHeight + 15}
                                            fill="#aaa"
                                            fontSize="9"
                                            textAnchor="middle"
                                            style={{ textOverflow: "ellipsis", overflow: "hidden" }}
                                        >
                                            {d.name.length > 8 ? `${d.name.slice(0, 7)}...` : d.name}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    )}
                </div>

                <div className="Deletdata">
                    <button className="delet" onClick={handleDeleteAll} disabled={loading}>
                        {loading ? "Clearing..." : "Delete Data"}
                    </button>
                </div>
            </div>
        </>
    );
}