import { Law, newStdEL } from "@coresrc/std_law";
import { eras, parseKanjiNum, getLawtype } from "@coresrc/util";
import { factory, ValueRule } from "../common";
import { $INLINE, $ROUND_PARENTHESES_INLINE } from "../inline";
import { $INDENT, $DEDENT, $__, $NEWLINE } from "../lexical";
import { $appdx } from "./appdx";
import { $appdx_fig } from "./appdxFig";
import { $appdx_format } from "./appdxFormat";
import { $appdx_note } from "./appdxNote";
import { $appdx_style } from "./appdxStyle";
import { $appdx_table } from "./appdxTable";
import { $article, $article_title } from "./article";
import { $article_group } from "./articleGroup";
import { $no_name_paragraph_item } from "./paragraphItem";
import { $suppl_provision } from "./supplProvision";
import { $toc, $toc_label } from "./toc";


export const $law: ValueRule<Law> = factory
    .action(r => r
        .sequence(c => c
            .and(r => r.zeroOrOne(() => $law_title), "law_title")
            .and(r => r
                .zeroOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .choice(c => c
                                    .or(r => r.seqEqual(":前文:"))
                                    .or(r => r.seqEqual(":Preamble:")),
                                ),
                            )
                            .and(() => $NEWLINE)
                            .and(r => r
                                .oneOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $INLINE, "inline")
                                            .and(() => $NEWLINE),
                                        )
                                    , (({ inline }) => {
                                        return newStdEL("Paragraph", {}, [
                                            newStdEL("ParagraphNum"),
                                            newStdEL("ParagraphSentence", {}, [newStdEL("Sentence", {}, inline)]),
                                        ]);
                                    }),
                                    ),
                                )
                            , "target")
                            .and(r => r.oneOrMore(() => $NEWLINE)),
                        )
                    , (({ target }) => {
                        return newStdEL("Preamble", {}, target);
                    }),
                    ),
                )
            , "preambles1")
            .and(r => r
                .zeroOrOne(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(() => $INDENT)
                            .and(() => $INDENT)
                            .and(r => r.oneOrMore(() => $enact_statement), "target")
                            .and(() => $DEDENT)
                            .and(() => $DEDENT),
                        )
                    , (({ target }) => {
                        return target;
                    }),
                    ),
                )
            , "enact_statements")
            .and(r => r.zeroOrOne(() => $toc), "toc")
            .and(r => r
                .zeroOrMore(r => r
                    .action(r => r
                        .sequence(c => c
                            .and(r => r
                                .choice(c => c
                                    .or(r => r.seqEqual(":前文:"))
                                    .or(r => r.seqEqual(":Preamble:")),
                                ),
                            )
                            .and(() => $NEWLINE)
                            .and(r => r
                                .oneOrMore(r => r
                                    .action(r => r
                                        .sequence(c => c
                                            .and(() => $INLINE, "inline")
                                            .and(() => $NEWLINE),
                                        )
                                    , (({ inline }) => {
                                        return newStdEL("Paragraph", {}, [
                                            newStdEL("ParagraphNum"),
                                            newStdEL("ParagraphSentence", {}, [newStdEL("Sentence", {}, inline)]),
                                        ]);
                                    }),
                                    ),
                                )
                            , "target")
                            .and(r => r.oneOrMore(() => $NEWLINE)),
                        )
                    , (({ target }) => {
                        return newStdEL("Preamble", {}, target);
                    }),
                    ),
                )
            , "preambles2")
            .and(() => $main_provision, "main_provision")
            .and(r => r.zeroOrMore(() => $appdx_item), "appdx_items"),
        )
    , (({ law_title, preambles1, enact_statements, toc, preambles2, main_provision, appdx_items }) => {
        const law = newStdEL("Law", { Lang: "ja" } as Law["attr"]);
        const law_body = newStdEL("LawBody");

        if (law_title !== null) {
            if (law_title.law_num) {
                law.append(newStdEL("LawNum", {}, [law_title.law_num]));

                const m = law_title.law_num.match(/^(明治|大正|昭和|平成|令和)([一二三四五六七八九十]+)年(\S+?)(?:第([一二三四五六七八九十百千]+)号)?$/);
                if (m) {
                    const [era, year, law_type, num] = m.slice(1);

                    if (era in eras) law.attr.Era = eras[era as keyof typeof eras];

                    const year_val = parseKanjiNum(year);
                    if (year_val !== null) law.attr.Year = year_val;

                    const law_type_val = getLawtype(law_type);
                    if (law_type_val !== null) law.attr.LawType = law_type_val;

                    if (num) {
                        const num_val = parseKanjiNum(num);
                        if (num_val !== null) law.attr.Num = num_val;
                        else law.attr.Num = "";
                    } else {
                        law.attr.Num = "";
                    }
                }
            }

            if (law_title.law_title) {
                law_body.append(newStdEL("LawTitle", {}, [law_title.law_title]));
            }
        }

        law.append(law_body);

        law_body.extend(preambles1);
        law_body.extend(enact_statements || []);
        if (toc) law_body.append(toc);
        law_body.extend(preambles2);
        law_body.append(main_provision);
        law_body.extend(appdx_items);

        return law;
    }),
    )
    ;

export const $law_title = factory
    .withName("law_title")
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.asSlice(() => $INLINE), "law_title")
                    .and(() => $NEWLINE)
                    .and(() => $ROUND_PARENTHESES_INLINE, "law_num")
                    .and(r => r.oneOrMore(() => $NEWLINE)),
                )
            , (({ law_title, law_num }) => {
                return {
                    law_title: law_title,
                    law_num: law_num.content,
                };
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r.asSlice(() => $INLINE), "law_title")
                    .and(r => r.oneOrMore(() => $NEWLINE)),
                )
            , (({ law_title }) => {
                return {
                    law_title: law_title,
                    law_num: undefined,
                };
            }),
            ),
        ),
    )
    ;

export const $enact_statement = factory
    .withName("enact_statement")
    .action(r => r
        .sequence(c => c
            .and(r => r.nextIsNot(() => $__))
            .and(r => r.nextIsNot(() => $toc_label))
            .and(r => r.nextIsNot(() => $article_title))
            .and(() => $INLINE, "target")
            .and(r => r.oneOrMore(() => $NEWLINE)),
        )
    , (({ target }) => {
        return newStdEL("EnactStatement", {}, target);
    }),
    )
    ;


export const $main_provision = factory
    .choice(c => c
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(r => r
                        .oneOrMore(r => r
                            .choice(c => c
                                .or(() => $article)
                                .or(() => $article_group),
                            ),
                        )
                    , "children"),
                )
            , (({ children }) => {
                return newStdEL("MainProvision", {}, children);
            }),
            ),
        )
        .or(r => r
            .action(r => r
                .sequence(c => c
                    .and(() => $no_name_paragraph_item, "paragraph"),
                )
            , (({ paragraph }) => {
                return newStdEL("MainProvision", {}, [paragraph]);
            }),
            ),
        ),
    )
    ;


export const $appdx_item = factory
    .choice(c => c
        .or(() => $appdx)
        .or(() => $appdx_table)
        .or(() => $appdx_style)
        .or(() => $appdx_format)
        .or(() => $appdx_fig)
        .or(() => $appdx_note)
        .or(() => $suppl_provision),
    )
    ;


export const rules = {
    law: $law,
    law_title: $law_title,
    enact_statement: $enact_statement,
    main_provision: $main_provision,
    appdx_item: $appdx_item,
};
