import "./gch";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
// ** Toast
import { ToastContainer } from "react-toastify";

import App from "./App";

// ** React Toastify
import "react-toastify/scss/main.scss";

// ** Core styles
import "./assets/styles/style.scss";

import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <HashRouter>
    <App />
    <ToastContainer position="bottom-right" autoClose={5000} newestOnTop />
  </HashRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
