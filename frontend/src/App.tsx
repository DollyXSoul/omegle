import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Room from "./components/Room";
import Landing from "./components/Landing";

function App() {
  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/room" element={<Room />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
