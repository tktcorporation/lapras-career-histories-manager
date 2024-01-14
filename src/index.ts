import puppeteer, { Browser } from "puppeteer";
import { CAREER } from "../CAREER";
import { createError } from "./error";
import { getService } from "./service/service";
import * as utils from "./utils";

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
		const newJobSummary = utils.trimSpaceAndNewLine(CAREER.jobSummary);
		const newExperienceAndSkill = utils.trimSpaceAndNewLine(
			CAREER.experienceAndSkill,
		);

		const hostUrl = getHostUrl();
		const service = getService({
			browser,
			hostUrl,
		});

		// ログイン
		const { email, password } = getCredentials();
		const cookieIncludeLoginInfo =
			await service.getUnAuthorized.loginAndGetCookies({
				email,
				password,
			});
		console.log("login success");

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
		process.exit(1);
	} finally {
		await browser.close();
	}
};

await main();
