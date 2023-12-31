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

    page_in(p, area) {
        const photos = p.media.hd_urls,
            css = this.getCss(p),
            sq = Math.floor(Math.sqrt(photos.length)),
            rest = photos.length - sq * sq,
            table_add_style={},
            trs = [], tds = [];

        // TODO: Assuming photos are all square, need non-square photos support
        let row_h = area.height - area.width,
            rest_h = rest > 0 ? Math.min(row_h, area.width / rest) : 0;

        const last_line_space = row_h*rest/area.width;
        if (last_line_space < 1 && last_line_space > .8) {
            table_add_style['width'] = last_line_space*100 + '%';
            table_add_style['marginLeft'] = (50-last_line_space*50) + '%';
        }

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

        for (let i = 0; i < rest; i++) {
            const url = photos[sq * sq + i];
            url &&
            tds.push(<td style={merge_css(css.photoline_td, css.to_center, {width: (100 / Math.max(rest, sq)) + '%'})}
                         key={i}>
                <img src={url} style={merge_css(css.inline_block, {width: rest_h + 'mm'})} alt=''/>
            </td>);
        }

        return <div style={css.img_block}>
            <table style={merge_css(css.photoline, table_add_style)}>
                <tbody>
                {trs}
                </tbody>
            </table>
            {
                tds.length ? <table style={merge_css(css.photoline, table_add_style)}>
                    <tbody>
                    <tr key='last'>{tds}</tr>
                    </tbody>
                </table> : null
            }
            <div style={css.copyright}>&copy; {p.media.user.username}</div>
        </div>;
    }
}


