"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "../../utils/api";
import { PiCurrencyInrBold } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
import { RiLogoutBoxRLine, RiPrinterLine } from "react-icons/ri";
import "./settings.css";

export default function SettingsPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Print selections
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i); // [2026, 2025, 2024, ...]

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    async function fetchAllData() {
      try {
        setLoading(true);
        const data = await apiService.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error("Error fetching settings info:", err);
        setError("Failed to fetch reports data.");
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, [router]);

  function handleLogout() {
    apiService.logout();
    router.push("/login");
  }

  // Filter transactions for printing
  const printTransactions = transactions.filter(t => {
    const tDate = new Date(t.date || t.createdAt);
    return tDate.getMonth() === Number(selectedMonth) && tDate.getFullYear() === Number(selectedYear);
  });

  const totalIncome = printTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = printTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="Main">
      <div className="settingsWrapper">
        <div className="header">
          <h2>Settings</h2>
        </div>

        {/* User Card */}
        <div className="userCard">
          <div className="avatar">
            <CgProfile />
          </div>
          <div className="userInfo">
            <h3>{username ? username.toUpperCase() : "Loading..."}</h3>
            <p>Member Since {new Date().getFullYear()}</p>
          </div>
          <button className="logoutBtn" onClick={handleLogout}>
            <RiLogoutBoxRLine /> Logout
          </button>
        </div>

        {/* Print Monthly Statement Card */}
        <div className="actionCard">
          <h3>Print Monthly Statement</h3>
          <p className="cardDesc">Select a month and year to generate a clean, printable PDF document of your transaction records.</p>
          
          <div className="printForm">
            <div className="selectGroup">
              <label>Month</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
            </div>

            <div className="selectGroup">
              <label>Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button 
              className="printBtn" 
              onClick={handlePrint}
              disabled={loading || printTransactions.length === 0}
            >
              <RiPrinterLine /> Print Statement
            </button>
          </div>

          {printTransactions.length === 0 && !loading && (
            <p className="noDataAlert">No transactions found for the selected period.</p>
          )}
        </div>
      </div>

      {/* --- HIDDEN PRINT AREA --- */}
      <div className="print-area">
        <div className="printHeader">
          <h1>SelfMony Report</h1>
          <p className="subtitle">Monthly Financial Statement</p>
        </div>

        <div className="printMetadata">
          <div>
            <strong>Prepared For:</strong> {username ? username.toUpperCase() : "User"}
          </div>
          <div>
            <strong>Statement Period:</strong> {months[selectedMonth]} {selectedYear}
          </div>
          <div>
            <strong>Report Generated:</strong> {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Financial Summary Box */}
        <div className="printSummary">
          <div className="summaryItem">
            <span className="summaryLabel">Total Income</span>
            <span className="summaryValue positive">INR {totalIncome.toFixed(2)}</span>
          </div>
          <div className="summaryItem">
            <span className="summaryLabel">Total Expenses</span>
            <span className="summaryValue negative">INR {totalExpense.toFixed(2)}</span>
          </div>
          <div className="summaryItem">
            <span className="summaryLabel">Net Savings</span>
            <span className={`summaryValue ${netSavings >= 0 ? "positive" : "negative"}`}>
              INR {netSavings.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Transactions list */}
        <h3>Itemized Transactions List</h3>
        <table className="printTable">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {printTransactions.map(t => (
              <tr key={t._id}>
                <td>
                  {new Date(t.date || t.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td>{t.name}</td>
                <td>{t.category}</td>
                <td>{t.description || "-"}</td>
                <td style={{ color: t.type === "income" ? "#2e7d32" : "#c62828", fontWeight: "bold" }}>
                  {t.type.toUpperCase()}
                </td>
                <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                  {t.type === "income" ? "+" : "-"}{t.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="printFooter">
          <p>Thank you for using SelfMony. Keep tracking to stay in control of your budget.</p>
        </div>
      </div>
    </div>
  );
}
