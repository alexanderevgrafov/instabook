import * as  _ from 'underscore';
import * as React from 'react'
import {define, type, auto, Record} from 'type-r'
import {InPost, PostConfig} from '../../js/models/InModels';
import {papers} from '../all_server';

const MAX_PADDING = 60; // mm

export const merge_css = (...args : object[]) => _.extend({}, ...args);

@define
export class TemplateModel extends Record {
    static idAttribute = 'name';

    @auto name: string;
    @auto native: string = 'Default tmpl name';
    @auto icon: string = '';
    @auto type: string = 'media';
    @auto params: object = {};

    getGlobalStyles(p: PostConfig): object {
        const css = {
            body: {
                position: 'relative',
                fontSize: '14pt',
                fontFamily: 'Arial Helvetica'
            },

            content_wrapper: {
                position: 'absolute',
                // see code under for top-left-bottom-right definition
            },

            w100: {
                width: '100%'
            },

            photoline: {
                width: '100%',
                borderSpacing: 0
            },

            photoline_td: {
                padding: 0
            },

            to_center: {
                textAlign:'center'
            },

            inline_block: {
                display:'inline-block'
            },

            post: {
                fontSize: p.post_font_size / 100 + 'em'
            }
        };

        _.map(['top', 'bottom', 'left', 'right'],
            n => css.content_wrapper[n] = p.page_padding * MAX_PADDING / 100 + 'mm');

        return css;
    }

    getStyles(p: PostConfig) {
        return {}
    }

    getCss(p: InPost): any {
        const css0 = this.getGlobalStyles(p.config),
            css = this.getStyles(p.config);

        for (let key in css0) {
            css[key] = merge_css(css0[key], css[key]);
        }

        return css;
    }

    page_in(p: InPost, area: object) {
        const css = this.getCss(p);

        return <div style={css.post} dangerouslySetInnerHTML={{__html: p.post_text}}/>
    }

    page(p: InPost, paper_size: string): object | null {
        const page_css = papers[paper_size],
            css = this.getCss(p),
            page_width = parseInt(page_css.width),
            page_height = parseInt(page_css.height),
            area = {
                width: page_width - (p.config.page_padding * MAX_PADDING * 2 / 100),
                height: page_height - (p.config.page_padding * MAX_PADDING * 2 / 100),
            };

        return <div style={_.extend({}, css.body, page_css)}>
            <div style={css.content_wrapper}>
                {this.page_in(p, area)}
            </div>
        </div>;
    }
}
