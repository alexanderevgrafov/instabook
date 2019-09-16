import * as _ from 'underscore';
import * as  React from 'react'
import {TemplateModel, merge_css} from "./TemplateModel";
import Utils from '../../js/app/Utils'

const SCALE_VARIATION = .3;
const ROTATE_UPTO = 20;

export default class Template extends TemplateModel {
    name = 'random_1';
    native = 'One + random top-bottom';
    icon = '';
    params = {};

    getStyles(p) {
        return {
            img_block: {
//                backgroundColor: 'red',
                height: '100%'
            },
            img0: {
                display: 'block',
                width: '100%',
                position: 'absolute'
            },
            photo_line_abs: {
                position: 'absolute',
                height: 100,
                width: '100%',
//                border:'1px solid blue',
                zIndex: 2
            },

            half_h: {
                position: 'relative',
                paddingTop: '50%',

            },
            p_float: {
                position: 'absolute',
                boxShadow: '.5em .5em 1em rgba(0,0,0,.5)'
            }
        };
    }

    photoline = (ps, css, rnd, h, w) =>
        ps.length ?
            _.map(ps, (url, i) =>
                <img style={
                    merge_css(css.p_float, {
                        width: h + 'mm',
                        left: (w * i / ps.length + (w / ps.length - h) / 2) + 'mm',
                        transform: 'scale(' + (.8 + .5 * SCALE_VARIATION - SCALE_VARIATION * rnd()) + ') rotate(' + (-ROTATE_UPTO / 2 + ROTATE_UPTO * rnd()) + 'deg)',
                        WebkitTransform: 'scale(' + (.8 + .5 * SCALE_VARIATION - SCALE_VARIATION * rnd()) + ') rotate(' + (-ROTATE_UPTO / 2 + ROTATE_UPTO * rnd()) + 'deg)'
                    })}
                     src={url} alt='' key={url}/>
            )
            : null;

    page_in(p, area) {
        const photos = p.media.hd_urls,
            css = this.getCss(p),
            photo0 = photos.shift(),
            mid = Math.max(Math.ceil(photos.length / 2), 3),
            photos_top = photos.slice(0, mid),
            photos_bot = photos.slice(mid),
            random = Utils.random_seed(p.config.random_seed),
            line_h = (area.height - area.width) / ((!photos_bot.length && photos_top.length) ? 1 : 2)
        ;

        return <div style={css.img_block}>
            <div style={merge_css(css.photo_line_abs, {})}>

                {this.photoline(photos_top, css, random, line_h, area.width)}
            </div>
            <img src={photo0} style={merge_css(css.img0, {top: line_h + 'mm'})} alt=''/>
            {photos_bot.length ?
                <div style={merge_css(css.photo_line_abs, {bottom: 0, height: line_h + 'mm'})}>

                    {this.photoline(photos_bot, css, random, line_h, area.width)}

                </div> : null}

            <div style={css.copyright}>&copy; {p.media.user.username}</div>
        </div>;
    }
}



