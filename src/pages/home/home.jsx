import React, { useState, useEffect } from "react";
import DayCard from "./dayCard";
import { apiGetKhachHang } from "../../apis/khacHang";
import DoneTable from "../../components/doneTask";
const App = () => {
  const [khachHangs, setKhachHangs] = useState([]);
  const [view, setView] = useState("daily")

  // Fetch customer list from API
  useEffect(() => {
    const fetchKhachHangs = async () => {
      try {
        const res = await apiGetKhachHang();
        setKhachHangs(res.data || []);
      } catch (err) {
        console.log("Lấy khách hàng thất bại", err);
      }
    };
    fetchKhachHangs();
  }, []);

  const days = [
    { name: "Monday" },
    { name: "Tuesday" },
    { name: "Wednesday" },
    { name: "Thursday" },
    { name: "Friday" },
    { name: "Saturday" },
    { name: "Sunday" },
  ];

  return (
    <div className="app">
      <header className="header">
        <h1>Weekly To Do List</h1>
        <div className="header-controls">
          <div className="view-toggle">
            <span className={`toggle-item ${view === "daily" ? "active" : ""}`}
              onClick={() => setView("daily")}
            >Daily</span>
            <span className={`toggle-item ${view === "all" ? "active" : ""}`}
              onClick={() => setView("all")}>All Tasks</span>
            <span className={`toggle-item ${view === "done" ? "active" : ""}`}
              onClick={() => setView("done")}>Done</span>
          </div>
          {/* <div className="icons">
            <span>↻</span>
            <span>📝</span>
            <span>⚙️</span>
            <span>≡</span>
          </div> */}
        </div>
      </header>
      <div className="main">
        {view === "daily" && (
          <div className="days-grid">
            {days.map((day) => (
              <DayCard
                key={day.name}
                day={day}
                khachHangs={khachHangs}
                setKhachHangs={setKhachHangs}
              />
            ))}
          </div>
        )}
          {view === "done" && (
          <div className="done-view">
              <DoneTable khachHangs={khachHangs} setKhachHangs={setKhachHangs} />
          </div>
        )}

        {view === "all" && (
          <div className="all-view">
            <p>All tasks view (chưa làm)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;