import React, { Fragment } from "react";
import * as std from "../../law/std";
import { assertNever } from "../../util";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXSentenceChildrenRun, HTMLSentenceChildrenRun } from "./sentenceChildrenRun";
import { DOCXComponentProps, w, wrapDOCXComponent } from "./docx";
import { DOCXItemStruct, HTMLItemStruct } from "./itemStruct";
import { DOCXParagraphItem, HTMLParagraphItem } from "./paragraphItem";
import { DOCXRemarks, HTMLRemarks } from "./remarks";
import { DOCXArithFormulaRun, HTMLArithFormulaRun } from "./arithFormulaRun";


export interface AppdxItemProps {
    el: std.AppdxItem | std.SupplProvisionAppdxItem,
    indent: number,
}

export const HTMLAppdxItemCSS = /*css*/`
.appdx-item {
    clear: both;
    margin-top: 1em;
}

.appdx-item-head {
    clear: both;
    margin-top: 0;
    margin-bottom: 0;
    font-weight: bold;
}

.appdx-item-runs {
    margin-top: 0;
    margin-bottom: 0;
}
`;

export const HTMLAppdxItem = wrapHTMLComponent("HTMLAppdxItem", ((props: HTMLComponentProps & AppdxItemProps) => {

    const { el, htmlOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const AppdxItemTitle = (el.children as (typeof el.children)[number][]).find(el => (
        std.isAppdxItemTitle(el)
        || std.isSupplProvisionAppdxItemTitle(el)
    )) as std.AppdxItemTitle | std.SupplProvisionAppdxItemTitle | undefined;

    const RelatedArticleNum = (el.children as (typeof el.children)[number][]).find(std.isRelatedArticleNum);

    if (AppdxItemTitle || RelatedArticleNum) {
        blocks.push(<>
            <p className={`appdx-item-head indent-${indent}`}>
                {(AppdxItemTitle !== undefined) && <>
                    <span className="appdx-item-title">
                        <HTMLSentenceChildrenRun els={AppdxItemTitle.children} {...{ htmlOptions }} />
                    </span>
                </>}
                {(RelatedArticleNum !== undefined) && <>
                    <span className="related-article-num">
                        <HTMLSentenceChildrenRun els={RelatedArticleNum.children} {...{ htmlOptions }} />
                    </span>
                </>}
            </p>
        </>);
    }

    const bodyBlocks: JSX.Element[] = [];

    for (const child of el.children) {
        if (
            std.isAppdxItemTitle(child)
            || std.isSupplProvisionAppdxItemTitle(child)
            || std.isRelatedArticleNum(child)
        ) {
            continue;

        } else if (std.isRemarks(child)) {
            bodyBlocks.push(<HTMLRemarks el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isTableStruct(child) || std.isFigStruct(child) || std.isNoteLikeStruct(child)) {
            bodyBlocks.push(<HTMLItemStruct el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isItem(child)) {
            bodyBlocks.push(<HTMLParagraphItem el={child} indent={indent} {...{ htmlOptions }} />);

        } else if (std.isArithFormula(child)) {
            bodyBlocks.push(<>
                <p className={`appdx-item-runs indent-${indent}`}>
                    <HTMLArithFormulaRun el={child} {...{ htmlOptions }} />
                </p>
            </>);

        }
        else { assertNever(child); }
    }

    if (bodyBlocks.length > 0) {
        blocks.push(<>
            <div className="appdx-item-body">
                {bodyBlocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
            </div>
        </>);
    }

    return (
        <div className="appdx-item">
            {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
        </div>
    );
}));

export const DOCXAppdxItem = wrapDOCXComponent("DOCXAppdxItem", ((props: DOCXComponentProps & AppdxItemProps) => {

    const { el, docxOptions, indent } = props;

    const blocks: JSX.Element[] = [];

    const AppdxItemTitle = (el.children as (typeof el.children)[number][]).find(el => (
        std.isAppdxItemTitle(el)
        || std.isSupplProvisionAppdxItemTitle(el)
    )) as std.AppdxItemTitle | std.SupplProvisionAppdxItemTitle | undefined;

    const RelatedArticleNum = (el.children as (typeof el.children)[number][]).find(std.isRelatedArticleNum);

    if (AppdxItemTitle || RelatedArticleNum) {
        blocks.push(<>
            <w.p>
                <w.pPr>
                    <w.pStyle w:val={`Indent${indent}`}/>
                </w.pPr>
                {(AppdxItemTitle !== undefined) && <>
                    <DOCXSentenceChildrenRun els={AppdxItemTitle.children} emphasis={true} {...{ docxOptions }} />
                </>}
                {(RelatedArticleNum !== undefined) && <>
                    <DOCXSentenceChildrenRun els={RelatedArticleNum.children} emphasis={true} {...{ docxOptions }} />
                </>}
            </w.p>
        </>);
    }

    for (const child of el.children) {
        if (
            std.isAppdxItemTitle(child)
            || std.isSupplProvisionAppdxItemTitle(child)
            || std.isRelatedArticleNum(child)
        ) {
            continue;

        } else if (std.isRemarks(child)) {
            blocks.push(<DOCXRemarks el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isTableStruct(child) || std.isFigStruct(child) || std.isNoteLikeStruct(child)) {
            blocks.push(<DOCXItemStruct el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isItem(child)) {
            blocks.push(<DOCXParagraphItem el={child} indent={indent} {...{ docxOptions }} />);

        } else if (std.isArithFormula(child)) {
            blocks.push(<>
                <w.p>
                    <w.pPr>
                        <w.pStyle w:val={`Indent${indent}`}/>
                    </w.pPr>
                    <DOCXArithFormulaRun el={child} {...{ docxOptions }} />
                </w.p>
            </>);

        }
        else { assertNever(child); }
    }

    return (<>
        {blocks.map((block, i) => <Fragment key={i}>{block}</Fragment>)}
    </>);
}));