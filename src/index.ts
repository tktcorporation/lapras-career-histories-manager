import puppeteer, { Browser } from "puppeteer";
import { CAREER } from "../CAREER";
import { createError } from "./error";
import { getService } from "./service/service";

// bun で環境変数取得
const EMAIL = process.env.MY_EMAIL_ADDRESS;
const PASSWORD = process.env.MY_PASSWORD;

const getCredentials = () => {
	if (EMAIL === undefined || PASSWORD === undefined) {
		throw new Error("環境変数にメールアドレスとパスワードを設定してください");
	}
	return { email: EMAIL, password: PASSWORD };
};
const getHostUrl = () => {
	return "https://lapras.com";
};

const main = async () => {
	const browser: Browser = await puppeteer.launch({
		headless: "new",
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage",
			"--disable-gpu",
		],
	});
	try {
		// 更新情報の取得
		// まずは.tsから取得形で書いてみるが、あとからyml等に移行する可能性あり
		const newJobSummary = CAREER.jobSummary;
		const newExperienceAndSkill = CAREER.experienceAndSkill;

		const hostUrl = getHostUrl();
		const service = getService({
			browser,
			hostUrl,
		});

		// ログイン
		const { email, password } = getCredentials();
		const cookieIncludeLoginInfo =
			await service.getUnAuthorized.getCookieIncludeLoginInfo({
				email,
				password,
			});

		const authorizedService = service.getAuthorized({
			cookies: cookieIncludeLoginInfo,
		});

		const updateResult =
			await authorizedService.updateJobSummaryAndExperienceAndSkill({
				jobSummary: newJobSummary,
				experienceAndSkill: newExperienceAndSkill,
			});

		if (updateResult.isErr()) {
			throw createError(updateResult.error);
		}
		console.log(`update result ${JSON.stringify(updateResult.value.status)}`);

		await browser.close();
		console.log("success");
	} catch (e) {
		console.error(e);
	} finally {
		await browser.close();
	}
};

await main();