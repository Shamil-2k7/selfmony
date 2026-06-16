"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../../utils/api';
import './style.css';

export default function AddIncome() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10)); // Default to today's date YYYY-MM-DD
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim() || !amount) {
            setError('Please fill in both Name and Amount fields.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await apiService.createTransaction({
                name,
                description,
                amount: Number(amount),
                type: 'income',
                category: 'general',
                date: date ? new Date(date) : new Date()
            });
            router.push('/');
        } catch (err) {
            console.error('Error adding income:', err);
            setError('Failed to add income. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="Main">
                <div className="header">
                    <h2>Add Income</h2>
                </div>
                <div className="formWrapper">
                    <form onSubmit={handleSubmit}>
                        {error && <p style={{ color: '#ff4d4d', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
                        
                        <div className="FormElement">
                            <div className="sectionInput">
                                <label htmlFor="Name">Name</label>
                                <input 
                                    type="text" 
                                    id="Name" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="sectionInput">
                                <label htmlFor="Description">Description</label>
                                <input 
                                    type="text" 
                                    id="Description" 
                                    name="Description" 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="sectionInput">
                                <label htmlFor="Amount">Amount</label>
                                <input 
                                    type="number" 
                                    id="Amount" 
                                    name="Amount" 
                                    min={1} 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="sectionInput">
                                <label htmlFor="Date">Date</label>
                                <input 
                                    type="date" 
                                    id="Date" 
                                    name="Date" 
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button className="Add" type="submit" disabled={loading}>
                            {loading ? 'ADDING...' : 'ADD'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}