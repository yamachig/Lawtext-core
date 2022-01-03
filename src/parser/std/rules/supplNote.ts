/* eslint-disable no-irregular-whitespace */
import { newStdEL } from "../../../law/std";
import { factory } from "../common";
import { $INLINE } from "../../cst/rules/inline";
import { $_, $NEWLINE } from "../../cst/rules/lexical";


export const $suppl_note = factory
    .withName("suppl_note")
    .action(r => r
        .sequence(c => c
            .and(r => r.seqEqual(":SupplNote:"))
            .and(() => $_)
            .and(() => $INLINE, "inline")
            .and(r => r.oneOrMore(() => $NEWLINE)),
        )
    , (({ inline }) => {
        return newStdEL("SupplNote", {}, inline);
    }),
    )
    ;


export const rules = {
    suppl_note: $suppl_note,
};