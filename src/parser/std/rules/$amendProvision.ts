import { factory } from "../factory";
import { BlankLine, Line, LineType, OtherLine } from "../../../node/cst/line";
import { makeIndentBlockWithCaptureRule, WithErrorRule } from "../util";
import { isAmendProvision, isAmendProvisionSentence, isAppdxItem, isArticle, isFigStruct, isNewProvision, isTableStruct, newStdEL } from "../../../law/std";
import * as std from "../../../law/std";
import { ErrorMessage } from "../../cst/error";
import { sentencesArrayToColumnsOrSentences } from "./columnsOrSentences";
import CST from "../toCSTSettings";
import { Control, Sentences } from "../../../node/cst/inline";
import { $requireControlParagraphItem, paragraphItemToLines } from "./$paragraphItem";
import $preamble from "./$preamble";
import $articleGroup from "./$articleGroup";
import $article, { articleToLines } from "./$article";
import { assertNever, NotImplementedError } from "../../../util";
import $figStruct, { figStructToLines } from "./$figStruct";
import { isParagraphItem } from "../../out_ std --copy/lawUtil";
import $tableStruct, { tableStructToLines } from "./$tableStruct";
import { $appdx, $appdxFig, $appdxFormat, $appdxNote, $appdxStyle, $appdxTable, appdxItemToLines } from "./$appdxItem";

interface AmendProvisionToLinesOptions {
    withControl?: boolean,
}

export const amendProvisionToLines = (
    amendProvision: std.AmendProvision,
    indentTexts: string[],
    options?: AmendProvisionToLinesOptions,
): Line[] => {
    const {
        withControl,
    } = {
        withControl: false,
        ...options,
    };

    const lines: Line[] = [];

    const newProvisionsIndentTexts = [...indentTexts, CST.INDENT];

    for (const child of amendProvision.children) {

        if (isAmendProvisionSentence(child)) {
            lines.push(new OtherLine(
                null,
                indentTexts.length,
                indentTexts,
                withControl ? [
                    new Control(
                        ":amend-provision:",
                        null,
                        "",
                        null,
                    )
                ] : [],
                [
                    new Sentences(
                        "",
                        null,
                        [],
                        child.children,
                    ),
                ],
                CST.EOL,
            ));

        } else if (isNewProvision(child)) {
            for (const cc of child.children) {
                if (isArticle(cc)) {
                    lines.push(...articleToLines(cc, newProvisionsIndentTexts));
                } else if (isParagraphItem(cc)) {
                    lines.push(...paragraphItemToLines(cc, newProvisionsIndentTexts));
                } else if (isTableStruct(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...tableStructToLines(cc, newProvisionsIndentTexts));
                } else if (isFigStruct(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...figStructToLines(cc, newProvisionsIndentTexts));
                } else if (isAppdxItem(cc)) {
                    lines.push(new BlankLine(null, CST.EOL));
                    lines.push(...appdxItemToLines(cc, newProvisionsIndentTexts));
                } else if (isAmendProvision(cc)) {
                    lines.push(...amendProvisionToLines(cc, newProvisionsIndentTexts, { withControl: true }));
                }
                else { throw new NotImplementedError(cc.tag); }
            }

        }
        else { assertNever(child); }
    }

    return lines;
};


const $newProvisionsBlock = makeIndentBlockWithCaptureRule(
    "$newProvisionsBlock",
    (factory
        .choice(c => c
        // .or(() => $lawTitle) // TODO: Implement
            .or(() => $preamble)
        // .or(() => $toc) // TODO: Implement
            .or(() => $articleGroup)
            .or(() => $article)
            .or(() => $requireControlParagraphItem)
            .or(() => $figStruct)
            .or(() => $tableStruct)
        // .or(() => $list) // TODO: Implement
            .or(() => $appdxFig)
            .or(() => $appdxTable)
            .or(() => $appdxStyle)
            .or(() => $appdxNote)
            .or(() => $appdxFormat)
            .or(() => $appdx)
            .orSequence(s => s
                .andOmit(r => r
                    .nextIs(r => r
                        .oneMatch(({ item }) => {
                            if (
                                item.type === LineType.OTH
                                && item.line.controls.some(c => c.control === ":amend-provision:")
                            ) {
                                return item;
                            } else {
                                return null;
                            }
                        })
                    )
                )
                .and(() => $amendProvision)
            )
        // .or(() => $structItem) // TODO: Implement
        )
    ),
);


export const $amendProvision: WithErrorRule<std.AmendProvision> = factory
    .withName("amendProvision")
    .sequence(s => s
        .and(r => r
            .oneMatch(({ item }) => {
                if (
                    item.type === LineType.OTH
                    && item.line.type === LineType.OTH
                ) {
                    return newStdEL(
                        "AmendProvisionSentence",
                        {},
                        sentencesArrayToColumnsOrSentences(item.line.sentencesArray),
                        item.line.sentencesArrayRange
                    );
                } else {
                    return null;
                }
            })
        , "amendProvisionSentence")
        .and(r => r
            .zeroOrOne(() => $newProvisionsBlock)
        , "newProvisions")
        .action(({ amendProvisionSentence, newProvisions }) => {

            const children: std.AmendProvision["children"] = [];
            const errors: ErrorMessage[] = [];

            children.push(amendProvisionSentence);

            if (newProvisions) {
                children.push(newStdEL(
                    "NewProvision",
                    {},
                    newProvisions.value.map(c => c.value),
                ).setRangeFromChildren());
                errors.push(...newProvisions.errors);
            }


            const amendProvision = newStdEL(
                "AmendProvision",
                {},
                children,
            );
            return {
                value: amendProvision.setRangeFromChildren(),
                errors,
            };
        })
    )
    ;

export default $amendProvision;
