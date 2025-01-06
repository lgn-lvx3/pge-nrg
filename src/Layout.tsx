import { Button, Dropdown, Menu, Navbar } from "react-daisyui";
import { Outlet } from "react-router";

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

	return (
		<>
			<Navbar className="container mx-auto flex-1 justify-center bg-primary text-white">
				<Navbar.Start>
					<Dropdown>
						<Button
							tag="label"
							color="ghost"
							tabIndex={0}
							className="lg:hidden"
						>
							{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h8m-8 6h16"
								/>
							</svg>
						</Button>
						<Dropdown.Menu tabIndex={0} className="w-52 menu-sm mt-3 z-[1]">
							<Dropdown.Item>Item 1</Dropdown.Item>
							<Dropdown.Item>Item 3</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
					{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
					<a className="btn btn-ghost normal-case text-xl">PGE NRG</a>
				</Navbar.Start>
				<Navbar.Center className="hidden lg:flex">
					<Menu horizontal className="px-1">
						<Menu.Item>
							{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
							<a>Item 1</a>
						</Menu.Item>
						<Menu.Item>
							<details>
								<summary>Parent</summary>
								<ul className="p-2">
									<Menu.Item>
										{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
										<a>Submenu 1</a>
									</Menu.Item>
									<Menu.Item>
										{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
										<a>Submenu 2</a>
									</Menu.Item>
								</ul>
							</details>
						</Menu.Item>
						<Menu.Item>
							{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
							<a>Item 3</a>
						</Menu.Item>
					</Menu>
				</Navbar.Center>
				<Navbar.End>
					<Button tag="a">Button</Button>
				</Navbar.End>
			</Navbar>
			<div className="flex flex-1 flex-grow justify-center my-10">
				<Outlet />
			</div>
		</>
	);
}
