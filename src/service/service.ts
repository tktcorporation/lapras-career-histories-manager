import type { Browser } from "puppeteer";
import { updateJobSummaryAndExperienceAndSkill } from "./cvService";
import { getPuppeteerService } from "./loginService";

const getUnAuthorized = (getServiceProps: GetServiceProps) => {
	const puppeteerService = getPuppeteerService(getServiceProps);
	return {
		loginAndGetCookies: puppeteerService.loginAndGetCookies,
	};
};
interface GetAuthorizedProps {
	cookies: string;
}
const getAuthorized =
	(getServiceProps: GetServiceProps) => (props: GetAuthorizedProps) => {
		return {
			updateJobSummaryAndExperienceAndSkill:
				updateJobSummaryAndExperienceAndSkill(getServiceProps)(props),
		};
	};

interface GetServiceProps {
	browser: Browser;
	hostUrl: string;
}
const getService = (props: GetServiceProps) => {
	return {
		getUnAuthorized: getUnAuthorized(props),
		getAuthorized: getAuthorized(props),
	};
};

export type { GetAuthorizedProps, GetServiceProps };
export { getService };
