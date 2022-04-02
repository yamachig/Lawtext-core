import factory from "../factory";
import $indents from "./$indents";
import { ParagraphItemLine } from "../../../node/cst/line";
import { $__, $_EOL } from "./lexical";
import $columnsOrSentences from "./$sentencesArray";
import makeRangesRule from "./makeRangesRule";
import $paragraphItemTitle, { $stdItemTitle, $stdParagraphNum, $stdSubitem1Title, $stdSubitem2Title, $stdSubitem3Title } from "./$paragraphItemTitle";
import { WithErrorRule } from "../util";
import { $autoTagControl, $itemControl, $paragraphControl, $subitem10Control, $subitem1Control, $subitem2Control, $subitem3Control, $subitem4Control, $subitem5Control, $subitem6Control, $subitem7Control, $subitem8Control, $subitem9Control } from "./$tagControl";
import { paragraphItemTags } from "../../../law/std";
import { Env, initialEnv } from "../env";
import { MatchResult } from "generic-parser/lib/core";
import { ErrorMessage } from "../error";

export const { $ranges: $paragraphItemRanges } = makeRangesRule(() => $paragraphItemTitle);
export const { $ranges: $stdParagraphRange } = makeRangesRule(() => $stdParagraphNum);
export const { $ranges: $stdItemRange } = makeRangesRule(() => $stdItemTitle);
export const { $ranges: $stdItem1Range } = makeRangesRule(() => $stdSubitem1Title);
export const { $ranges: $stdItem2Range } = makeRangesRule(() => $stdSubitem2Title);
export const { $ranges: $stdItem3Range } = makeRangesRule(() => $stdSubitem3Title);

export const paragraphItemTitleRule = {
    Paragraph: $stdParagraphRange,
    Item: $stdItemRange,
    Subitem1: $stdItem1Range,
    Subitem2: $stdItem2Range,
    Subitem3: $stdItem3Range,
} as const;

export const paragraphItemTitleMatch = Object.fromEntries(Object.entries(paragraphItemTitleRule).map(([tag, $rule]) => {
    const env = initialEnv({});
    return [
        tag,
        (target: string) => $rule.match(0, target, env),
    ];
})) as {[tag in keyof typeof paragraphItemTitleRule]: (target: string) => MatchResult<{
    value: [string, string][];
    errors: ErrorMessage[];
}, Env>};


export const $paragraphItemLine: WithErrorRule<ParagraphItemLine> = factory
    .withName("paragraphItemLine")
    .sequence(s => s
        .and(() => $indents, "indentsStruct")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(s => s
                    .and(r => r
                        .choice(c => c
                            .or(() => $paragraphControl)
                            .or(() => $itemControl)
                            .or(() => $subitem1Control)
                            .or(() => $subitem2Control)
                            .or(() => $subitem3Control)
                            .or(() => $subitem4Control)
                            .or(() => $subitem5Control)
                            .or(() => $subitem6Control)
                            .or(() => $subitem7Control)
                            .or(() => $subitem8Control)
                            .or(() => $subitem9Control)
                            .or(() => $subitem10Control)
                            .orSequence(s => s
                                .and(() => $autoTagControl, "control")
                                .and(r => r
                                    .choice(c => c
                                        .orSequence(s => s
                                            .and(r => r.nextIs(r => r
                                                .sequence(s => s
                                                    .and(() => paragraphItemTitleRule.Paragraph)
                                                    .and(r => r
                                                        .choice(c => c
                                                            .or(() => $__)
                                                            .or(() => $_EOL)
                                                        )
                                                    )
                                                )
                                            ))
                                            .action(() => "Paragraph" as const)
                                        )
                                        .orSequence(s => s
                                            .and(r => r.nextIs(r => r
                                                .sequence(s => s
                                                    .and(() => paragraphItemTitleRule.Item)
                                                    .and(r => r
                                                        .choice(c => c
                                                            .or(() => $__)
                                                            .or(() => $_EOL)
                                                        )
                                                    )
                                                )
                                            ))
                                            .action(() => "Item" as const)
                                        )
                                        .orSequence(s => s
                                            .and(r => r.nextIs(r => r
                                                .sequence(s => s
                                                    .and(() => paragraphItemTitleRule.Subitem1)
                                                    .and(r => r
                                                        .choice(c => c
                                                            .or(() => $__)
                                                            .or(() => $_EOL)
                                                        )
                                                    )
                                                )
                                            ))
                                            .action(() => "Subitem1" as const)
                                        )
                                        .orSequence(s => s
                                            .and(r => r.nextIs(r => r
                                                .sequence(s => s
                                                    .and(() => paragraphItemTitleRule.Subitem2)
                                                    .and(r => r
                                                        .choice(c => c
                                                            .or(() => $__)
                                                            .or(() => $_EOL)
                                                        )
                                                    )
                                                )
                                            ))
                                            .action(() => "Subitem2" as const)
                                        )
                                        .orSequence(s => s
                                            .and(r => r.nextIs(r => r
                                                .sequence(s => s
                                                    .and(() => paragraphItemTitleRule.Subitem3)
                                                    .and(r => r
                                                        .choice(c => c
                                                            .or(() => $__)
                                                            .or(() => $_EOL)
                                                        )
                                                    )
                                                )
                                            ))
                                            .action(() => "Subitem3" as const)
                                        )
                                    )
                                , "tag")
                                .action(({ tag, control }) => {
                                    return { tag, control };
                                })
                            )
                        )
                    )
                )
            )
        , "tagControl")
        .and(r => r
            .sequence(s => s
                .and(() => $paragraphItemRanges, "title")
                .action(({ title, text }) => {
                    return {
                        value: text(),
                        errors: title.errors,
                    };
                })
            )
        , "title")
        .and(r => r
            .zeroOrOne(r => r
                .sequence(c => c
                    .and(() => $__, "midSpace")
                    .and(() => $columnsOrSentences, "columns")
                    .action(({ midSpace, columns }) => {
                        return { midSpace, columns };
                    })
                )
            )
        , "contentStruct")
        .and(() => $_EOL, "lineEndText")
        .action(({ range, indentsStruct, tagControl, title, contentStruct, lineEndText }) => {
            const errors = [
                ...indentsStruct.errors,
                ...title.errors,
                ...(contentStruct?.columns.errors ?? []),
            ];
            const tag = tagControl?.tag ?? paragraphItemTags[indentsStruct.value.indentDepth];
            return {
                value: new ParagraphItemLine(
                    range(),
                    indentsStruct.value.indentDepth,
                    indentsStruct.value.indentTexts,
                    tag,
                    tagControl ? [tagControl.control] : [],
                    title.value,
                    contentStruct?.midSpace ?? "",
                    contentStruct?.columns.value ?? [],
                    lineEndText,
                ),
                errors,
            };
        })
    )
    ;

export default $paragraphItemLine;
