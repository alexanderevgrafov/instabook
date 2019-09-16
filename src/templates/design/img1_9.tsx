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

    page_in(p, area) {
        const photos = p.media.hd_urls,
            css = this.getCss(p),
            // TODO: Assuming photos are all square, need non-square photos support
            row_h = area.height - area.width,
            photos_h = photos.length > 1 ? Math.min(row_h, area.width / (photos.length - 1)) : 0
        ;

        return <div style={css.img_block}>
            <img src={photos[0]} style={css.img0} alt=''/>
            <table style={merge_css(css.photoline, { width:area.width}) }>
                <tbody>
                <tr>
                    {
                        _.map(photos.slice(1), url =>
                            <td style={merge_css(css.photoline_td, css.to_center, {width: (100 / (photos.length - 1)) + '%'})}
                                key={url}>
                                <img src={url} style={merge_css(css.inline_block, {width: photos_h + 'mm'})} alt=''/>
                            </td>)
                    }
                </tr>
                </tbody>
            </table>
            <div style={css.copyright}>&copy; {p.media.user.username}</div>
        </div>;
    }
}

