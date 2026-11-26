import { useState } from "react";
import "./App.css";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";

const meals = [
  {
    name: "Breakfast",
    time: "07:30 AM – 09:00 AM",
    description: "Start your day with a healthy and delicious breakfast.",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85",
    items: ["Aloo Paratha", "Curd", "Fresh Fruits", "Tea"],
    tag: "Morning Special",
  },
  {
    name: "Lunch",
    time: "12:30 PM – 02:00 PM",
    description: "Enjoy a wholesome meal with fresh Indian flavours.",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1000&q=85",
    items: ["Dal Tadka", "Steamed Rice", "Roti", "Seasonal Sabzi"],
    tag: "Today's Special",
  },
  {
    name: "Dinner",
    time: "07:30 PM – 09:00 PM",
    description: "End your day with a comforting and tasty dinner.",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=85",
    items: ["Paneer Curry", "Jeera Rice", "Roti", "Salad"],
    tag: "Chef's Choice",
  },
];

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("campusmessToken")
  );

  const [role, setRole] = useState(
    localStorage.getItem("campusmessRole")
  );

  const handleLogin = (userRole) => {
    setToken(localStorage.getItem("campusmessToken"));
    setRole(userRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("campusmessToken");
    localStorage.removeItem("campusmessRole");
    setToken(null);
    setRole(null);
  };

  if (token && role === "Admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (token && role === "Student") {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="app">
      <header className="navbar">
        <a href="#home" className="logo">
          <span className="logo-icon">🍽</span>
          Campus<span>Mess</span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#menu">Today's Menu</a>
          <a href="#about">About Us</a>
          <a href="#feedback">Feedback</a>
        </nav>

        <div className="nav-actions">
          <a href="#login" className="login-link">Login</a>
          <a href="#login" className="nav-button">Get Started</a>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">WELCOME TO CAMPUSMESS</span>
            <h1>
              Good Food.
              <br />
              <span>Better Campus Life.</span>
            </h1>
            <p>
              Discover your daily hostel meals, share your food experience
              and make every meal better with CampusMess.
            </p>

            <div className="hero-buttons">
              <a href="#menu" className="primary-button">
                Explore Today's Menu →
              </a>
              <a href="#feedback" className="secondary-button">
                Share Feedback
              </a>
            </div>

            <div className="hero-note">
              <span>✦</span> Fresh meals. Happy students. Better campus.
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1400&q=90"
              alt="Indian vegetarian thali with a variety of dishes"
            />
            <div className="image-label">
              <span>🥗</span>
              <div>
                <strong>Made with care</strong>
                <small>Freshness in every meal</small>
              </div>
            </div>
          </div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <span className="eyebrow">FRESH FROM OUR KITCHEN</span>
            <h2>Today's <span>Delicious Menu</span></h2>
            <p>
              Good food brings everyone together. Explore what's cooking today!
            </p>
          </div>

          <div className="meal-grid">
            {meals.map((meal) => (
              <article className="meal-card" key={meal.name}>
                <div className="meal-image">
                  <img src={meal.image} alt={meal.name + " Indian meal"} />
                  <span className="meal-tag">{meal.tag}</span>
                </div>

                <div className="meal-content">
                  <div className="meal-title-row">
                    <h3>{meal.name}</h3>
                    <span className="meal-icon">✦</span>
                  </div>

                  <p className="meal-time">◷ {meal.time}</p>
                  <p className="meal-description">{meal.description}</p>

                  <ul>
                    {meal.items.map((item) => (
                      <li key={item}>✓ {item}</li>
                    ))}
                  </ul>

                  <a href="#feedback" className="meal-button">
                    Rate This Meal →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-heading">
            <span className="eyebrow">WHY CAMPUSMESS?</span>
            <h2>More Than Just <span>Food</span></h2>
            <p>
              We make hostel dining easier, smarter and more enjoyable.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <span>🍱</span>
              <h3>Daily Menu</h3>
              <p>Check breakfast, lunch and dinner menus in one place.</p>
            </div>

            <div className="feature-card">
              <span>⭐</span>
              <h3>Meal Ratings</h3>
              <p>Rate your meals and help improve food quality.</p>
            </div>

            <div className="feature-card">
              <span>💬</span>
              <h3>Student Feedback</h3>
              <p>Share suggestions and report food-related issues.</p>
            </div>

            <div className="feature-card">
              <span>📢</span>
              <h3>Announcements</h3>
              <p>Stay updated with important mess announcements.</p>
            </div>
          </div>
        </section>

        <section className="feedback-section" id="feedback">
          <div>
            <span className="eyebrow">YOUR VOICE MATTERS</span>
            <h2>Let's Make Every Meal Better!</h2>
            <p>
              Your feedback helps us improve the campus dining experience.
            </p>
          </div>

          <a href="#login" className="feedback-button">
            Share Your Feedback →
          </a>
        </section>
      </main>

      <Auth onLogin={handleLogin} />

      <footer className="footer">
        <a href="#home" className="logo">
          🍽 Campus<span>Mess</span>
        </a>
        <p>Made for students. Made for better meals. © 2026 CampusMess.</p>
      </footer>
    </div>
  );
}

export default App;
