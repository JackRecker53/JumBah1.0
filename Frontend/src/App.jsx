import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import AdventurePage from "./pages/AdventurePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import EventsPage from "./pages/EventsPage";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import AIPlanner from "./pages/AIPlanner";
import Map from "./pages/Map";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore/:districtName" element={<ExplorePage />} />
          <Route path="/adventure" element={<AdventurePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/ai-planner" element={<AIPlanner />} />
          <Route path="/map" element={<Map />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
