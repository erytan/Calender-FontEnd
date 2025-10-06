import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages";
import path from "./ultils/path";

function App() {
  return (
    <Routes>
      <Route path={path.HOME} element={<Home />} />
    </Routes>
  );
}

export default App;