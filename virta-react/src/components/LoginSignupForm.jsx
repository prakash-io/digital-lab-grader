import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PasswordEmoji } from "./PasswordEmoji";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "./login-signup-form.css";

export function LoginSignupForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPasswordTyping, setLoginPasswordTyping] = useState(false);
  const [loginPasswordWrong, setLoginPasswordWrong] = useState(false);
  
  // Register state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordTyping, setRegisterPasswordTyping] = useState(false);
  const [registerPasswordWrong, setRegisterPasswordWrong] = useState(false);
  // All new registrations default to 'student'
  const registerUserType = 'student';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!loginUsername || !loginPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (loginPassword.length < 6) {
      setLoginPasswordWrong(true);
      setError("Password must be at least 6 characters");
      setTimeout(() => {
        setLoginPasswordWrong(false);
      }, 3000);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(loginUsername, loginPassword);
      login(response.user, response.token);
      // Redirect based on user type
      if (response.user.userType === 'instructor') {
        navigate("/instructor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      setLoginPasswordWrong(true);
      setTimeout(() => {
        setLoginPasswordWrong(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!registerUsername || !registerEmail || !registerPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterPasswordWrong(true);
      setError("Password must be at least 6 characters");
      setTimeout(() => {
        setRegisterPasswordWrong(false);
      }, 3000);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.signup(registerUsername, registerEmail, registerPassword, registerUserType);
      login(response.user, response.token);
      // Redirect based on user type
      if (response.user.userType === 'instructor') {
        navigate("/instructor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setRegisterPasswordWrong(true);
      setTimeout(() => {
        setRegisterPasswordWrong(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${isActive ? "active" : ""}`}>
      {error && (
        <div className="error-message" style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#ff4444",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          zIndex: 1000,
          maxWidth: "90%",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}
      <div className="form-box login">
        <form action="#" onSubmit={handleLoginSubmit}>
          <h1>Login</h1>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              required
              value={loginUsername}
              onChange={(e) => {
                setLoginUsername(e.target.value);
                setError("");
              }}
            />
            <i className="bx bxs-user"></i>
          </div>
          <div className="input-box password-input-wrapper">
            <input
              type="password"
              placeholder="Password"
              required
              value={loginPassword}
              onChange={(e) => {
                setLoginPassword(e.target.value);
                setLoginPasswordWrong(false);
                setError("");
              }}
              onFocus={() => setLoginPasswordTyping(true)}
              onBlur={() => setLoginPasswordTyping(false)}
              onInput={(e) => {
                const value = e.target.value;
                setLoginPasswordTyping(value.length > 0);
                setLoginPasswordWrong(false);
              }}
            />
            <PasswordEmoji isTyping={loginPasswordTyping} isWrong={loginPasswordWrong} />
          </div>
          <div className="forgot-link">
            <a href="#">Forgot Password?</a>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p>or login with social platforms</p>
          <div className="social-icons">
            <a href="#">
              <i className="bx bxl-google"></i>
            </a>
            <a href="#">
              <i className="bx bxl-facebook"></i>
            </a>
            <a href="#">
              <i className="bx bxl-github"></i>
            </a>
            <a href="#">
              <i className="bx bxl-linkedin"></i>
            </a>
          </div>
        </form>
      </div>

      <div className="form-box register">
        <form action="#" onSubmit={handleRegisterSubmit}>
          <h1>Registration</h1>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              required
              value={registerUsername}
              onChange={(e) => {
                setRegisterUsername(e.target.value);
                setError("");
              }}
            />
            <i className="bx bxs-user"></i>
          </div>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              required
              value={registerEmail}
              onChange={(e) => {
                setRegisterEmail(e.target.value);
                setError("");
              }}
            />
            <i className="bx bxs-envelope"></i>
          </div>
          <div className="input-box password-input-wrapper">
            <input
              type="password"
              placeholder="Password"
              required
              value={registerPassword}
              onChange={(e) => {
                setRegisterPassword(e.target.value);
                setRegisterPasswordWrong(false);
                setError("");
              }}
              onFocus={() => setRegisterPasswordTyping(true)}
              onBlur={() => setRegisterPasswordTyping(false)}
              onInput={(e) => {
                const value = e.target.value;
                setRegisterPasswordTyping(value.length > 0);
                setRegisterPasswordWrong(false);
              }}
            />
            <PasswordEmoji isTyping={registerPasswordTyping} isWrong={registerPasswordWrong} />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          <p>or register with social platforms</p>
          <div className="social-icons">
            <a href="#">
              <i className="bx bxl-google"></i>
            </a>
            <a href="#">
              <i className="bx bxl-facebook"></i>
            </a>
            <a href="#">
              <i className="bx bxl-github"></i>
            </a>
            <a href="#">
              <i className="bx bxl-linkedin"></i>
            </a>
          </div>
        </form>
      </div>

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Hello, Welcome!</h1>
          <p>Don&apos;t have an account?</p>
          <button
            type="button"
            className="btn register-btn"
            onClick={() => setIsActive(true)}
          >
            Register
          </button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button
            type="button"
            className="btn login-btn"
            onClick={() => setIsActive(false)}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

