import factory from "../factory";
import { WithErrorRule } from "../util";
import { $kanjiDigits } from "./lexical";


export const $articleGroupNum: WithErrorRule<{
    typeChar: "編" | "章" | "節" | "款" | "目",
    text: string,
}> = factory
    .withName("articleGroupNum")
    .choice(c => c
        .or(r => r
            .sequence(c => c
                .and(r => r.seqEqual("第"))
                .and(() => $kanjiDigits)
                .and(r => r.oneOf(["編", "章", "節", "款", "目", "章"] as const), "typeChar")
                .and(r => r
                    .zeroOrMore(r => r
                        .sequence(c => c
                            .and(r => r.oneOf("のノ"))
                            .and(() => $kanjiDigits)
                        )
                    )
                )
                .action(({ text, typeChar }) => {
                    return {
                        value: {
                            typeChar,
                            text: text(),
                        },
                        errors: [],
                    };
                })
            )
        )
    )
    ;

export default $articleGroupNum;
