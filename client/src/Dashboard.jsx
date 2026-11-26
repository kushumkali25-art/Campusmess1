
import { useEffect, useState } from "react";
import "./Dashboard.css";

const API = "https://campusmess1.onrender.com";

const mealDeadlines = {
  Breakfast: "06:30",
  Lunch: "10:30",
  Dinner: "17:30",
};

const getIndiaTime = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");

  const [mealType, setMealType] = useState("Breakfast");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const [mealAttendance, setMealAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [attendanceSaving, setAttendanceSaving] = useState("");
  const [attendanceCancelling, setAttendanceCancelling] = useState("");

  const token = localStorage.getItem("campusmessToken");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const goToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const getAttendance = async () => {
    try {
      const response = await fetch(`${API}/api/meal-attendance`, {
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load attendance");
      }

      setMealAttendance(data.meals || []);
    } catch (err) {
      setAttendanceMessage(err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Please login first.");
      setLoading(false);
      setAttendanceLoading(false);
      return;
    }

    const getProfile = async () => {
      try {
        const response = await fetch(`${API}/api/auth/profile`, {
          headers: getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile");
        }

        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const getFeedbacks = async () => {
      try {
        const response = await fetch(`${API}/api/feedback`, {
          headers: getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load feedback");
        }

        setFeedbacks(data.feedbacks || []);
      } catch (err) {
        console.error("Feedback loading error:", err.message);
      }
    };

    getProfile();
    getFeedbacks();
    getAttendance();
  }, [token]);

  const isDeadlinePassed = (meal) =>
    getIndiaTime() >= mealDeadlines[meal];

  const handleAttendance = async (mealType, status) => {
    setAttendanceMessage("");
    setAttendanceSaving(mealType);

    try {
      const response = await fetch(`${API}/api/meal-attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mealType, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save attendance");
      }

      setAttendanceMessage(data.message);
      await getAttendance();
    } catch (err) {
      setAttendanceMessage(err.message);
    } finally {
      setAttendanceSaving("");
    }
  };

  const handleCancelAttendance = async (meal) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your ${meal} response?`
    );

    if (!confirmed) return;

    setAttendanceMessage("");
    setAttendanceCancelling(meal);

    try {
      const response = await fetch(
        `${API}/api/meal-attendance/${meal}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel response");
      }

      setAttendanceMessage(data.message);
      await getAttendance();
    } catch (err) {
      setAttendanceMessage(err.message);
    } finally {
      setAttendanceCancelling("");
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMessage("");
    setFeedbackLoading(true);

    try {
      const response = await fetch(`${API}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mealType,
          rating: Number(rating),
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit feedback");
      }

      setFeedbackMessage("Feedback submitted successfully!");
      setComment("");
      setRating("5");

      const feedbackResponse = await fetch(`${API}/api/feedback`, {
        headers: getHeaders(),
      });

      const feedbackData = await feedbackResponse.json();

      if (feedbackResponse.ok) {
        setFeedbacks(feedbackData.feedbacks || []);
      }
    } catch (err) {
      setFeedbackMessage(err.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  if (error) {
    return (
      <section className="dashboard">
        <p>{error}</p>
        <button onClick={onLogout}>Back to Login</button>
      </section>
    );
  }

  return (
    <main className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">CampusMess</div>

        <div className="sidebar-user">
          <p>HELLO, {user?.name?.toUpperCase()}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => goToSection("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={activeSection === "menu" ? "active" : ""}
            onClick={() => goToSection("menu")}
          >
            Meal Menu
          </button>

          <button
            className={activeSection === "attendance" ? "active" : ""}
            onClick={() => goToSection("attendance")}
          >
            Attendance
          </button>

          <button
            className={activeSection === "feedback" ? "active" : ""}
            onClick={() => goToSection("feedback")}
          >
            Feedback
          </button>
        </nav>

        <div className="sidebar-account">ACCOUNT</div>

        <nav className="sidebar-nav">
          <button
            className={activeSection === "profile" ? "active" : ""}
            onClick={() => goToSection("profile")}
          >
            My Profile
          </button>
        </nav>

        <button className="sidebar-logout" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-header" id="dashboard">
          <div>
            <p>CampusMess | Student Portal</p>
            <h1>Welcome, {user?.name}!</h1>
            <p>Manage your meals and share your feedback.</p>
          </div>
        </header>

        <section className="dashboard-profile" id="profile">
          <h2>My Profile</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </section>

        <section className="dashboard-menu" id="menu">
          <h2>Today's Meal Menu</h2>

          <div className="dashboard-meals">
            <article className="dashboard-meal-card">
              <h3>Breakfast</h3>
              <p>07:30 AM – 09:00 AM</p>
              <ul>
                <li>Aloo Paratha</li>
                <li>Curd</li>
                <li>Fresh Fruits</li>
                <li>Tea</li>
              </ul>
            </article>

            <article className="dashboard-meal-card">
              <h3>Lunch</h3>
              <p>12:30 PM – 02:00 PM</p>
              <ul>
                <li>Dal Tadka</li>
                <li>Steamed Rice</li>
                <li>Roti</li>
                <li>Seasonal Sabzi</li>
              </ul>
            </article>

            <article className="dashboard-meal-card">
              <h3>Dinner</h3>
              <p>07:30 PM – 09:00 PM</p>
              <ul>
                <li>Paneer Curry</li>
                <li>Jeera Rice</li>
                <li>Roti</li>
                <li>Salad</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="dashboard-profile" id="attendance">
          <h2>My Meal Attendance</h2>
          <p>Select whether you will eat each meal today.</p>

          {attendanceLoading ? (
            <p>Loading meal attendance...</p>
          ) : (
            <div className="dashboard-meals">
              {["Breakfast", "Lunch", "Dinner"].map((meal) => {
                const attendance = mealAttendance.find(
                  (item) => item.mealType === meal
                );

                const status = attendance?.status || "Pending";
                const locked = isDeadlinePassed(meal);

                return (
                  <article className="dashboard-meal-card" key={meal}>
                    <h3>{meal}</h3>
                    <p>Response deadline: {mealDeadlines[meal]}</p>
                    <p><strong>My Status:</strong> {status}</p>

                    {locked ? (
                      <p>Response deadline has passed. Locked.</p>
                    ) : (
                      <div>
                        <button
                          type="button"
                          disabled={
                            attendanceSaving === meal ||
                            attendanceCancelling === meal
                          }
                          onClick={() => handleAttendance(meal, "Will Eat")}
                        >
                          {attendanceSaving === meal ? "Saving..." : "Will Eat"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            attendanceSaving === meal ||
                            attendanceCancelling === meal
                          }
                          onClick={() => handleAttendance(meal, "Skip")}
                        >
                          {attendanceSaving === meal ? "Saving..." : "Skip Meal"}
                        </button>

                        {status !== "Pending" && (
                          <button
                            type="button"
                            disabled={
                              attendanceSaving === meal ||
                              attendanceCancelling === meal
                            }
                            onClick={() => handleCancelAttendance(meal)}
                          >
                            {attendanceCancelling === meal
                              ? "Cancelling..."
                              : "Cancel Response"}
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {attendanceMessage && <p>{attendanceMessage}</p>}
        </section>

        <section className="dashboard-profile" id="feedback">
          <h2>Share Your Meal Feedback</h2>
          <p>Tell us about your food experience.</p>

          <form onSubmit={handleFeedbackSubmit}>
            <label htmlFor="mealType">Select Meal</label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>

            <label htmlFor="rating">Give Rating</label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Very Poor</option>
            </select>

            <label htmlFor="comment">Your Feedback</label>
            <textarea
              id="comment"
              placeholder="Write your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              minLength={2}
            />

            <button type="submit" disabled={feedbackLoading}>
              {feedbackLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>

          {feedbackMessage && <p>{feedbackMessage}</p>}
        </section>

        <section className="dashboard-profile">
          <h2>My Previous Feedback</h2>

          {feedbacks.length === 0 ? (
            <p>You have not submitted any feedback yet.</p>
          ) : (
            feedbacks.map((feedback) => (
              <article key={feedback._id}>
                <h3>{feedback.mealType}</h3>
                <p>Rating: {feedback.rating}/5</p>
                <p>{feedback.comment}</p>
                <small>
                  {new Date(feedback.createdAt).toLocaleString()}
                </small>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
