import * as  _ from 'underscore';
import {WsHandler} from "./interfaces";
import * as  pdf from 'html-pdf';

const PAGE_BREAK = '<div style="page-break-before: always;"></div>';
export const PDFgenerate: WsHandler = (s, data) => {
    const {fid} = data,
        {folders} = s, folder = folders.get(fid);

    if (!folder) {
        throw new Error('Folder not located by its FID');
    }

    const items = _.map(data.items, id => folder.items.get(id)),
        filename = './pdf/' + new Date().toLocaleString().replace(new RegExp('[^\w]+', 'g'), '_') + '.pdf';

    let html = '<html><body>' +
        _.map(items, item => {
            let text = item.media.caption && item.media.caption.text || '';

            text = (text || '').replace(new RegExp(String.fromCharCode(10), 'g'), '<br/>');

            return `<img src='${item.media.fullURL()}' width='100%' alt=''/>` +
            PAGE_BREAK +
            `<p style='font-size:14pt'>${text}</p>`
        })
            .join( PAGE_BREAK ) +
        '<hr/></body></html>';

    return new Promise((resolve, reject) => {
        pdf.create(html).toFile(filename, function (err) {
            if (err)
                reject(err);

            resolve(html);
        })
    });
};

