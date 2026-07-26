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
  const [registerUserType, setRegisterUserType] = useState('student');

  // Social Auth Modal state
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState("");
  const [socialName, setSocialName] = useState("");
  const [socialEmail, setSocialEmail] = useState("");
  const [socialRole, setSocialRole] = useState("student");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanUsername = loginUsername.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanUsername || !cleanPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setLoginPasswordWrong(true);
      setError("Password must be at least 6 characters");
      setTimeout(() => {
        setLoginPasswordWrong(false);
      }, 3000);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(cleanUsername, cleanPassword);
      login(response.user, response.token);
      if (response.user.userType === 'instructor') {
        navigate("/instructor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
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

    const cleanUsername = registerUsername.trim();
    const cleanEmail = registerEmail.trim();
    const cleanPassword = registerPassword.trim();

    if (!cleanUsername || !cleanEmail || !cleanPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setRegisterPasswordWrong(true);
      setError("Password must be at least 6 characters");
      setTimeout(() => {
        setRegisterPasswordWrong(false);
      }, 3000);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.signup(cleanUsername, cleanEmail, cleanPassword, registerUserType);
      login(response.user, response.token);
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

  const openSocialAuth = (providerName) => {
    setSocialProvider(providerName);
    const defaultName = providerName === "Google" ? "Alex Rivera" :
                        providerName === "GitHub" ? "DevCoder" :
                        providerName === "Facebook" ? "Jordan Smith" : "Sam Taylor";
    const defaultEmail = `${defaultName.toLowerCase().replace(/\s+/g, '')}@${providerName.toLowerCase()}.com`;
    
    setSocialName(defaultName);
    setSocialEmail(defaultEmail);
    setSocialRole("student");
    setSocialModalOpen(true);
  };

  const handleSocialAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.socialLogin({
        provider: socialProvider,
        name: socialName,
        email: socialEmail,
        userType: socialRole,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(socialName)}&background=7494ec&color=fff`
      });

      setSocialModalOpen(false);
      login(response.user, response.token);
      if (response.user.userType === 'instructor') {
        navigate("/instructor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || `${socialProvider} authentication failed`);
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
          backgroundColor: "#ef4444",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          zIndex: 1000,
          maxWidth: "90%",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
          fontSize: "14px",
          fontWeight: "500"
        }}>
          {error}
        </div>
      )}

      {/* Social Auth Modal */}
      {socialModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: "20px"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", color: "#1e293b", fontSize: "20px" }}>
                <i className={`bx bxl-${socialProvider.toLowerCase()}`} style={{ color: "#7494ec", fontSize: "28px" }}></i>
                Sign in with {socialProvider}
              </h3>
              <button 
                type="button" 
                onClick={() => setSocialModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#64748b" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSocialAuthSubmit}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "5px" }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "5px" }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "5px" }}>Account Role</label>
                <select
                  value={socialRole}
                  onChange={(e) => setSocialRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    cursor: "pointer",
                    background: "#fff"
                  }}
                >
                  <option value="student">🎓 Student</option>
                  <option value="instructor">👨‍🏫 Instructor</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn" 
                disabled={loading}
                style={{ width: "100%", height: "44px" }}
              >
                {loading ? "Authenticating..." : `Continue as ${socialName}`}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="form-box login">
        <form action="#" onSubmit={handleLoginSubmit}>
          <h1>Login</h1>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username or Email"
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
            <a href="#" onClick={(e) => { e.preventDefault(); setError("Password reset link sent to your registered email."); }}>Forgot Password?</a>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p>or login with social platforms</p>
          <div className="social-icons">
            <button type="button" onClick={() => openSocialAuth("Google")} title="Sign in with Google" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <a><i className="bx bxl-google"></i></a>
            </button>
            <button type="button" onClick={() => openSocialAuth("Facebook")} title="Sign in with Facebook" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <a><i className="bx bxl-facebook"></i></a>
            </button>
            <button type="button" onClick={() => openSocialAuth("GitHub")} title="Sign in with GitHub" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <a><i className="bx bxl-github"></i></a>
            </button>
            <button type="button" onClick={() => openSocialAuth("LinkedIn")} title="Sign in with LinkedIn" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <a><i className="bx bxl-linkedin"></i></a>
            </button>
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
          <div className="input-box" style={{ marginTop: "15px", marginBottom: "15px" }}>
            <select
              value={registerUserType}
              onChange={(e) => setRegisterUserType(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 50px 13px 20px",
                borderRadius: "8px",
                fontSize: "15px",
                cursor: "pointer"
              }}
            >
              <option value="student">🎓 Register as Student</option>
              <option value="instructor">👨‍🏫 Register as Instructor</option>
            </select>
            <i className="bx bxs-user-detail"></i>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          <p>or register with social platforms</p>
          <div className="social-icons">
            <button type="button" onClick={() => openSocialAuth("Google")} title="Register with Google" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <a><i className="bx bxl-google"></i></a>
            </button>
            <button type="button" onClick={() => openSocialAuth("Facebook")} title="Register with Facebook" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <a><i className="bx bxl-facebook"></i></a>
            </button>
            <button type="button" onClick={() => openSocialAuth("GitHub")} title="Register with GitHub" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <a><i className="bx bxl-github"></i></a>
            </button>
            <button type="button" onClick={() => openSocialAuth("LinkedIn")} title="Register with LinkedIn" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <a><i className="bx bxl-linkedin"></i></a>
            </button>
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
