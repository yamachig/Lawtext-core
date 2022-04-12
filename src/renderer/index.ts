"use strict";

import JSZip from "jszip";
import * as nunjucks from "nunjucks";
import { nunjucksPrecompiled } from "./templates";
import { EL, JsonEL, loadEl } from "../node/el";


const restructureTable = (table: JsonEL): JsonEL => {
    const newTableChildren: Array<JsonEL | string> = [];
    const rowspanState: Record<number, number> = {};
    const colspanValue: Record<number, number> = {};
    for (const row of table.children) {
        if (typeof row === "string") continue;
        if (row.tag !== "TableRow") {
            newTableChildren.push(row);
            continue;
        }
        const newRowChildren: Array<JsonEL | string> = [];
        let c = 0;
        let ci = 0;
        while (true) {

            const rss = rowspanState[c] || 0;
            if (rss) {
                const colspan = colspanValue[c] || 0;
                newRowChildren.push({
                    tag: "TableColumnMerged",
                    attr: colspan ? {
                        colspan: `${colspan}`,
                    } : {},
                    children: [],
                });
                rowspanState[c] = rss - 1;
                if (colspan) {
                    c += colspan - 1;
                }
                c += 1;
                continue;
            }

            if (ci >= row.children.length) {
                break;
            }

            const column = row.children[ci] as JsonEL;
            newRowChildren.push(column);
            if (column.tag !== "TableColumn") {
                ci += 1;
                continue;
            }

            {
                const colspan = Number(column.attr.colspan || 0);
                if (column.attr.rowspan !== undefined) {
                    const rowspan = Number(column.attr.rowspan);
                    rowspanState[c] = rowspan - 1;
                    colspanValue[c] = colspan;
                    if (colspan) {
                        c += colspan - 1;
                    }
                }
                c += 1;
                ci += 1;
            }
        }

        newTableChildren.push({
            tag: row.tag,
            attr: row.attr,
            children: newRowChildren,
        });
    }

    const ret = {
        tag: table.tag,
        attr: table.attr,
        children: newTableChildren,
    };

    return ret;
};

class Context {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data: { [key: string]: any };
    constructor() {
        this.data = {};
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public get(key: string): any {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.data[key];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public set(key: string, value: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.data[key] = value;
        return "";
    }
}

const env = new nunjucks.Environment(new nunjucks.PrecompiledLoader(nunjucksPrecompiled));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const render = (templateName: string, context?: { [key: string]: any }): string => {
    let ctx = {
        restructure_table: restructureTable,
        print: console.log,
        context: new Context(),
    };
    ctx = Object.assign(ctx, context);
    let rendered = env.render(templateName, ctx);
    if (templateName === "lawtext.j2") {
        rendered = rendered.replace(/(\r?\n\r?\n)(?:\r?\n)+/g, "$1");
    }
    return rendered;
};

export const renderDocxAsync = (law: JsonEL): Promise<Uint8Array | Buffer> => {
    return new JSZip().file(
        "[Content_Types].xml",
        render("docx/[Content_Types].xml"),
    ).file(
        "_rels/.rels",
        render("docx/_rels/.rels"),
    ).file(
        "word/_rels/document.xml.rels",
        render("docx/word/_rels/document.xml.rels"),
    ).file(
        "word/document.xml",
        render("docx/word/document.xml", { law }),
    ).file(
        "word/styles.xml",
        render("docx/word/styles.xml"),
    ).generateAsync({
        type: JSZip.support.nodebuffer ? "nodebuffer" : "uint8array",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9,
        },
    });
};

export const renderXml = (law: JsonEL | EL, withControlEl = false): string => {
    const xml = `\
<?xml version="1.0" encoding="utf-8"?>
${(law instanceof EL ? law : loadEl(law)).outerXML(withControlEl)}
`;
    return xml;
};


export const renderHtml = (el: JsonEL, context?: { [key: string]: unknown }): string => {
    if (el.tag === "Law") {
        return render("html.html", { law: el, ...context });
    } else {
        return render("html.html", { elements: [el], ...context });
    }
};

export const renderHtmlfragment = (el: JsonEL, context?: { [key: string]: unknown }): string => {
    if (el.tag === "Law") {
        return render("htmlfragment.html", { law: el, ...context });
    } else {
        return render("htmlfragment.html", { elements: [el], ...context });
    }
};

export const renderElementsFragment = (elements: JsonEL[], context?: { [key: string]: unknown }): string => {
    return render("htmlfragment.html", { elements, ...context });
};
