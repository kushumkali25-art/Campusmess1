import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API = "http://localhost:5000";

function AdminDashboard({ onLogout }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFeedback: 0,
    averageRating: 0,
  });

  const [feedbacks, setFeedbacks] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("campusmessToken");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          statsResponse,
          feedbackResponse,
          attendanceResponse,
        ] = await Promise.all([
          fetch(`${API}/api/admin/stats`, { headers }),
          fetch(`${API}/api/admin/feedback`, { headers }),
          fetch(`${API}/api/admin/meal-attendance`, { headers }),
        ]);

        const statsData = await statsResponse.json();
        const feedbackData = await feedbackResponse.json();
        const attendanceData = await attendanceResponse.json();

        if (!statsResponse.ok) {
          throw new Error(statsData.message || "Failed to load statistics");
        }

        if (!feedbackResponse.ok) {
          throw new Error(feedbackData.message || "Failed to load feedback");
        }

        if (!attendanceResponse.ok) {
          throw new Error(
            attendanceData.message || "Failed to load meal attendance"
          );
        }

        setStats(statsData);
        setFeedbacks(feedbackData.feedbacks || []);
        setAttendanceReport(attendanceData.attendanceReport || []);
        setAttendanceDate(attendanceData.date || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAdminData();
    } else {
      setError("Please login again.");
      setLoading(false);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("campusmessToken");

    if (onLogout) {
      onLogout();
    }
  };

  if (loading) {
    return <h2 className="admin-loading">Loading Admin Dashboard...</h2>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>CampusMess Admin</h1>
          <p>Manage students and meal feedback</p>
        </div>

        <button className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {error && <p className="admin-error">{error}</p>}

      <section className="admin-welcome">
        <h2>Welcome, Admin!</h2>
        <p>Here is an overview of your CampusMess platform.</p>
      </section>

      <section className="admin-stats">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p>{stats.totalStudents}</p>
        </div>

        <div className="stat-card">
          <h3>Total Feedback</h3>
          <p>{stats.totalFeedback}</p>
        </div>

        <div className="stat-card">
          <h3>Average Rating</h3>
          <p>{stats.averageRating} / 5</p>
        </div>
      </section>

      <section className="admin-feedback">
        <h2>Today's Meal Attendance</h2>
        <p>Date: {attendanceDate}</p>

        {attendanceReport.length === 0 ? (
          <p>No attendance data available.</p>
        ) : (
          attendanceReport.map((meal) => (
            <article key={meal.mealType} className="stat-card">
              <h3>{meal.mealType}</h3>

              <p>Total Students: {meal.totalStudents}</p>
              <p>Will Eat: {meal.willEatCount}</p>
              <p>Skip: {meal.skipCount}</p>
              <p>Pending: {meal.pendingCount}</p>

              <h4>Students Who Will Eat</h4>
              {meal.willEat.length === 0 ? (
                <p>No students selected Will Eat.</p>
              ) : (
                <ul>
                  {meal.willEat.map((student) => (
                    <li key={student.studentId}>
                      {student.name} — {student.email}
                    </li>
                  ))}
                </ul>
              )}

              <h4>Students Who Skipped</h4>
              {meal.skip.length === 0 ? (
                <p>No students selected Skip.</p>
              ) : (
                <ul>
                  {meal.skip.map((student) => (
                    <li key={student.studentId}>
                      {student.name} — {student.email}
                    </li>
                  ))}
                </ul>
              )}

              <h4>Pending Students</h4>
              {meal.pending.length === 0 ? (
                <p>No pending students.</p>
              ) : (
                <ul>
                  {meal.pending.map((student) => (
                    <li key={student.studentId}>
                      {student.name} — {student.email}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))
        )}
      </section>

      <section className="admin-feedback">
        <h2>Student Feedback</h2>

        {feedbacks.length === 0 ? (
          <p>No feedback submitted yet.</p>
        ) : (
          <div className="feedback-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Meal</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {feedbacks.map((feedback) => (
                  <tr key={feedback._id}>
                    <td>{feedback.student?.name || "Unknown"}</td>
                    <td>{feedback.student?.email || "N/A"}</td>
                    <td>{feedback.mealType}</td>
                    <td>{feedback.rating} / 5</td>
                    <td>{feedback.comment}</td>
                    <td>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
