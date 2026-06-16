"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "../../../utils/api";
import "./todo.css";

export default function Todo() {
    const router = useRouter();
    const [task, setTask] = useState("");
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchTodos();
    }, [router]);

    async function fetchTodos() {
        try {
            setLoading(true);
            const data = await apiService.getTodos();
            setTodos(data);
        } catch (err) {
            console.error("Error fetching todos:", err);
            setError("Failed to load todos.");
        } finally {
            setLoading(false);
        }
    }

    async function addTodo(e) {
        e.preventDefault();
        if (!task.trim()) return;

        try {
            const newTodo = await apiService.createTodo(task.trim());
            setTodos([newTodo, ...todos]);
            setTask("");
        } catch (err) {
            console.error("Error adding todo:", err);
            setError("Failed to add todo.");
        }
    }

    async function toggleTodo(id, currentStatus) {
        try {
            const updated = await apiService.toggleTodo(id, !currentStatus);
            setTodos(
                todos.map((item) =>
                    item._id === id ? updated : item
                )
            );
        } catch (err) {
            console.error("Error toggling todo:", err);
            setError("Failed to toggle todo.");
        }
    }

    async function removeTodo(id) {
        try {
            await apiService.deleteTodo(id);
            setTodos(
                todos.filter((item) => item._id !== id)
            );
        } catch (err) {
            console.error("Error removing todo:", err);
            setError("Failed to remove todo.");
        }
    }

    return (
        <div className="Main">
            <div className="header">
                <h2>To Do</h2>
            </div>

            <div className="formWrapper">
                <form onSubmit={addTodo}>
                    <div className="sectionInput">
                        <label>Task Name</label>
                        <input
                            type="text"
                            value={task}
                            onChange={(e) =>
                                setTask(e.target.value)
                            }
                            placeholder="Enter task..."
                            required
                        />
                    </div>
                    <button
                        className="Add"
                        type="submit"
                    >
                        ADD
                    </button>
                </form>
            </div>

            {error && <p style={{ color: "#ff4d4d", textAlign: "center", padding: "10px" }}>{error}</p>}

            <div className="todoList">
                {loading ? (
                    <p className="empty">Loading tasks...</p>
                ) : todos.length === 0 ? (
                    <p className="empty">No Tasks</p>
                ) : (
                    todos.map((item) => (
                        <div
                            key={item._id}
                            className="todoCard"
                        >
                            <div className="left">
                                <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() =>
                                        toggleTodo(item._id, item.completed)
                                    }
                                />
                                <span
                                    className={
                                        item.completed
                                            ? "done"
                                            : ""
                                    }
                                >
                                    {item.name}
                                </span>
                            </div>
                            <button
                                className="remove"
                                onClick={() =>
                                    removeTodo(item._id)
                                }
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}