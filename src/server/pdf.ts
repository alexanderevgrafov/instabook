import * as  _ from 'underscore';
import {WsHandler} from "./interfaces";
import * as  pdf from 'html-pdf';
import {templates, papers} from "../templates/all_server";
import {InstaPost, PostConfig} from "../js/models/InstaModels";


const
    PAGE_BREAK = `<hr/>`,//`<div style='page-break-before:always;'></div>`,
    HTML_START = `<html><body>`,
    HTML_END = `</body></html>`;

const PAPER_SIZE = 'a5';

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
                media_url: item.media.fullURL
            };

            params.post = params.post.replace(new RegExp(String.fromCharCode(10), 'g'), '<br/>');

//            return templates('page0').tmpl(params);
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
    const post = new InstaPost(data.post),
        filename = './pdf/' + new Date().toLocaleString().replace(new RegExp('\\W', 'g'), '_') + '_' + data.post.config.tmpl + '.pdf',
        paper_css = papers[PAPER_SIZE];

    const
        posts_to_render = [post];

    let html = HTML_START +
        paper_css +
        _.map(posts_to_render, post => {
            const template = templates[post.config.tmpl];

            return template.css(post) +
                `<div class='body'>` + template.page1(post) + '</div>' +
      //          PAGE_BREAK +
                `<div class='body'>` + template.page2(post) + '</div>';
        })
            .join(PAGE_BREAK) +
        HTML_END;

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

