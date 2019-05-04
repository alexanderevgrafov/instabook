import * as  _ from 'underscore';
import {WsHandler} from "./interfaces";
import * as  pdf from 'html-pdf';
import {templates, PAGE_BREAK} from "./Templates";
import {PostConfig} from "../js/models/InstaModels";

const HTML_START = `<html><body>`,
    HTML_END = `</body></html>`;


export const PDFgenerate: WsHandler = (s, data) => {
    const {fid} = data,
        {folders} = s, folder = folders.get(fid);

    if (!folder) {
        throw new Error('Folder not located by its FID');
    }

    const items = _.map(data.items, id => folder.items.get(id)),
        filename = './pdf/' + new Date().toLocaleString().replace(new RegExp('\\W', 'g'), '_') + '.pdf';

    let html = HTML_START +
        _.map(items, item => {
            const params = {
                post: item.media.caption && item.media.caption.text || '',
                media_url: item.media.fullURL()
            };

            params.post = params.post.replace(new RegExp(String.fromCharCode(10), 'g'), '<br/>');

            return templates('page0').tmpl(params);
        })
            .join(PAGE_BREAK) + HTML_END;

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

export const PDF_test: WsHandler = (s, data) => {
    const config = new PostConfig(data.config),
        filename = './pdf/' + new Date().toLocaleString().replace(new RegExp('\\W', 'g'), '_') + '_' + config.tmpl + '.pdf';

    let html = HTML_START +
        _.map([1], () => {
            const params = {
                post: data.text || '',
                media_url: data.url,
                config: data.config
            };

            params.post = params.post.replace(new RegExp(String.fromCharCode(10), 'g'), '<br/>');

            return templates(config.tmpl).tmpl(params);
        })
            .join(PAGE_BREAK) + HTML_END;

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

