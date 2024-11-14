import { TestBed } from "@angular/core/testing";
import { HttpInterceptorFn } from "@angular/common/http";

import { UnauthorizedInterceptorInterceptor } from "./unauthorized-interceptor.interceptor";

describe("unauthorizedInterceptorInterceptor", () => {
	const interceptor: HttpInterceptorFn = (req, next) =>
		TestBed.runInInjectionContext(() =>
			UnauthorizedInterceptorInterceptor(req, next),
		);

	beforeEach(() => {
		TestBed.configureTestingModule({});
	});

	it("should be created", () => {
		expect(interceptor).toBeTruthy();
	});
});
