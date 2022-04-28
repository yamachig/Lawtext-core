import { WithErrorValue } from "../../std/util";
import factory from "../factory";
import { ValueRule, WithErrorRule } from "../util";

export type RangeMaker<TPointer, TRange> = (
    from: TPointer,
    midText: {text: string, range: [number, number]} | null,
    to: TPointer | null,
    trailingText: {text: string, range: [number, number]} | null,
    range: [number, number],
) => TRange;

const simpleRangeMaker = <TPointer>(
    from: TPointer,
    midText: {text: string, range: [number, number]} | null,
    to: TPointer | null,
) => {
    void midText;
    return [from, to ?? from] as [TPointer, TPointer];
};

export type RangesMaker<TRange, TRanges> = (
    first: WithErrorValue<TRange>,
    midText: {text: string, range: [number, number]} | null,
    rest: WithErrorValue<TRanges> | null,
    range: [number, number],
) => WithErrorValue<TRanges>;

const simpleRangesMaker = <TPointer>(
    first: WithErrorValue<[TPointer, TPointer]>,
    midText: {text: string, range: [number, number]} | null,
    rest: WithErrorValue<[TPointer, TPointer][]> | null,
) => {
    void midText;
    return {
        value: [first.value, ...(rest?.value ?? [])],
        errors: [...first.errors, ...(rest?.errors ?? [])],
    };
};

export const makeRangesRule = <TPointer, TRange = [TPointer, TPointer], TRanges = [TPointer, TPointer][]>(
    lazyPointerRule: () => ValueRule<TPointer>,
    rangeMaker: RangeMaker<TPointer, TRange> = simpleRangeMaker as unknown as RangeMaker<TPointer, TRange>,
    rangesMaker: RangesMaker<TRange, TRanges> = simpleRangesMaker as unknown as RangesMaker<TRange, TRanges>,
) => {
    const $ranges: WithErrorRule<TRanges> = factory
        .withName("ranges")
        .choice(c => c
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "first")
                    .and(r => r
                        .sequence(s => s
                            .and(r => r
                                .choice(c => c
                                    .or(r => r.seqEqual("、"))
                                    .or(r => r.seqEqual("及び"))
                                    .or(r => r.seqEqual("および"))
                                    .or(r => r.regExp(/^及(?!至)/))
                                    .or(r => r.seqEqual("並びに"))
                                    .or(r => r.seqEqual("ならびに"))
                                    .or(r => r.seqEqual("又は"))
                                    .or(r => r.seqEqual("または"))
                                    .or(r => r.seqEqual("若しくは"))
                                    .or(r => r.seqEqual("もしくは"))
                                )
                            )
                            .action(({ text, range }) => ({ text: text(), range: range() }))
                        )
                    , "midText")
                    .and(() => $ranges, "rest")
                    .action(({ first, midText, rest, range }) => {
                        return rangesMaker(first, midText, rest, range());
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(() => $range, "singleRange")
                    .action(({ singleRange, range }) => {
                        return rangesMaker(singleRange, null, null, range());
                    })
                )
            )
        )
        ;

    const $range: WithErrorRule<TRange> = factory
        .withName("range")
        .choice(c => c
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "from")
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.seqEqual("から"))
                            .action(({ text, range }) => ({ text: text(), range: range() }))
                        )
                    , "midText")
                    .and(lazyPointerRule, "to")
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.seqEqual("まで"))
                            .action(({ text, range }) => ({ text: text(), range: range() }))
                        )
                    , "trailingText")
                    .action(({ from, midText, to, trailingText, range }) => {
                        return { value: rangeMaker(from, midText, to, trailingText, range()), errors: [] };
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "from")
                    .and(r => r
                        .sequence(s => s
                            .and(r => r.regExp(/^(?:・|～|乃至)/))
                            .action(({ text, range }) => ({ text: text(), range: range() }))
                        )
                    , "midText")
                    .and(lazyPointerRule, "to")
                    .action(({ from, midText, to, range }) => {
                        return { value: rangeMaker(from, midText, to, null, range()), errors: [] };
                    })
                )
            )
            .or(r => r
                .sequence(c => c
                    .and(lazyPointerRule, "pointer")
                    .action(({ pointer, range }) => {
                        return { value: rangeMaker(pointer, null, null, null, range()), errors: [] };
                    })
                )
            )
        )
        ;

    return { $ranges, $range };
};

export default makeRangesRule;
