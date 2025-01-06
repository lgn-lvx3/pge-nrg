import { useState, useEffect } from "react";

interface UseAuthReturn {
	isAuthenticated: boolean;
	login: () => void;
	logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
		// Initialize from local storage
		return localStorage.getItem("isAuthenticated") === "true";
	});

	const login = () => {
		setIsAuthenticated(true);
		localStorage.setItem("isAuthenticated", "true");
	};

	const logout = () => {
		setIsAuthenticated(false);
		localStorage.setItem("isAuthenticated", "false");
	};

	useEffect(() => {
		// Sync state with local storage
		const storedAuth = localStorage.getItem("isAuthenticated");
		if (storedAuth !== null) {
			setIsAuthenticated(storedAuth === "true");
		}
	}, []);

	return { isAuthenticated, login, logout };
};
