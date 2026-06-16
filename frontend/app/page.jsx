"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CgProfile } from "react-icons/cg";
import { PiCurrencyInrBold } from "react-icons/pi";
import { IoArrowDownOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { apiService } from "../utils/api";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("User");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername.charAt(0).toUpperCase() + storedUsername.slice(1));
    }

    async function fetchData() {
      try {
        const data = await apiService.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        if (err.response?.status === 401) {
          apiService.logout();
          router.push("/login");
        } else {
          setError("Failed to load transactions.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await apiService.deleteTransaction(id);
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
      alert("Failed to delete transaction. Please try again.");
    }
  }

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="Main">
      {/* Header section */}
      <header>
        <div className="leftcondiner">
          <div className="porfilecondiner">
            <CgProfile />
          </div>
        </div>
        <div className="rightcondiner">
          <div className="userNameCondiner">
            <h2>Hi {username}</h2>
          </div>
        </div>
      </header>
      
      <div className="bannerCondner">
        <div className="wraper">
          <h4>Total Balances</h4>
          <h3>
            <PiCurrencyInrBold /> {loading ? "Loading..." : totalBalance.toFixed(2)}
          </h3>
        </div>
      </div>

      <div className="resent">
        <div className="resentHeader">
          <div className="resentHeaderWrapper">
            <h2>Recent Activities</h2>
            <div className="icon">
              <IoArrowDownOutline />
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>Loading recent activities...</p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "#ff4d4d", padding: "20px" }}>{error}</p>
        ) : transactions.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>No transactions found. Go to Add to insert some.</p>
        ) : (
          <div className="listWrapper">
            {transactions.slice(0, 15).map((item) => (
              <div className="listCart" key={item._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="textSection" style={{ flex: 1 }}>
                  <h2>{item.name}</h2>
                  <p>{item.description || "No description provided"}</p>
                  <span style={{ fontSize: "11px", color: "#666", display: "block", marginTop: "4px" }}>
                    {new Date(item.date || item.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <span 
                    className="amout" 
                    style={{ color: item.type === "income" ? "#4caf50" : "#ff4d4d" }}
                  >
                    {item.type === "income" ? "+" : "-"}{item.amount.toFixed(2)}
                  </span>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      padding: "4px",
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#ff4d4d"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#888"}
                    title="Delete Transaction"
                  >
                    <RiDeleteBin6Line />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

