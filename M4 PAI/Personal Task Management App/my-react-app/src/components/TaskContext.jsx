import { createContext, useState } from "react";

export const TaskContext = createContext();

export default function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Demo Task", done: false },
  ]);

  const addTask = (title) => {
    setTasks((prev) => [...prev, { id: Date.now(), title, done: false }]);
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleTask }}>
      {children}
    </TaskContext.Provider>
  );
}
