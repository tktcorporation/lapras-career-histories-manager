import { expect, test } from "bun:test";
import * as utils from "./utils";

test("trimSpaceAndNewLine", () => {
	const str = `
    
    * あいうえお かきくけこ　
    `;
	const result = utils.trimSpaceAndNewLine(str);
	expect(result).toStrictEqual("* あいうえお かきくけこ");
});
