import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";

import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import AIPlanner from "./pages/AIPlanner";
import Map from "./pages/Map";
import GamePage from "./pages/GamePage";
import Register from "./pages/Register";
import ExplorePage from "./pages/ExplorePage";
import TranslatorPage from "./pages/TranslatorPage";
import DictionaryPage from "./pages/DictionaryPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/adventure" element={<ExplorePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/ai-planner" element={<AIPlanner />} />
          <Route path="/map" element={<Map />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/:districtName" element={<ExplorePage />} />
          <Route path="/translator" element={<TranslatorPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
