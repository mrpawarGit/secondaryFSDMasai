import React, { useContext, useState, useEffect, useRef } from "react";
import { TaskContext } from "../components/TaskContext";

function Tasks() {
  const { tasks, addTask, toggleTask } = useContext(TaskContext);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const titleRef = useRef();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim());
    setTitle("");
  }

  if (!tasks) return <p>Loading tasks...</p>;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.done;
    if (filter === "uncompleted") return !task.done;
    return true;
  });

  return (
    <div>
      <h2>Your Tasks</h2>
      <form onSubmit={handleSubmit}>
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter Task..."
          required
        />
        <button type="submit">Add</button>
      </form>

      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("uncompleted")}>Uncompleted</button>
      </div>

      {filteredTasks.length === 0 ? (
        <p>No tasks</p>
      ) : (
        <ul>
          {filteredTasks.map((task) => (
            <li key={task.id}>
              <span
                onClick={() => toggleTask(task.id)}
                style={{
                  cursor: "pointer",
                  textDecoration: task.done ? "line-through" : "none",
                }}
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Tasks;
