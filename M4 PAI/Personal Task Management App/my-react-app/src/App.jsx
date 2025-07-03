import { useState } from "react";
import "./App.css";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import About from "./pages/About";
import TaskProvider from "./components/TaskContext";

function App() {
  return (
    <TaskProvider>
      <BrowserRouter>
        <nav>
          <Link to="/">Home </Link>
          <Link to="/tasks"> Tasks </Link>
          <Link to="/about"> About</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </TaskProvider>
  );
}

export default App;
