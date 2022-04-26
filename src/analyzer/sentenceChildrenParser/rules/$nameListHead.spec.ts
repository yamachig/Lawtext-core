import { assert } from "chai";
import loadEL from "../../../node/el/loadEL";
import { initialEnv } from "../env";
import $nameListHead from "./$nameListHead";
import * as std from "../../../law/std";
import addSentenceChildrenControls from "../../../parser/addSentenceChildrenControls";
import { SentenceChildEL } from "../../../node/cst/inline";
import detectTokens from "../../detectTokens";
import getSentenceEnvs from "../../getSentenceEnvs";

const env = initialEnv({ target: "" });

describe("Test $nameListHead", () => {

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この法律において、次の各号に掲げる用語の意義は、それぞれ当該各号に定めるところによる。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedPointerRanges = {
            tag: "____PointerRanges",
            attr: {},
            children: [
                {
                    tag: "____PointerRange",
                    attr: {},
                    children: [
                        {
                            tag: "____Pointer",
                            attr: {},
                            children: [
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "HERE",
                                        targetType: "Law",
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
                                }
                            ]
                        }
                    ]
                }
            ]
        } ;

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.isNull(result.value.value.pointerRangesModifier);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この法律及びこの法律に基づく命令の規定の解釈に関しては、次の定義に従うものとする。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedPointerRanges = {
            tag: "____PointerRanges",
            attr: {},
            children: [
                {
                    tag: "____PointerRange",
                    attr: {},
                    children: [
                        {
                            tag: "____Pointer",
                            attr: {},
                            children: [
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "HERE",
                                        targetType: "Law",
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: "__Text",
                    attr: {},
                    children: ["及び"]
                },
                {
                    tag: "____PointerRange",
                    attr: {},
                    children: [
                        {
                            tag: "____Pointer",
                            attr: {},
                            children: [
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "HERE",
                                        targetType: "Law",
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
                                },
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "NAMED",
                                        targetType: "INFERIOR",
                                        name: "に基づく命令"
                                    },
                                    children: ["に基づく命令"]
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.isNull(result.value.value.pointerRangesModifier);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この法律又はこの法律に基づく命令において、次の各号に掲げる用語は、当該各号に掲げる定義に従うものとする。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedPointerRanges = {
            tag: "____PointerRanges",
            attr: {},
            children: [
                {
                    tag: "____PointerRange",
                    attr: {},
                    children: [
                        {
                            tag: "____Pointer",
                            attr: {},
                            children: [
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "HERE",
                                        targetType: "Law",
                                        name: "この法律"
                                    },
                                    children: ["この法律"]
                                }
                            ]
                        }
                    ]
                },
            ]
        };

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.isNull(result.value.value.pointerRangesModifier);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });


    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この条（第一項及び次項から第七項までを除く。）において、次の各号に掲げる用語の意義は、それぞれ当該各号に定めるところによる。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedPointerRanges = {
            tag: "____PointerRanges",
            attr: {},
            children: [
                {
                    tag: "____PointerRange",
                    attr: {},
                    children: [
                        {
                            tag: "____Pointer",
                            attr: {},
                            children: [
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "HERE",
                                        targetType: "Article",
                                        name: "この条"
                                    },
                                    children: ["この条"]
                                }
                            ]
                        }
                    ]
                }
            ]
        } ;

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.isNotNull(result.value.value.pointerRangesModifier);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この省令において使用する用語は、鉱山保安法（以下「法」という。）及び鉱山保安法施行規則（平成十六年経済産業省令第九十六号）において使用する用語の例によるほか、次の各号に定めるところによる。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedPointerRanges = {
            tag: "____PointerRanges",
            attr: {},
            children: [
                {
                    tag: "____PointerRange",
                    attr: {},
                    children: [
                        {
                            tag: "____Pointer",
                            attr: {},
                            children: [
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "HERE",
                                        targetType: "Law",
                                        name: "この省令"
                                    },
                                    children: ["この省令"]
                                }
                            ]
                        }
                    ]
                }
            ]
        } ;

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.isNull(result.value.value.pointerRangesModifier);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この規則（第二条の三十五を除く。）において使用する用語は、鉱山保安法（以下「法」という。）及び鉱山保安法施行規則（平成十六年経済産業省令第九十六号）において使用する用語の例によるほか、次の各号に掲げる用語の意義は、それぞれ当該各号に定めるところによる。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedPointerRanges = {
            tag: "____PointerRanges",
            attr: {},
            children: [
                {
                    tag: "____PointerRange",
                    attr: {},
                    children: [
                        {
                            tag: "____Pointer",
                            attr: {},
                            children: [
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "HERE",
                                        targetType: "Law",
                                        name: "この規則"
                                    },
                                    children: ["この規則"]
                                }
                            ]
                        }
                    ]
                }
            ]
        } ;

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.isNotNull(result.value.value.pointerRangesModifier);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });

    it("Success case", () => {
        /* eslint-disable no-irregular-whitespace */
        const origEL = loadEL({
            tag: "Sentence",
            attr: {},
            children: ["この規則（第二条の三十五を除く。）において使用する用語は、法において使用する用語の例によるほか、次の各号に掲げる用語の意義は、それぞれ当該各号に定めるところによる。"],
        }) as std.Sentence;
        addSentenceChildrenControls(origEL);
        const sentenceEnvsStruct = getSentenceEnvs(origEL);
        detectTokens(sentenceEnvsStruct);
        const input = origEL.children as SentenceChildEL[];
        // console.log(JSON.stringify(input.map(el => el.json(true)), undefined, 2));
        const expectedErrorMessages: string[] = [];
        const expectedPointerRanges = {
            tag: "____PointerRanges",
            attr: {},
            children: [
                {
                    tag: "____PointerRange",
                    attr: {},
                    children: [
                        {
                            tag: "____Pointer",
                            attr: {},
                            children: [
                                {
                                    tag: "____PF",
                                    attr: {
                                        relPos: "HERE",
                                        targetType: "Law",
                                        name: "この規則"
                                    },
                                    children: ["この規則"]
                                }
                            ]
                        }
                    ]
                }
            ]
        } ;

        const result = $nameListHead.abstract().match(0, input, env);
        assert.isTrue(result.ok);
        if (result.ok) {
            // console.log(JSON.stringify(result.value.value.pointerRanges?.json(true), undefined, 2));
            assert.deepStrictEqual(result.value.value.pointerRanges?.json(true), expectedPointerRanges);
            assert.isNotNull(result.value.value.pointerRangesModifier);
            assert.deepStrictEqual(result.value.errors.map(e => e.message), expectedErrorMessages);
        }
    });
});