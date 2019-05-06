import {TemplateModel, merge_css} from "./design/TemplateModel";

const papers = {
        a5: {
            margin: 0,
            width: '147mm',
            height: '209mm',
            overflow: 'hidden',
            boxSizing: 'border-box',
            fontWeight: '400',
            lineHeight: '1.6',
            textAlign: 'left',
            fontSize: '14pt',
        }
    }
;

export {
    papers, merge_css
}
