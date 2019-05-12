import * as  _ from 'underscore';
import {TemplateModel, merge_css} from "./TemplateModel";
import * as React from 'react'

export default class square_pl extends TemplateModel {
    name = 'square_plus';
    native = 'Square+line';
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
            sq = Math.floor(Math.sqrt(photos.length)),
            rest = photos.length - sq * sq;

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
        const tds = [];

        for (let i = 0; i < rest; i++) {
            const url = photos[sq * sq + i];
            url &&
            tds.push(<td style={merge_css(css.photoline_td, {width: (100 / Math.max(rest, sq)) + '%'})} key={i}>
                <img src={url} style={css.w100} alt=''/>
            </td>);
        }

        return <div style={css.img_block}>
            <table style={css.photoline}>
                <tbody>
                {trs}
                </tbody>
            </table>
            {
                tds.length ? <table style={css.photoline}>
                    <tbody>
                    <tr key='last'>{tds}</tr>
                    </tbody>
                </table> : null
            }
        </div>;
    }
}


