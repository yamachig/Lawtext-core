import React from "react";
import { EL, JsonEL, loadEl } from "../node/el";
import * as std from "../law/std";
import { HTMLLaw } from "./rules/law";
import htmlCSS from "./rules/htmlCSS";
import { renderToStaticMarkup } from "./rules/common";
import { HTMLAnyELs } from "./rules/any";

export const renderHTML = (elOrJsonEL: JsonEL | EL): string => {
    const rendered = renderHTMLfragment(elOrJsonEL);
    const html = /*html*/`\
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
${htmlCSS}
</style>
</head>
<body>
${rendered}
</body>
</html>
`;
    return html;
};

export const renderHTMLfragment = (elOrJsonEL: JsonEL | EL): string => {
    const el = loadEl(elOrJsonEL);
    const element = std.isLaw(el)
        ? <HTMLLaw el={el} indent={0} htmlOptions={{}} />
        : <HTMLAnyELs els={[el as std.StdEL | std.__EL]} indent={0} htmlOptions={{}}/>;
    const rendered = renderToStaticMarkup(element);
    return rendered;
};

export const renderElementsFragment = (elements: (JsonEL | EL)[]): string => {
    return elements.map(renderHTMLfragment).join("\n");
};

export default renderHTML;