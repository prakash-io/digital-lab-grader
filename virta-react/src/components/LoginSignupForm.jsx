import { useState } from "react";
import { PasswordEmoji } from "./PasswordEmoji";
import "./login-signup-form.css";

export function LoginSignupForm() {
  const [isActive, setIsActive] = useState(false);
  const [loginPasswordTyping, setLoginPasswordTyping] = useState(false);
  const [registerPasswordTyping, setRegisterPasswordTyping] = useState(false);
  const [loginPasswordWrong, setLoginPasswordWrong] = useState(false);
  const [registerPasswordWrong, setRegisterPasswordWrong] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginPassword && loginPassword.length < 6) {
      setLoginPasswordWrong(true);
      setTimeout(() => {
        setLoginPasswordWrong(false);
      }, 3000);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerPassword && registerPassword.length < 6) {
      setRegisterPasswordWrong(true);
      setTimeout(() => {
        setRegisterPasswordWrong(false);
      }, 3000);
    }
  };

  return (
    <div className={`login-container ${isActive ? "active" : ""}`}>
      <div className="form-box login">
        <form action="#" onSubmit={handleLoginSubmit}>
          <h1>Login</h1>
          <div className="input-box">
            <input type="text" placeholder="Username" required />
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
          <button type="submit" className="btn">Login</button>
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
            <input type="text" placeholder="Username" required />
            <i className="bx bxs-user"></i>
          </div>
          <div className="input-box">
            <input type="email" placeholder="Email" required />
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
          <button type="submit" className="btn">Register</button>
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

