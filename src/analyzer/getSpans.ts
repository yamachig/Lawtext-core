import { Container, ContainerType } from "../node/container";
import { Env } from "../node/container/env";
import { Span } from "../node/span";
import { EL } from "../node/el";
import { containerTags, getContainerType, ignoreSpanTag } from "./common";

export interface SpansStruct {
    spans: Span[];
    containers: Map<string, Container>;
    rootContainer: Container;
}

export const getSpans = (el: EL): SpansStruct => {

    const spans: Span[] = [];
    const containers: Map<string, Container> = new Map();

    let rootContainer: Container | null = null;

    const extract = (el: EL, origEnv: Env) => {

        if (!el.tag) return;

        if ((ignoreSpanTag as readonly string[]).indexOf(el.tag) >= 0) return;

        const env = origEnv.copy();

        let isMixed = false;
        for (const subel of el.children) {
            if (typeof subel === "string") {
                isMixed = true;
                break;
            }
        }

        if (isMixed && el.children.length !== 1) {
            // console.warn(`unexpected mixed content! ${JSON.stringify(el)}`);
        }

        if (isMixed) {
            el.attr.span_index = String(spans.length);
            spans.push(new Span({ index: spans.length, el, env }));
            return;

        } else {
            env.parents.push(el);

            const isContainer = (containerTags as readonly string[]).indexOf(el.tag) >= 0;

            let container: Container | null = null;
            if (isContainer) {
                const type = getContainerType(el.tag);
                const containerID = `container-${containers.size}-tag_${el.tag}-type_${type}`;
                container = new Container({ containerID, el, type });
                env.addContainer(container);
                containers.set(containerID, container);
                if (type === ContainerType.ROOT) rootContainer = container;
            }

            const startSpanIndex = spans.length;
            for (const subel of el.children) {
                if (typeof subel === "string") continue;
                extract(subel, env);
            }
            const endSpanIndex = spans.length; // half open

            if (container) container.spanRange = [startSpanIndex, endSpanIndex];
        }
    };

    extract(el, new Env(el.attr.LawType || ""));

    if (!rootContainer) throw new Error();

    return { spans, containers, rootContainer };
};

export default getSpans;
