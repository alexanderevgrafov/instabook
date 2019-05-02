import * as  _ from 'underscore';
import {WsHandler} from "./interfaces";
import * as  pdf from 'html-pdf';
import {templates, PAGE_BREAK} from "./Templates";

export const PDFgenerate: WsHandler = (s, data) => {
    const {fid} = data,
        {folders} = s, folder = folders.get(fid);

    if (!folder) {
        throw new Error('Folder not located by its FID');
    }

    const items = _.map(data.items, id => folder.items.get(id)),
        filename = './pdf/' + new Date().toLocaleString().replace(new RegExp('\\W', 'g'), '_') + '.pdf';

    let html = '<html><body style="font-size:14pt">' +
        _.map(items, item => {
            const params = {
                post: item.media.caption && item.media.caption.text || '',
                media_url: item.media.fullURL()
            };

            params.post = params.post.replace(new RegExp(String.fromCharCode(10), 'g'), '<br/>');

            return templates.page0(params);
        })
            .join(PAGE_BREAK) +
        '<hr/></body></html>';

    return new Promise((resolve, reject) => {
        pdf.create(html, {
            "format": "A5",
            "orientation": "portrait"
        })
            .toFile(filename, function (err) {
                if (err)
                    reject(err);

                resolve(html);
            })
    });
};

