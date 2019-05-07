import * as  _ from 'underscore';
import {TemplateModel, merge_css} from "./TemplateModel";
import * as React from 'react'

export default class chess extends TemplateModel {
    name = 'chess';
    native = 'Chess';
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
        const photos = p.media.hd_urls,
            css = this.getCss(p),
            sq = Math.min(9, Math.ceil(Math.sqrt(photos.length)));

        const trs = [];

        for (let j = 0; j < sq; j++) {
            const tds = [];
            for (let i = 0; i < sq; i++) {
                const url = photos[j * sq + i];
                url &&
                tds.push(<td style={merge_css(css.photoline_td, {width: (100 / sq) + '%'})} key={i}>
                    <img src={url} style={css.w100} alt=''/>
                </td>);
            }
            if (tds.length) {
                trs.push(<tr key={j}>{tds}</tr>);
            }
        }

        return <div style={css.img_block}>
            <table style={css.photoline}>
                <tbody>
                {trs}
                </tbody>
            </table>
        </div>;
    }
}


