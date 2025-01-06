import { useAuth } from "@/AuthContext";
import { useEffect } from "react";
import { Button, Card } from "react-daisyui";
import { useNavigate } from "react-router";
// import { useAuth } from "../AuthHook";

export function Login() {
	// const [userInfo, setUserInfo] = useState<unknown>(null);

	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/dashboard");
		}
	}, [isAuthenticated, navigate]);

	// const { isAuthenticated } = useAuth();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	// useEffect(() => {
	// 	const getUserInfoAsync = async () => {
	// 		const response = await fetch("/.auth/me");
	// 		const payload = await response.json();
	// 		const { clientPrincipal } = payload;
	// 		setUserInfo(clientPrincipal);
	// 	};
	// 	getUserInfoAsync();

	// 	if (userInfo) {
	// 		navigate("/dashboard");
	// 	} else {
	// 		navigate("/");
	// 	}
	// }, [userInfo]);

	return (
		<>
			<div className="container flex flex-1 justify-center items-center">
				<div className="grid grid-cols-8 gap-3">
					<div className="col-span-6">
						<Card className="p-3 shadow-xl">
							<Card.Body>
								<Card.Title>
									<h1 className="text-4xl font-bold mb-3">
										Welcome to PGE NRG
									</h1>
								</Card.Title>
								<Card.Actions className="flex justify-center">
									<Button tag="a" href="/.auth/login/aad">
										Login
									</Button>
								</Card.Actions>
							</Card.Body>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}
