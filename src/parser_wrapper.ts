"use strict";

import * as analyzer from "./analyzer";
import * as parser from "./parser";
import * as util from "./util";

const lex = (text: string): [string, { [key: number]: number }, number] => {

    const lines = text.split(/\r?\n/);
    const linesCount = lines.length;
    const replacedLines: string[] = [];
    let indentDepth = 0;
    const indentMemo: { [key: number]: number } = {};
    // eslint-disable-next-line no-irregular-whitespace
    const reIndent = /^(?: {2}|　|\t)(?!- |-$|[ 　\t]*(?:第[一二三四五六七八九十百千]+[編章節款目章]([^。]|。[^。])*$|[附付]\s+則[^。]*$|別表[^。]*$))/;
    // eslint-disable-next-line no-irregular-whitespace
    const reForceDedentParentheses = /^(?: {2}|　|\t)[(（][^)）]*[)）][ 　\t]*$/;
    // eslint-disable-next-line no-irregular-whitespace
    const reIndentInToc = /^(?: {2}|　|\t)/;
    let inToc = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (/^\s*$/.exec(line)) {
            inToc = false;
            replacedLines.push(line);
            continue;
        }

        if (/^\S*目次$/.exec(line)) {
            inToc = true;
        }

        let forceDedent = false;
        if (reForceDedentParentheses.exec(line)) {
            forceDedent = true;
        }

        const indents: string[] = [];
        let pos = 0;

        if (!forceDedent) {
            while (true) {
                const match = (inToc ? reIndentInToc : reIndent).exec(line.slice(pos));
                if (!match) break;
                const indent = match[0];
                pos += indent.length;
                indents.push(indent);
            }
        }

        let replacedLine = "";
        if (indentDepth <= indents.length) {
            for (let j = indentDepth; j < indents.length; j++) {
                const indent = indents[j];
                replacedLine += `<INDENT str="${indent}">`;
            }
        } else {
            for (let j = 0; j < (indentDepth - indents.length); j++) {
                replacedLine += "<DEDENT>";
            }
        }
        replacedLine += line.slice(pos);

        replacedLines.push(replacedLine);

        indentDepth = indents.length;
        indentMemo[i + 1] = indentDepth;
    }
    if (0 < indentDepth) {
        let replacedLine = "";
        for (let j = 0; j < indentDepth; j++) {
            replacedLine += "<DEDENT>";
        }
        replacedLines.push(replacedLine);
    }

    const replacedText = replacedLines.join("\n");

    return [replacedText, indentMemo, linesCount];
};


export const parse = (text: string, options: Record<string, unknown> = {}): util.EL => {

    // console.error("\\\\\\\\\\ parse start \\\\\\\\\\");
    // let t0 = (new Date()).getTime();

    const [lexed, indentMemo /**/] = lex(text);
    // console.error(lexed);
    try {
        options = Object.assign({ indentMemo, startRule: "start" }, options);
        const parsed = parser.parse(lexed, options);

        // let t1 = (new Date()).getTime();
        // console.error(`/////  parse end  /////`);
        // console.error(`( ${Math.round((t1 - t0) / lines_count * 1000)} μs/line  =  ${t1 - t0} ms / ${lines_count} lines )`);
        return parsed;
    } catch (e) {
        console.error("##### parse error #####");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (e.location) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
            console.error(`${e.name} at line ${e.location.start.line} column ${e.location.start.column}: ${e.message}`);
            // console.error(`${JSON.stringify(e, null, 4)}`);
        }
        throw (e);
    }
};

export const analyze = (law: util.EL): analyzer.Analysis => {

    // console.error("\\\\\\\\\\ analyze start \\\\\\\\\\");
    // let t0 = (new Date()).getTime();
    const analysis = analyzer.analyze(law);
    // let t1 = (new Date()).getTime();
    // console.error(`/////  analyze end  /////`);
    // console.error(`(${t1 - t0} ms total)`);
    return analysis;
};
