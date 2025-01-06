import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

function Docs() {
	return (
		<>
			<SwaggerUI url="http://localhost:4280/api-spec.json" />
		</>
	);
}

export { Docs };
