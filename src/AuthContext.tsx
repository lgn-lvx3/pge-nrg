// src/context/AuthContext.tsx
import type React from "react";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

interface AuthContextType {
	isAuthenticated: boolean;
	login: () => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const getUserInfoAsync = async () => {
			const response = await fetch("/.auth/me");
			const payload = await response.json();
			const { clientPrincipal } = payload;
			setIsAuthenticated(clientPrincipal);
		};
		getUserInfoAsync();
	}, []);

	const login = () => {
		// Implement your login logic here
		setIsAuthenticated(true);
	};

	const logout = () => {
		// Implement your logout logic here
		setIsAuthenticated(false);
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
