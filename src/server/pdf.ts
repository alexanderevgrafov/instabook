//import React from 'react-type-r'
//import ReactDOMServer from 'react-dom/server'
import * as  _ from 'underscore';
import {WsHandler} from "./interfaces";
import * as  pdf from 'html-pdf';
import {templates, papers, TemplateModel} from "../templates/all_server";
import {InPost, PostConfig} from "../js/models/InModels";

const ReactDOMServer = require('react-dom/server');

const
    PAGE_BREAK = `<hr/>`,//`<div style='page-break-before:always;'></div>`,
    HTML_START = `<html><body style='margin:0'>`,
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
    const post = new InPost(data.post),
        filename = './pdf/' + new Date().toLocaleString().replace(new RegExp('\\W', 'g'), '_') +
            '_' + post.config.tmpl0 + '_' + post.config.tmpl1 + '.pdf',
        paper_css = papers[PAPER_SIZE];

    const posts_to_render = [post];

    let html = HTML_START +
        _.map(posts_to_render, post => {
            const tmpl0 = templates.get(post.config.tmpl0),
                tmpl1 = templates.get(post.config.tmpl1);

            return ReactDOMServer.renderToStaticMarkup(tmpl0.page(post, paper_css))
                + ReactDOMServer.renderToStaticMarkup(tmpl1.page(post, paper_css));
        })
            .join(PAGE_BREAK) +
        HTML_END;

//    console.log(html);
//   return Promise.resolve('fast');

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

