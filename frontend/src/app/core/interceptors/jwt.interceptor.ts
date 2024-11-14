import { HttpInterceptorFn } from "@angular/common/http";
import { decodeJwt } from "jose";

function tokenExpired(token: string): boolean {
	if (!token) return true;
	try {
		const decodedToken = decodeJwt(token);
		if (!decodedToken.exp) return true;
		const currentTime = Date.now() / 1000;
		return decodedToken.exp < currentTime;
	} catch (error) {
		console.error("Error decoding token:", error);
		return true;
	}
}

export const JwtInterceptor: HttpInterceptorFn = (request, next) => {
	const token = localStorage.getItem("access_token");

	// invalid token, no need to send it
	if (!token || tokenExpired(token)) {
		return next(request);
	}

	request = request.clone({
		setHeaders: {
			Authorization: `Bearer ${token}`,
		},
	});
	return next(request);
};
