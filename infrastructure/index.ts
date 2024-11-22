import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import config from "./config";

// Define the Docker image
const image = new docker.Image("my-image", {
	build: {
		context: "../backend",
		dockerfile: "../backend/Dockerfile.prod",
	},
	imageName: config.dockerHubImageName!,
	registry: {
		server: "docker.io",
		username: config.dockerHubUsername,
		password: config.dockerHubPassword,
	},
});

// Export the image name
export const imageName = image.imageName;
