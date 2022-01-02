import { factory } from "../factory";
import { ValueRule } from "../util";

export const makeSquareAttrRule = (lazyNameRule: (f: typeof factory) => ValueRule<string>) => {
    return factory
        .withName("squareAttr")
        .sequence(c => c
            .and(r => r.seqEqual("["))
            .and(lazyNameRule, "name")
            .and(r => r.seqEqual("=\""))
            .and(r => r
                .asSlice(r => r
                    // eslint-disable-next-line no-irregular-whitespace
                    .oneOrMore(r => r.regExp(/^[^ 　\t\r\n\]"]/))
                )
            , "value")
            .and(r => r.seqEqual("\"]"))
            .action(({ name, value }) => {
                return [name, value] as [name: string, value: string];
            })
        );
};

export const $squareAttr = makeSquareAttrRule(r => r
    .asSlice(r => r
        .oneOrMore(r => r
            // eslint-disable-next-line no-irregular-whitespace
            .regExp(/^[^ 　\t\r\n\]=]/),
        ),
    ),
);

export default $squareAttr;
