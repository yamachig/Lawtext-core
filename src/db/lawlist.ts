import { LawData } from "../elaws_api";
import { reLawnum } from "../util";
import * as data_paths from "./data_paths";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
const DOMParser: typeof window.DOMParser = (global["window"] && window.DOMParser) || require("xmldom").DOMParser;
const domParser = new DOMParser();


export type LawInfoListItem = [
    LawID: string,
    LawNum: string,
    LawTitle: string,
    Path: string,
    XmlName: string,
    ReferencingLawNums: string[],
    ReferencedLawNums: string[],
]

export interface BaseLawInfo {
    LawID: string,
    LawNum: string,
    LawTitle: string,
    Path: string,
    XmlName: string,
}
export class LawInfo implements BaseLawInfo {
    public ReferencingLawNums: Set<string> = new Set();
    public ReferencedLawNums: Set<string> = new Set();
    public constructor(
        public LawID: string,
        public LawNum: string,
        public LawTitle: string,
        public Path: string,
        public XmlName: string,
    ) {}

    public toTuple(): LawInfoListItem {
        return [
            this.LawID,
            this.LawNum,
            this.LawTitle,
            this.Path,
            this.XmlName,
            Array.from(this.ReferencingLawNums),
            Array.from(this.ReferencedLawNums),
        ];
    }

    public static fromBaseLawInfo(baseLawInfo: BaseLawInfo): LawInfo {
        const {
            LawID,
            LawNum,
            LawTitle,
            Path,
            XmlName,
        } = baseLawInfo;

        const lawInfo = new LawInfo(
            LawID,
            LawNum,
            LawTitle,
            Path,
            XmlName,
        );

        return lawInfo;
    }

    public static fromTuple(tuple: LawInfoListItem): LawInfo {
        const [
            LawID,
            LawNum,
            LawTitle,
            Path,
            XmlName,
            ReferencingLawNums,
            ReferencedLawNums,
        ] = tuple;

        const lawInfo = new LawInfo(
            LawID,
            LawNum,
            LawTitle,
            Path,
            XmlName,
        );
        for (const v of ReferencingLawNums) lawInfo.ReferencingLawNums.add(v);
        for (const v of ReferencedLawNums) lawInfo.ReferencedLawNums.add(v);

        return lawInfo;
    }

    public static fromLawData(lawData: LawData, Path: string, XmlName: string): LawInfo {

        const lawInfo = new LawInfo(
            lawData.lawID,
            (lawData.law.getElementsByTagName("LawNum").item(0)?.textContent || "").trim(),
            (lawData.law.getElementsByTagName("LawBody").item(0)?.getElementsByTagName("LawTitle").item(0)?.textContent || "").trim(),
            Path,
            XmlName,
        );
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        for (const m of lawData.xml.match(new RegExp(reLawnum, "g")) || []) {
            if (m !== lawInfo.LawNum) lawInfo.ReferencingLawNums.add(m);
        }

        return lawInfo;
    }

    public static fromXml(lawID: string, xml: string, Path: string, XmlName: string): LawInfo {
        const law = domParser.parseFromString(xml, "text/xml").getElementsByTagName("Law")[0];
        const lawData = new LawData(lawID, law, null, xml);
        return LawInfo.fromLawData(lawData, Path, XmlName);
    }
}

export class LawInfos {
    protected lawInfos: LawInfo[] = [];
    protected lawInfoMap: Map<string, LawInfo> = new Map<string, LawInfo>();

    public add(lawInfo: LawInfo): void {
        this.lawInfos.push(lawInfo);
        this.lawInfoMap.set(lawInfo.LawNum, lawInfo);
    }

    public setReferences(): void {
        for (const referencingLawInfo of this.lawInfos) {
            for (const lawnum of Array.from(referencingLawInfo.ReferencingLawNums)) {
                const referencedLawInfo = this.lawInfoMap.get(lawnum);
                if (referencedLawInfo) {
                    referencedLawInfo.ReferencedLawNums.add(referencingLawInfo.LawNum);
                } else {
                    referencingLawInfo.ReferencingLawNums.delete(lawnum);
                }
            }
        }
    }

    public getList(): LawInfoListItem[] {
        return this.lawInfos.map(lawinfo => lawinfo.toTuple());
    }
}

export const makeList = async (
    lawIdXmls: AsyncIterable<{lawID: string, xml: string, Path: string, XmlName: string}>,
    totalCount: number,
    onProgress: (ratio: number, message: string) => void = () => undefined,
): Promise<LawInfoListItem[]> => {

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio || currentRatio;
            currentMessage = message || currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    let currentLength = 0;
    progress(0, "");
    const lawInfos = new LawInfos();
    for await (const { lawID, xml, Path, XmlName } of lawIdXmls) {
        const lawInfo = LawInfo.fromXml(lawID, xml, Path, XmlName);
        lawInfos.add(lawInfo);
        currentLength++;
        progress(currentLength / totalCount, `${lawInfo.LawNum}：${lawInfo.LawTitle}`);
    }
    lawInfos.setReferences();
    progress(1);

    return lawInfos.getList();
};

const lawListByLawnum: { [index: string]: LawInfo } = {};
const lawList: LawInfo[] = [];
let lawListReady = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type TextFetcher = (textPath: string) => Promise<string | null>;

export const ensureList = async (dataPath: string, textFetcher: TextFetcher): Promise<void> => {
    if (!lawListReady) {
        const listJsonPath = data_paths.getListJsonPath(dataPath);
        const text = await textFetcher(listJsonPath);
        if (text === null) return;
        try {
            const json = JSON.parse(text);
            for (const item of json) {
                const lawInfo = LawInfo.fromTuple(item);
                lawList.push(lawInfo);
                lawListByLawnum[lawInfo.LawNum] = lawInfo;
            }
            console.log(`### loaded ${lawList.length} laws`);
            lawListReady = true;
        } catch (e) {
            console.log(e);
        }
    }
};

export const getLawList = async (dataPath: string, textFetcher: TextFetcher): Promise<[LawInfo[], { [index: string]: LawInfo }]> => {
    await ensureList(dataPath, textFetcher);
    return [lawList, lawListByLawnum];
};

export const getLawXmlByInfo = async (dataPath: string, lawInfo: BaseLawInfo, textFetcher: TextFetcher): Promise<string | null> => {
    const lawdataPath = data_paths.getLawdataPath(dataPath);
    const filepath = path.join(lawdataPath, lawInfo.Path, lawInfo.XmlName);
    const xml = await textFetcher(filepath);
    return xml;
};

export const getLawXml = async (dataPath: string, lawNum: string, textFetcher: TextFetcher): Promise<string | null> => {
    const [/**/, listByLawnum] = await getLawList(dataPath, textFetcher);
    if (!(lawNum in listByLawnum)) return null;
    const lawInfo = listByLawnum[lawNum];
    return getLawXmlByInfo(dataPath, lawInfo, textFetcher);
};

export const getLawCSVList = async (dataPath: string, textFetcher: TextFetcher): Promise<BaseLawInfo[] | null> => {
    const listCSVPath = data_paths.getListCSVPath(dataPath);
    const csv = await getCSVList(listCSVPath, textFetcher);
    if (csv === null) return null;
    return csv.map(row => {
        const longID = /lawid=(\w+)/.exec(row["本文URL"])?.[1] ?? "";
        const lawInfo: BaseLawInfo = {
            LawID: row["法令ID"],
            LawNum: row["法令番号"],
            LawTitle: row["法令名"],
            Path: longID,
            XmlName: `${longID}.xml`,
        };
        return lawInfo;
    });
};

export const getCSVList = async (csvPath: string, textFetcher: TextFetcher): Promise<Record<string, string>[] | null> => {
    const text = await textFetcher(csvPath);
    if (text === null) return null;
    const [headerStr, ...rowStrs] = text.split(/\r?\n/);
    const header = headerStr.split(",");
    const rows = rowStrs.map((rowStr, rowI) => {
        const row = rowStr.split(",");
        if (row.length !== header.length) {
            console.error(`Column mismatch: row ${rowI + 1}`);
        }
        const ret: Record<string, string> = {};
        for (const [i, h] of header.entries()) {
            ret[h] = i < row.length ? row[i] : "";
        }
        return ret;
    });
    return rows;
};