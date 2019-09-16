//import React from 'react-mvx'
//import ReactDOMServer from 'react-dom/server'
import * as  _ from 'underscore';
import * as fs from 'fs'
import {WsHandler} from "./interfaces";
import * as  pdf from 'html-pdf';
import {templates } from "../templates/all_server";
import {InPost, PostConfig} from "../js/models/InModels";

const ReactDOMServer = require('react-dom/server');

const    PAGE_BREAK = `<div style='page-break-before:always;'></div>`,
    HTML_START = `<html><body style='margin:0'>`,
    HTML_END = `</body></html>`;

const PAPER_SIZE = 'a5';

export const PDFgenerate: WsHandler = (s, data) => {
    const {fid} = data,
        {folders} = s, folder = folders.get(fid);

    if (!folder) {
        throw new Error('Folder not located by its FID');
    }

    const posts_to_render = [];

    _.mapObject(data.items, (conf, id) => {
        const x = folder.items.get(id);
        x.config.set(conf, {parse: true});
        posts_to_render.push(x);
    });

    const filename = './pdf/' + new Date().toLocaleString().replace(new RegExp('\\W', 'g'), '_')
        + '_' + posts_to_render.length * 2 + '_pages.pdf';

    const html = HTML_START +
        _.map(posts_to_render, post => {
            const tmpl0 = templates.get(post.config.tmpl0),
                tmpl1 = templates.get(post.config.tmpl1);

            return ReactDOMServer.renderToStaticMarkup(tmpl0.page(post, PAPER_SIZE))
                + ReactDOMServer.renderToStaticMarkup(tmpl1.page(post, PAPER_SIZE));
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

                 fs.writeFile('inta_html_log.txt', html, {flag: 'w'}, () => {
                     resolve(html);
                 });
            })
    });

};

export const PDF_test: WsHandler = (s, data) => {
    const post = new InPost(data.post),
        filename = './pdf/' + new Date().toLocaleString().replace(new RegExp('\\W', 'g'), '_') +
            '_' + post.config.tmpl0 + '_' + post.config.tmpl1 + '.pdf';

    const posts_to_render = [post];

    let html = HTML_START +
        _.map(posts_to_render, post => {
            const tmpl0 = templates.get(post.config.tmpl0),
                tmpl1 = templates.get(post.config.tmpl1);

            return ReactDOMServer.renderToStaticMarkup(tmpl0.page(post, PAPER_SIZE))
                + ReactDOMServer.renderToStaticMarkup(tmpl1.page(post, PAPER_SIZE));
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

