import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as random from "@pulumi/random";
import config from "./config";

const clusterName = "dev-cluster";

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

export const imageName = image.imageName;
