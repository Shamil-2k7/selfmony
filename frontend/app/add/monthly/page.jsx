"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "../../../utils/api";
import { PiCurrencyInrBold } from "react-icons/pi";
import "./style.css";

export default function MonthlyExpenses() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchMonthlyExpenses();
    }, [router]);

    async function fetchMonthlyExpenses() {
        try {
            setLoading(true);
            const data = await apiService.getTransactions({ category: 'monthly' });
            setItems(data);
        } catch (err) {
            console.error("Error fetching monthly expenses:", err);
            setError("Failed to load monthly expenses.");
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd(e) {
        e.preventDefault();
        if (!name.trim() || !amount) {
            setError("Please provide Name and Amount.");
            return;
        }

        setError("");
        try {
            const newItem = await apiService.createTransaction({
                name,
                description,
                amount: Number(amount),
                type: 'expense',
                category: 'monthly'
            });
            setItems([newItem, ...items]);
            setName("");
            setDescription("");
            setAmount("");
        } catch (err) {
            console.error("Error creating monthly expense:", err);
            setError("Failed to add monthly expense.");
        }
    }

    async function handleRemove(id) {
        try {
            await apiService.deleteTransaction(id);
            setItems(items.filter(item => item._id !== id));
        } catch (err) {
            console.error("Error deleting monthly expense:", err);
            setError("Failed to delete monthly expense.");
        }
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

    return (
        <>
            <div className="Main">
                <div className="header">
                    <h3>Monthly Action</h3>
                </div>

                <div className="current">
                    <div className="current">
                        <div className="setion">
                            <p className="anoutname">
                                Total Monthly: INR {loading ? "..." : totalAmount.toFixed(2)}
                            </p> 
                            <br />
                            <p className="anoutname">
                                Items Count: {loading ? "..." : items.length}
                            </p> 
                            <br />
                            <p className="anoutname">
                                Average Cost: INR {loading ? "..." : (items.length ? (totalAmount / items.length).toFixed(2) : "0.00")}
                            </p> 
                            <br />
                        </div>
                    </div>
                </div>

                <div className="addsection">
                    <div className="formWrapper">
                        <form onSubmit={handleAdd}>
                            {error && <p style={{ color: "#ff4d4d", marginBottom: "10px", textAlign: "center" }}>{error}</p>}
                            <div className="FormElement">
                                <div className="sectionInput">
                                    <label htmlFor="Name">Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="sectionInput">
                                    <label htmlFor="Description">Description</label>
                                    <input 
                                        type="text" 
                                        name="Description" 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="sectionInput">
                                    <label htmlFor="Amount">Amount</label>
                                    <input 
                                        type="number" 
                                        min={1} 
                                        name="Amount" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button className="Add" type="submit">ADD</button>
                        </form>
                    </div>
                </div>

                <div className="listofmonltyexpenses">
                    <div>
                        <h1>List of monthly expenses</h1>
                    </div>
                    {loading ? (
                        <p style={{ color: "#888", textAlign: "center", padding: "10px" }}>Loading...</p>
                    ) : items.length === 0 ? (
                        <p style={{ color: "#888", textAlign: "center", padding: "10px" }}>No monthly expenses added yet.</p>
                    ) : (
                        <div className="listwrapper">
                            {items.map((item) => (
                                <div className="boxlist" key={item._id}>
                                    <div className="texts">
                                        <h5 className="name">{item.name}</h5>
                                        <h5 className="aomut">INR {item.amount.toFixed(2)}</h5>
                                    </div>
                                    <div className="acton">
                                        <button className="remove" onClick={() => handleRemove(item._id)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}