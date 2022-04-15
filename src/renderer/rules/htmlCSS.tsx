import { range } from "../../util";
import { HTMLAmendProvisionCSS } from "./amendProvision";
import { HTMLAnyELsCSS } from "./any";
import { HTMLAppdxItemCSS } from "./appdxItem";
import { HTMLArithFormulaRunCSS } from "./arithFormulaRun";
import { HTMLArticleCSS } from "./article";
import { HTMLArticleGroupCSS } from "./articleGroup";
import { HTMLColumnsOrSentencesRunCSS } from "./columnsOrSentencesRun";
import { HTMLFigRunCSS } from "./figRun";
import { HTMLItemStructCSS } from "./itemStruct";
import { HTMLLawCSS } from "./law";
import { HTMLListCSS } from "./list";
import { HTMLNoteLikeCSS } from "./noteLike";
import { HTMLParagraphItemCSS } from "./paragraphItem";
import { HTMLRemarksCSS } from "./remarks";
import { HTMLSentenceChildrenRunCSS } from "./sentenceChildrenRun";
import { HTMLSupplNoteCSS } from "./supplNote";
import { HTMLTableCSS } from "./table";

export const HTMLIndentCSS = [...range(0, 30)]
    .map(indent => /*css*/`
.indent-${indent} {
    margin-left: ${indent}em;
}
`).join("\n");

export const htmlCSS = [
    HTMLIndentCSS,
    HTMLAnyELsCSS,
    HTMLLawCSS,
    HTMLArticleGroupCSS,
    HTMLArticleCSS,
    HTMLParagraphItemCSS,
    HTMLTableCSS,
    HTMLItemStructCSS,
    HTMLAppdxItemCSS,
    HTMLRemarksCSS,
    HTMLNoteLikeCSS,
    HTMLListCSS,
    HTMLAmendProvisionCSS,
    HTMLSupplNoteCSS,

    HTMLSentenceChildrenRunCSS,
    HTMLColumnsOrSentencesRunCSS,
    HTMLFigRunCSS,
    HTMLArithFormulaRunCSS,
].join("\n");

export default htmlCSS;