import { describe, expect, it } from "vitest";
import { formatTime } from "./clock";

describe("formatTime", () => {
	describe("display format (HH:MM:SS)", () => {
		it("formats 0 seconds as 00:00:00", () => {
			expect(formatTime(0).display).toBe("00:00:00");
		});

		it("formats seconds under a minute", () => {
			expect(formatTime(30).display).toBe("00:00:30");
			expect(formatTime(59).display).toBe("00:00:59");
		});

		it("formats exactly one minute", () => {
			expect(formatTime(60).display).toBe("00:01:00");
		});

		it("formats minutes and seconds", () => {
			expect(formatTime(90).display).toBe("00:01:30");
			expect(formatTime(3599).display).toBe("00:59:59");
		});

		it("formats exactly one hour", () => {
			expect(formatTime(3600).display).toBe("01:00:00");
		});

		it("formats hours, minutes, and seconds", () => {
			expect(formatTime(3661).display).toBe("01:01:01");
			expect(formatTime(7325).display).toBe("02:02:05");
		});
	});

	describe("iso8601 format (PT...)", () => {
		it("formats 0 seconds as PT0S", () => {
			expect(formatTime(0).iso8601).toBe("PT0S");
		});

		it("formats seconds only", () => {
			expect(formatTime(30).iso8601).toBe("PT30S");
			expect(formatTime(59).iso8601).toBe("PT59S");
		});

		it("formats minutes and seconds", () => {
			expect(formatTime(60).iso8601).toBe("PT1M0S");
			expect(formatTime(90).iso8601).toBe("PT1M30S");
		});

		it("formats hours, minutes, and seconds", () => {
			expect(formatTime(3600).iso8601).toBe("PT1H0S");
			expect(formatTime(3661).iso8601).toBe("PT1H1M1S");
		});

		it("omits zero minutes when only hours and seconds", () => {
			expect(formatTime(3605).iso8601).toBe("PT1H5S");
		});
	});
});
