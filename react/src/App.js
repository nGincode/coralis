import React from "react";
import { createRoot } from "react-dom/client";
import "../style.css";

const Root = () => <h1 className="text-red-500">Hello</h1>;

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<Root />);
