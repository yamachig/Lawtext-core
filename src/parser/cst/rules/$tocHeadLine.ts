import factory from "../factory";
import { newStdEL } from "../../../law/std";
import $indents from "./$indents";
import { TOCHeadLine } from "../../../node/cst/line";
import { __Text } from "../../../node/control";
import { $_EOL } from "./lexical";
import { WithErrorRule } from "../util";


export const $tocHeadLine: WithErrorRule<TOCHeadLine> = factory
    .withName("tocHeadLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .sequence(s => s
                // eslint-disable-next-line no-irregular-whitespace
                .and(r => r.regExp(/^目[ 　\t]*次/), "label")
                .action(({ label }) => {
                    return {
                        content: newStdEL(
                            "TOC",
                            {},
                            [newStdEL("TOCLabel", {}, [new __Text(label)])],
                        ),
                        contentText: label,
                    };
                })
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, contentStruct, lineEndText }) => {
            const errors = indentsStruct.errors;
            return {
                value: new TOCHeadLine(
                    range(),
                    indentsStruct.value.indentDepth,
                    indentsStruct.value.indentTexts,
                    contentStruct.contentText,
                    lineEndText,
                ),
                errors,
            };
        })
    )
    ;

export default $tocHeadLine;
