/**
 * 先頭、末尾の空白、改行を削除する
 */
export const trimSpaceAndNewLine = (str: string): string => {
	return str.replace(/^[\s　]+|[\s　]+$/g, "");
};
