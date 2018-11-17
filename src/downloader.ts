import * as JSZip from "jszip"
import * as path from "path"
import { DOMParser } from "xmldom"
import { range } from "./util"
const fetch = ((global as any).window && window.fetch) || require("node-fetch");


export const FILENAMES = [
    ...range(104, 145 + 1),
    ...range(201, 215 + 1),
    ...range(301, 364 + 1),
    ...range(401, 430 + 1),
    // ...range(430, 430 + 1),
].map((v) => `${v}.zip`);

export const download = async <
    S extends boolean=false,
    T extends boolean=false,
    U extends boolean=false,
    >(
        { full, withoutPict, list }: Partial<{ full: S, withoutPict: T, list: U }>,
        filenames: string[] = FILENAMES,
        onProgress: (ratio: number, message: string) => void = () => undefined,
):
    Promise<(
        (S extends true ? { full: ArrayBuffer } : {}) &
        (T extends true ? { withoutPict: ArrayBuffer } : {}) &
        (U extends true ? { list: string } : {})
    )> => {

    const progress = (() => {
        let currentRatio = 0;
        let currentMessage = "";
        return (ratio?: number, message?: string) => {
            currentRatio = ratio || currentRatio;
            currentMessage = message || currentMessage;
            onProgress(currentRatio, currentMessage);
        };
    })();

    progress(0, "開始しました");

    const progressTotal = filenames.length + 3;
    let progressNow = 0;

    const destZipFull = new JSZip();
    const destZipWithoutPict = new JSZip();
    const lawinfos: LawInfo[] = [];
    const lawinfoDict: { [lawnum: string]: LawInfo } = {};

    let processingDownloadedFile: Promise<void> | null = null;

    const processDownloadedFile = async (srcZip: JSZip) => {

        const items: Array<[string, JSZip.JSZipObject]> = [];
        srcZip.forEach((relativePath, file) => {
            items.push([relativePath, file]);
        });

        for (const [relativePath, file] of items) {
            const isPict = /^[^/]+\/[^/]+\/pict\/.*$/.test(relativePath);

            if (file.dir) {
                if (full) {
                    destZipFull.folder(relativePath);
                }
                if (withoutPict && !isPict) {
                    destZipWithoutPict.folder(relativePath);
                }

            } else {
                if (/^[^/]+\/[^/]+\/[^/]+.xml$/.test(relativePath)) {
                    const xml = await file.async("text");
                    const lawinfo = new LawInfo(xml, relativePath);
                    lawinfoDict[lawinfo.LawNum] = lawinfo;
                    lawinfos.push(lawinfo);
                    progress(undefined, `${lawinfo.LawNum}：${lawinfo.LawTitle}`);
                }

                if (full || (withoutPict && !isPict)) {
                    const innerZip = new JSZip();
                    const innerData = await file.async("arraybuffer");
                    innerZip.file(path.basename(file.name), innerData);
                    const innerZipData = await innerZip.generateAsync({
                        type: "arraybuffer",
                        compression: "DEFLATE",
                        compressionOptions: {
                            level: 9
                        }
                    });

                    if (full) {
                        destZipFull.file(relativePath + ".zip", innerZipData);
                    }
                    if (withoutPict && !isPict) {
                        destZipWithoutPict.file(relativePath + ".zip", innerZipData);
                    }
                }
            }
        }

        progressNow++;
        progress(progressNow / progressTotal);
    };

    for (const filename of filenames) {
        const response = await fetch(`http://elaws.e-gov.go.jp/download/${filename}`, {
            mode: "cors",
        });
        const zipData = await response.arrayBuffer();
        const srcZip = await JSZip.loadAsync(zipData);

        await processingDownloadedFile;
        processingDownloadedFile = processDownloadedFile(srcZip);
    }

    await processingDownloadedFile;

    progress(undefined, `相互参照を分析しています`);
    const allLawnums = new Set(lawinfos.map(lawinfo => lawinfo.LawNum));
    for (const lawinfo of lawinfos) {
        for (const lawnum of Array.from(lawinfo.ReferencingLawNums)) {
            if (allLawnums.has(lawnum)) {
                lawinfoDict[lawnum].ReferencedLawNums.add(lawinfo.LawNum);
            } else {
                lawinfo.ReferencingLawNums.delete(lawnum);
            }
        }
    }

    progressNow++;
    progress(progressNow / progressTotal);

    progress(undefined, `リストを出力しています`);
    const lawlist = lawinfos.map((lawinfo) => {
        return [
            lawinfo.LawNum,
            Array.from(lawinfo.ReferencingLawNums),
            Array.from(lawinfo.ReferencedLawNums),
            lawinfo.LawTitle,
            lawinfo.Path,
            lawinfo.XmlZipName,
        ];
    });
    const listJson = JSON.stringify(lawlist);
    if (full) destZipFull.file("list.json", listJson);
    if (withoutPict) destZipWithoutPict.file("list.json", listJson);

    progressNow++;
    progress(progressNow / progressTotal);

    progress(undefined, `Zipファイルを出力しています`);

    const zipOptions: JSZip.JSZipGeneratorOptions<"arraybuffer"> = {
        type: "arraybuffer",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        },
    };

    const ret: Partial<{ full: ArrayBuffer, withoutPict: ArrayBuffer, list: string }> = {
        ...(full ? { full: await destZipFull.generateAsync(zipOptions) } : {}),
        ...(withoutPict ? { withoutPict: await destZipWithoutPict.generateAsync(zipOptions) } : {}),
        ...(list ? { list: listJson, } : {}),
    };

    progress(1);

    return ret as any;
}

export const reLawnum = /(?:(?:明治|大正|昭和|平成)[元〇一二三四五六七八九十]+年(?:(?:\S+?第[〇一二三四五六七八九十百千]+号|人事院規則[―〇一二三四五六七八九]+)|[一二三四五六七八九十]+月[一二三四五六七八九十]+日内閣総理大臣決定|憲法)|明治三十二年勅令|大正十二年内務省・鉄道省令|昭和五年逓信省・鉄道省令|昭和九年逓信省・農林省令|人事院規則一〇―一五)/g;
const domParser = new DOMParser();

class LawInfo {
    public LawNum: string;
    public ReferencingLawNums: Set<string>;
    public ReferencedLawNums: Set<string>;
    public LawTitle: string;
    public Path: string;
    public XmlZipName: string;

    constructor(xml: string, xmlPath: string) {
        const law = domParser.parseFromString(xml, "text/xml");
        const elLawNm = law.getElementsByTagName("LawNum")[0];
        const elLawBody = law.getElementsByTagName("LawBody")[0];
        const elLawTitle = elLawBody.getElementsByTagName("LawTitle")[0];

        this.LawNum = (elLawNm.textContent || "").trim();
        this.ReferencingLawNums = new Set(xml.match(reLawnum));
        this.ReferencedLawNums = new Set();
        this.LawTitle = (elLawTitle.textContent || "").trim();
        this.Path = path.dirname(xmlPath);
        this.XmlZipName = `${path.basename(xmlPath)}.zip`;
    }
}
