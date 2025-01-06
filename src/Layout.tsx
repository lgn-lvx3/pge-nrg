import { Button, Menu, Navbar, useTheme } from "react-daisyui";
import { Link, Outlet } from "react-router";
import { useAuth } from "./AuthContext";

export function RootLayout() {
	// return (
	// 	<div className="flex flex-col min-h-screen">
	// 		<Header className="bg-primary text-white p-4">
	// 			<h1>My Website</h1>
	// 		</Header>
	// 		<main className="flex-grow">
	// 			<Outlet />
	// 		</main>
	// 		<Footer className="bg-secondary text-white p-4">
	// 			<p>© 2023 My Website</p>
	// 		</Footer>
	// 	</div>
	// );
	useTheme("light");

	const { isAuthenticated } = useAuth();

	return (
		<>
			<Navbar
				className="container mx-auto justify-center shadow-xl rounded-box mt-5 p-3"
				data-theme="light"
			>
				<Navbar.Start>
					<Link to="/" className="btn btn-ghost normal-case text-xl">
						PGE NRG
					</Link>
				</Navbar.Start>
				{isAuthenticated && (
					<Navbar.Center className="hidden lg:flex">
						<Menu horizontal className="px-1">
							<Menu.Item>
								{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
								<Link to="/">Home</Link>
							</Menu.Item>
							<Menu.Item>
								<Link to="/alerts">Alerts</Link>
							</Menu.Item>
							<Menu.Item>
								<Link to="/docs">Docs</Link>
							</Menu.Item>
						</Menu>
					</Navbar.Center>
				)}
				<Navbar.End>
					{isAuthenticated && (
						<Button tag="a" href="/.auth/logout">
							Sign Out
						</Button>
					)}
				</Navbar.End>
			</Navbar>
			<div className="flex flex-1 flex-grow justify-center my-10">
				<Outlet />
			</div>
		</>
	);
}
