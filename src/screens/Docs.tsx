import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

function Docs() {
	return (
		<>
			<SwaggerUI url="https://gray-sand-04ca9ed1e.6.azurestaticapps.net/api-spec.json" />
		</>
	);
}

export { Docs };
