import "./index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Docs } from "./screens/Docs";
import { Login } from "./screens/Login";
import { Dashboard } from "./screens/Dashboard";
import { RootLayout } from "./Layout";

import { AuthProvider } from "./AuthContext";
import { Alerts } from "./screens/Alerts";

const root = document.getElementById("root");

// get auth info

ReactDOM.createRoot(root as HTMLElement).render(
	<BrowserRouter>
		<AuthProvider>
			<Routes>
				<Route element={<RootLayout />}>
					<Route path="/" element={<Login />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/docs" element={<Docs />} />
					<Route path="/alerts" element={<Alerts />} />
				</Route>
			</Routes>
		</AuthProvider>
	</BrowserRouter>,
);
