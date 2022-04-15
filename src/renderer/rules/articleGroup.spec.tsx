import React from "react";
import { assert } from "chai";
import { loadEl } from "../../node/el";
import * as std from "../../law/std";
import { DOCXArticleGroup, HTMLArticleGroup } from "./articleGroup";
import { renderToStaticMarkup } from "./common";
import { renderDocxAsync } from "./docx";
import os from "os";
import path from "path";
import fs from "fs";
import formatXML from "../../util/formatXml";
import htmlCSS from "./htmlCSS";
import { promisify } from "util";

const tempDir = path.join(os.tmpdir(), "lawtext_core_test");

describe("Test HTML articleGroup", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "Chapter",
            attr: {
                Delete: "false",
                Hide: "false",
                Num: "3",
            },
            children: [
                {
                    tag: "ChapterTitle",
                    attr: {},
                    children: ["第三章　不利益処分"],
                },
                {
                    tag: "Section",
                    attr: {
                        Delete: "false",
                        Hide: "false",
                        Num: "1",
                    },
                    children: [
                        {
                            tag: "SectionTitle",
                            attr: {},
                            children: ["第一節　通則"],
                        },
                        {
                            tag: "Article",
                            attr: {
                                Delete: "false",
                                Hide: "false",
                            },
                            children: [
                                {
                                    tag: "ArticleCaption",
                                    attr: {},
                                    children: ["（処分の基準）"],
                                },
                                {
                                    tag: "ArticleTitle",
                                    attr: {},
                                    children: ["第十二条"],
                                },
                                {
                                    tag: "Paragraph",
                                    attr: {
                                        OldStyle: "false",
                                    },
                                    children: [
                                        {
                                            tag: "ParagraphNum",
                                            attr: {},
                                            children: [],
                                        },
                                        {
                                            tag: "ParagraphSentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["行政庁は、処分基準を定め、かつ、これを公にしておくよう努めなければならない。"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Section",
                    attr: {
                        Delete: "false",
                        Hide: "false",
                        Num: "2",
                    },
                    children: [
                        {
                            tag: "SectionTitle",
                            attr: {},
                            children: ["第二節　聴聞"],
                        },
                        {
                            tag: "Article",
                            attr: {
                                Delete: "false",
                                Hide: "false",
                            },
                            children: [
                                {
                                    tag: "ArticleCaption",
                                    attr: {},
                                    children: ["（聴聞の通知の方式）"],
                                },
                                {
                                    tag: "ArticleTitle",
                                    attr: {},
                                    children: ["第十五条"],
                                },
                                {
                                    tag: "Paragraph",
                                    attr: {
                                        OldStyle: "false",
                                    },
                                    children: [
                                        {
                                            tag: "ParagraphNum",
                                            attr: {},
                                            children: [],
                                        },
                                        {
                                            tag: "ParagraphSentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["行政庁は、聴聞を行うに当たっては、聴聞を行うべき期日までに相当な期間をおいて、不利益処分の名あて人となるべき者に対し、次に掲げる事項を書面により通知しなければならない。"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.ArticleGroup;
        const expectedHTML = /*html*/`\
<div class="article-group">
  <p class="article-group-title indent-4">第三章　不利益処分</p>
  <div class="article-group-body">
    <div class="article-group">
      <p class="article-group-title indent-5">第一節　通則</p>
      <div class="article-group-body">
        <div class="article">
          <p class="article-caption indent-2">（処分の基準）</p>
          <div class="article-body">
            <div class="paragraph-item-Paragraph">
              <p class="paragraph-item-main indent-1">
                <span class="paragraph-item-title">第十二条</span>
                <span class="paragraph-item-margin">　</span>
                <span class="paragraph-item-body">行政庁は、処分基準を定め、かつ、これを公にしておくよう努めなければならない。</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="article-group">
      <p class="article-group-title indent-5">第二節　聴聞</p>
      <div class="article-group-body">
        <div class="article">
          <p class="article-caption indent-2">（聴聞の通知の方式）</p>
          <div class="article-body">
            <div class="paragraph-item-Paragraph">
              <p class="paragraph-item-main indent-1">
                <span class="paragraph-item-title">第十五条</span>
                <span class="paragraph-item-margin">　</span>
                <span class="paragraph-item-body">行政庁は、聴聞を行うに当たっては、聴聞を行うべき期日までに相当な期間をおいて、不利益処分の名あて人となるべき者に対し、次に掲げる事項を書面により通知しなければならない。</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;
        const element = <HTMLArticleGroup el={input} indent={1} htmlOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedHTML,
        );
        const html = /*html*/`\
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
${htmlCSS}
</style>
</head>
<body>
${rendered}
</body>
</html>
`;
        const tempParsedHtml = path.join(tempDir, "renderer.articleGroup.html");
        await promisify(fs.writeFile)(tempParsedHtml, html);
        console.log(`      Saved html: ${tempParsedHtml}`);
    });
});

describe("Test DOCX articleGroup", () => {
    /* eslint-disable no-irregular-whitespace */

    it("Success case", async () => {
        const input = loadEl({
            tag: "Chapter",
            attr: {
                Delete: "false",
                Hide: "false",
                Num: "3",
            },
            children: [
                {
                    tag: "ChapterTitle",
                    attr: {},
                    children: ["第三章　不利益処分"],
                },
                {
                    tag: "Section",
                    attr: {
                        Delete: "false",
                        Hide: "false",
                        Num: "1",
                    },
                    children: [
                        {
                            tag: "SectionTitle",
                            attr: {},
                            children: ["第一節　通則"],
                        },
                        {
                            tag: "Article",
                            attr: {
                                Delete: "false",
                                Hide: "false",
                            },
                            children: [
                                {
                                    tag: "ArticleCaption",
                                    attr: {},
                                    children: ["（処分の基準）"],
                                },
                                {
                                    tag: "ArticleTitle",
                                    attr: {},
                                    children: ["第十二条"],
                                },
                                {
                                    tag: "Paragraph",
                                    attr: {
                                        OldStyle: "false",
                                    },
                                    children: [
                                        {
                                            tag: "ParagraphNum",
                                            attr: {},
                                            children: [],
                                        },
                                        {
                                            tag: "ParagraphSentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["行政庁は、処分基準を定め、かつ、これを公にしておくよう努めなければならない。"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: "Section",
                    attr: {
                        Delete: "false",
                        Hide: "false",
                        Num: "2",
                    },
                    children: [
                        {
                            tag: "SectionTitle",
                            attr: {},
                            children: ["第二節　聴聞"],
                        },
                        {
                            tag: "Article",
                            attr: {
                                Delete: "false",
                                Hide: "false",
                            },
                            children: [
                                {
                                    tag: "ArticleCaption",
                                    attr: {},
                                    children: ["（聴聞の通知の方式）"],
                                },
                                {
                                    tag: "ArticleTitle",
                                    attr: {},
                                    children: ["第十五条"],
                                },
                                {
                                    tag: "Paragraph",
                                    attr: {
                                        OldStyle: "false",
                                    },
                                    children: [
                                        {
                                            tag: "ParagraphNum",
                                            attr: {},
                                            children: [],
                                        },
                                        {
                                            tag: "ParagraphSentence",
                                            attr: {},
                                            children: [
                                                {
                                                    tag: "Sentence",
                                                    attr: {},
                                                    children: ["行政庁は、聴聞を行うに当たっては、聴聞を行うべき期日までに相当な期間をおいて、不利益処分の名あて人となるべき者に対し、次に掲げる事項を書面により通知しなければならない。"],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        }) as std.ArticleGroup;
        const expectedDOCX = /*xml*/`\
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging4"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>第三章　不利益処分</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging5"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>第一節　通則</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent2"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>（処分の基準）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>第十二条</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>行政庁は、処分基準を定め、かつ、これを公にしておくよう努めなければならない。</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging5"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>第二節　聴聞</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="Indent2"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:t>（聴聞の通知の方式）</w:t>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:pStyle w:val="IndentHanging1"></w:pStyle>
  </w:pPr>
  <w:r>
    <w:rStyle w:val="Emphasis"></w:rStyle>
    <w:t>第十五条</w:t>
  </w:r>
  <w:r>
    <w:t>　</w:t>
  </w:r>
  <w:r>
    <w:t>行政庁は、聴聞を行うに当たっては、聴聞を行うべき期日までに相当な期間をおいて、不利益処分の名あて人となるべき者に対し、次に掲げる事項を書面により通知しなければならない。</w:t>
  </w:r>
</w:p>
`;
        const element = <DOCXArticleGroup el={input} indent={1} docxOptions={{}} />;
        const rendered = renderToStaticMarkup(element);
        const formatted = formatXML(rendered, { collapseContent: true });
        assert.strictEqual(
            formatted,
            expectedDOCX,
        );
        const u8 = await renderDocxAsync(element);
        const tempParsedDocx = path.join(tempDir, "renderer.articleGroup.docx");
        fs.writeFileSync(tempParsedDocx, u8);
        console.log(`      Saved docx: ${tempParsedDocx}`);
    });
});