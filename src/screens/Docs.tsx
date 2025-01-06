import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

function Docs() {
	return (
		<>
			<SwaggerUI url="https://lively-mud-02baee110.4.azurestaticapps.net/api-spec.json" />
		</>
	);
}

export { Docs };
