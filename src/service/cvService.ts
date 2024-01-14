import { parse, serialize } from "cookie-es";
import { Result, err, ok } from "neverthrow";
import { ofetch } from "ofetch";
import { z } from "zod";
import { createError } from "../error";
import type { GetAuthorizedProps, GetServiceProps } from "./service";

const getLaprasCv =
	(hostUrl: string) =>
	(props: GetAuthorizedProps) =>
	async (): Promise<
		Result<
			{
				jobSummary: string;
				experienceAndSkill: string;
			},
			Error
		>
	> => {
		const response = await ofetch(`${hostUrl}/api/lapras_cv/`, {
			method: "GET",
			credentials: "include",
			redirect: "error",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json, text/plain, */*",
				Cookie: props.cookies,
			},
			responseType: "json",
		});

		const responseType = z.object({
			error: z.boolean(),
			lapras_cv: z.object({
				job_summary: z.string(),
				experience_and_skill: z.string(),
			}),
		});
		const parsedResponse = responseType.parse(response);
		if (parsedResponse instanceof Error) {
			return err(parsedResponse);
		}
		return ok({
			jobSummary: parsedResponse.lapras_cv.job_summary,
			experienceAndSkill: parsedResponse.lapras_cv.experience_and_skill,
		});
	};

const postLaprasCv =
	({ browser, hostUrl }: GetServiceProps) =>
	(authProps: GetAuthorizedProps) =>
	async (props: { jobSummary?: string; experienceAndSkill?: string }): Promise<
		Result<void, Error>
	> => {
		if (!props.jobSummary && !props.experienceAndSkill) {
			return err(
				createError("jobSummary か experienceAndSkill のどちらかは必須です"),
			);
		}

		const page = await browser.newPage();
		await page.goto(`${hostUrl}/cv`, {
			waitUntil: "networkidle0",
		});

		const parsedCookies = parse(
			await page.cookies().then((cookies) => {
				return cookies
					.map((cookie) => `${cookie.name}=${cookie.value}`)
					.join("; ");
			}),
		);
		const csrftoken = parsedCookies.csrftoken;
		if (!csrftoken) {
			return err(createError("csrftoken が取得できませんでした"));
		}

		const requestBody = {
			...(props.jobSummary && { job_summary: props.jobSummary }),
			...(props.experienceAndSkill && {
				experience_and_skill: props.experienceAndSkill,
			}),
		};

		const result = await page.evaluate(
			async (props: { csrftoken: string; body: typeof requestBody }) => {
				const r = await fetch("/api/lapras_cv/", {
					method: "POST",
					headers: {
						accept: "application/json, text/plain, */*",
						"content-type": "application/json",
						"x-csrftoken": props.csrftoken,
					},
					body: JSON.stringify(props.body),
				});
				if (!r.ok) {
					return {
						error: `fetch error: ${r.status} ${r.statusText}`,
					};
				}
				return {
					response: await r.json(),
				};
			},
			{ csrftoken, body: requestBody },
		);
		if (result.error) {
			return err(createError(result.error));
		}
		console.log(`fetch result ${JSON.stringify(result.response)}`);

		return ok(undefined);
	};

/**
 * 内容に変更があった場合は更新する
 * 変更がなかった場合は何もしない
 */
const updateJobSummaryAndExperienceAndSkill =
	(getServiceProps: GetServiceProps) =>
	(authProps: GetAuthorizedProps) =>
	async (props: { jobSummary: string; experienceAndSkill: string }): Promise<
		Result<
			{
				status: {
					jobSummaryUpdated: boolean;
					experienceAndSkillUpdated: boolean;
				};
			},
			Error
		>
	> => {
		const laprasCvResult = await getLaprasCv(getServiceProps.hostUrl)(
			authProps,
		)();
		if (laprasCvResult.isErr()) {
			return err(createError(laprasCvResult.error));
		}
		const {
			jobSummary: currentJobSummary,
			experienceAndSkill: currentExperienceAndSkill,
		} = laprasCvResult.value;

		const newJobSummary =
			currentJobSummary !== props.jobSummary ? props.jobSummary : undefined;
		const newExperienceAndSkill =
			currentExperienceAndSkill !== props.experienceAndSkill
				? props.experienceAndSkill
				: undefined;
		if (!newJobSummary && !newExperienceAndSkill) {
			return ok({
				status: {
					jobSummaryUpdated: false,
					experienceAndSkillUpdated: false,
				},
			});
		}
		const postResult = await postLaprasCv(getServiceProps)(authProps)({
			jobSummary: newJobSummary,
			experienceAndSkill: newExperienceAndSkill,
		});
		if (postResult.isErr()) {
			return err(createError(postResult.error));
		}
		return ok({
			status: {
				jobSummaryUpdated: newJobSummary !== undefined,
				experienceAndSkillUpdated: newExperienceAndSkill !== undefined,
			},
		});
	};

export { updateJobSummaryAndExperienceAndSkill };
