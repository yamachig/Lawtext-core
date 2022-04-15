import React from "react";
import * as std from "../../law/std";
import { HTMLComponentProps, wrapHTMLComponent } from "./html";
import { DOCXComponentProps, wrapDOCXComponent } from "./docx";
import { DOCXAnyELs, HTMLAnyELs } from "./any";


export interface NoteLikeProps {
    el: std.NoteLike,
    indent: number,
}

export const HTMLNoteLikeCSS = /*css*/`

`;

export const HTMLNoteLike = wrapHTMLComponent("HTMLNoteLike", ((props: HTMLComponentProps & NoteLikeProps) => {

    const { el, htmlOptions, indent } = props;

    return (
        <div className="note-like">
            <HTMLAnyELs els={el.children} indent={indent} {...{ htmlOptions }}/>
        </div>
    );
}));

export const DOCXNoteLike = wrapDOCXComponent("DOCXNoteLike", ((props: DOCXComponentProps & NoteLikeProps) => {

    const { el, docxOptions, indent } = props;

    return <DOCXAnyELs els={el.children} indent={indent} {...{ docxOptions }}/>;
}));