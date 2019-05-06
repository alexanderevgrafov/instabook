import * as _ from 'underscore';
import * as  React from 'react'
import {TemplateModel, merge_css} from "./TemplateModel";

export default class Zero extends TemplateModel {
    name = 'img19';
    native = '1+9';
    icon = '';
    params = {};

    getStyles(p) {
        return {
            img0: {
                display: 'block',
                width: '100%',
                margin: '0 auto'
            }
        };
    }

    page_in(p) {
        const photos = p.media_urls,
            css = this.getCss(p);

        return <div style={css.img_block}>
            <img src={photos[0]} style={css.img0} alt=''/>
            <table style={css.photoline}>
                <tbody>
                <tr>
                    {
                        _.map(p.media_urls.slice(1), url =>
                            <td style={merge_css(css.photoline_td, {width: (100 / (photos.length - 1)) + '%'})}
                                key={url}>
                                <img src={url} style={css.w100} alt=''/>
                            </td>)
                    }
                </tr>
                </tbody>
            </table>
        </div>;
    }
}

