import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import VotingPanel from "./components/VotingPanel";
import FundmePanel from "./components/FundmePanel";

function App() {
  return (
    <Router>
      <nav>
        <Link to="/admin">Admin Panel</Link> |{" "}
        <Link to="/voting">Voting Panel</Link> |{" "}
        <Link to="/fund">Fund Candidate</Link>
      </nav>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/voting" element={<VotingPanel />} />
        <Route path="/fund" element={<FundmePanel />} />
        <Route path="/" element={<h1>Welcome to the Election DApp</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
