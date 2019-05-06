import * as  _ from 'underscore';
import * as React from 'react'
import {define, type, auto, Record} from 'type-r'
import {InstaPost, PostConfig} from '../../js/models/InstaModels';

export const merge_css = (a, b) => _.extend({}, a, b || {});

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

            post: {
                fontSize: p.post_font_size / 100 + 'em'
            }
        };

        _.map(['top', 'bottom', 'left', 'right'],
            n => css.content_wrapper[n] = p.page_padding * 60 / 100 + 'pt');

        return css;
    }

    getStyles(p: PostConfig) {
        return {}
    }

    getCss(p: InstaPost): any {
        const css0 = this.getGlobalStyles(p.config),
            css = this.getStyles(p.config);

        for (let key in css0) {
            css[key] = merge_css(css0[key], css[key]);
        }

        return css;
    }

    page_in(p: InstaPost) {
        const css = this.getCss(p);

        return <div style={css.post} dangerouslySetInnerHTML={{__html: p.post_text}}/>
    }

    page(p: InstaPost, page_css: object): object | null {
        const css = this.getCss(p);

        return <div style={_.extend({}, css.body, page_css)}>
            <div style={css.content_wrapper}>
                {this.page_in(p)}
            </div>
        </div>;
    }
}
