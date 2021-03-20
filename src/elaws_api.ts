import { decodeBase64 } from "./util"
const fetch: typeof window.fetch = ((global as any).window && window.fetch) || require("node-fetch");
const DOMParser: typeof window.DOMParser = ((global as any).window && window.DOMParser) || require("xmldom").DOMParser;
const XMLSerializer: typeof window.XMLSerializer = ((global as any).window && window.XMLSerializer) || require("xmldom").XMLSerializer;
const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();

const lawlistsURL = "https://elaws.e-gov.go.jp/api/1/lawlists/1";
const lawdataURL = "https://elaws.e-gov.go.jp/api/1/lawdata/";

export const fetchElaws = async (url: string, retry=3): Promise<Element> => {
    if (retry <= 0) {
        throw Error("fetchElaws(): Failed after retries");
    }
    const response = await fetch(url, {
        mode: "cors",
    });
    if (!response.ok) throw Error(response.statusText);
    const text = await response.text();    
    const doc = domParser.parseFromString(text, "text/xml") as XMLDocument;
    const elResult = doc.getElementsByTagName("DataRoot").item(0)?.getElementsByTagName("Result").item(0);
    const elCode = elResult?.getElementsByTagName("Code").item(0);
    if(!elCode) {
        console.log("remaining retries: " + (retry - 1));
        return await fetchElaws(url, retry - 1);
    }
    if (elCode.textContent !== "0") {
        const msg = elResult?.getElementsByTagName("Message").item(0)?.textContent;
        console.log("request URL: " + url)
        throw Error(msg ?? "fetchElaws(): Unknown Error in XML\nrequest URL");
    }
    const ret = doc.getElementsByTagName("DataRoot").item(0)?.getElementsByTagName("ApplData").item(0);
    if (!ret) {
        console.log("request URL: " + url)
        throw Error("fetchElaws(): ApplData element not exist");
    }
    return ret;
}

export class LawNameListInfo {
    constructor(
        public LawId: string,
        public LawName: string,
        public LawNo: string,
        public PromulgationDate: string,
    ) { }
    public get Path() {
        return this.LawId;
    }
    public get XmlZipName() {
        return `${this.LawId}.xml.zip`;
    }
    public get XmlName() {
        return `${this.LawId}.xml`;
    }
}

export const fetchLawNameList = async () => {
    const elApplData = await fetchElaws(lawlistsURL);
    const lawNameList:LawNameListInfo[] = [];
    for (const el of Array.from(elApplData.getElementsByTagName("LawNameListInfo"))) {
        lawNameList.push(new LawNameListInfo(
            el.getElementsByTagName("LawId").item(0)?.textContent ?? "",
            el.getElementsByTagName("LawName").item(0)?.textContent ?? "",
            el.getElementsByTagName("LawNo").item(0)?.textContent ?? "",
            el.getElementsByTagName("PromulgationDate").item(0)?.textContent ?? "",
        ));
    }
    return lawNameList;
}

export class LawData {
    constructor(
        public lawID: string,
        public lawNum: string,
        public law: Element,
        public imageData: Uint8Array | null,
        private _xml: string | null = null,
    ) { }
    private getXml() {
        const doc = this.law.ownerDocument.implementation.createDocument("", "", null);
        doc.appendChild(doc.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"'));
        doc.appendChild(this.law);
        return xmlSerializer.serializeToString(doc);
    }
    public get xml(): string {
        this._xml = this._xml === null ? this.getXml() : this._xml;
        return this._xml;
    }
}

export const fetchLawData = async (lawIDOrLawNum: string) => {
    const elApplData = await fetchElaws(lawdataURL + lawIDOrLawNum);
    if (!elApplData) {
        throw Error("getLawData(): fetchElaws failed");
    }

    const law = elApplData.getElementsByTagName("LawFullText").item(0)?.getElementsByTagName("Law").item(0);
    if (!law) {
        throw Error("getLawData(): Law element not exist");
    }

    const elImageData = elApplData.getElementsByTagName("ImageData").item(0);
    const imageData = elImageData ? decodeBase64(elImageData.innerHTML) : null;

    return new LawData(
        elApplData.getElementsByTagName("LawId").item(0)?.textContent ?? "",
        elApplData.getElementsByTagName("LawNum").item(0)?.textContent ?? elApplData.getElementsByTagName("LawFullText").item(0)?.getElementsByTagName("Law").item(0)?.getElementsByTagName("LawNum").item(0)?.textContent ?? "",
        law,
        imageData,
    );
}