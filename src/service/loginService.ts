import { ofetch } from "ofetch";
import { Browser } from "puppeteer";
import type { GetServiceProps } from "./service";

// ログイン情報を含んだcookieを取得する
const getCookieIncludeLoginInfo =
	({ browser, hostUrl }: GetServiceProps) =>
	async (props: { email: string; password: string }) => {
		const page = await browser.newPage();

		// api 経由でログイン
		await page.goto(`${hostUrl}/login`, {
			waitUntil: "networkidle0",
		});

		await page.type('input[name="email"]', props.email);
		await page.type('input[name="password"]', props.password);
		await page.click("button.skin-primary.flat-button");
		await page.waitForNavigation();

		const cookies = await page.cookies().then((cookies) => {
			return cookies
				.map((cookie) => `${cookie.name}=${cookie.value}`)
				.join("; ");
		});

		const response = await ofetch(`${hostUrl}/api/auth/`, {
			method: "GET",
			credentials: "include",
			redirect: "error",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json, text/plain, */*",
				Cookie: cookies,
			},
			responseType: "json",
		});

		console.log(response);

		return cookies;
	};

const getPuppeteerService = (getServiceProps: GetServiceProps) => {
	return {
		getCookieIncludeLoginInfo: getCookieIncludeLoginInfo(getServiceProps),
	};
};

export { getPuppeteerService };
