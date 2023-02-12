import "./app.css";
import axios from "axios";
import { useState } from "react";
import jwt_decode from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const refreshToken = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/refresh", {
        token: user.refreshToken,
      });
      console.log(res);
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwt_decode(user.accessToken);
      // token is expire
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = data.accessToken;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  // console.log(jwt_decode(user.accessToken));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
      // console.log(res);
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      await axiosJWT.delete("http://localhost:5000/api/users/" + id, {
        headers: { authorization: user.accessToken },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="container">
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.username}</b>.
          </span>
          <span>Delete Users:</span>
          <button className="deleteButton" onClick={() => handleDelete(1)}>
            Delete Paras
          </button>
          <button className="deleteButton" onClick={() => handleDelete(2)}>
            Delete Soni
          </button>
          <button className="deleteButton" onClick={() => handleDelete(3)}>
            Delete Kush
          </button>
          <button className="deleteButton" onClick={() => handleDelete(4)}>
            Delete Aman
          </button>
          <button className="deleteButton" onClick={() => handleDelete(5)}>
            Delete Deepak
          </button>
          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}
        </div>
      ) : (
        <div className="login">
          <form onSubmit={handleSubmit}>
            <span className="formTitle">Paras Login</span>
            <input
              type="text"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submitButton">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
