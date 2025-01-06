import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
// import { useAuth } from "../AuthHook";

export function Login() {
	const [userInfo, setUserInfo] = useState<unknown>(null);
	const navigate = useNavigate();

	// const { isAuthenticated } = useAuth();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const getUserInfoAsync = async () => {
			const response = await fetch("/.auth/me");
			const payload = await response.json();
			const { clientPrincipal } = payload;
			setUserInfo(clientPrincipal);
		};
		getUserInfoAsync();
		if (userInfo) {
			navigate("/dashboard");
		} else {
			navigate("/");
		}
	}, [userInfo]);

	return <></>;
}
