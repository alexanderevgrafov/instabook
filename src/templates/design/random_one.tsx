import * as _ from 'underscore';
import * as  React from 'react'
import {TemplateModel, merge_css} from "./TemplateModel";
import Utils from '../../js/app/Utils'

const SCALE_VARIATION = .4;
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
                height:100,
                width:'100%',
//                border:'1px solid blue',
                zIndex:2
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

    photoline = (ps, css, rnd) =>
        ps.length ?
            _.map(ps, (url, i) =>
                <img style={
                    merge_css(css.p_float, {
                    width: 100/ps.length + '%',
                    left:100*i/ps.length + '%',
                        transform: 'scale(' + (.8 + .5*SCALE_VARIATION - SCALE_VARIATION*rnd()) + ') rotate('+(-ROTATE_UPTO/2+ ROTATE_UPTO*rnd())+'deg)',
                        WebkitTransform: 'scale(' + (.8 + .5*SCALE_VARIATION - SCALE_VARIATION*rnd()) + ') rotate('+(-ROTATE_UPTO/2+ ROTATE_UPTO*rnd())+'deg)'
                })}
                     src={url}  alt='' key={url}/>
            )
            : null;

    page_in(p) {
        const photos = p.media.hd_urls,
            css = this.getCss(p),
            photo0 = photos.shift(),
            mid = Math.ceil(photos.length / 2),
            photos_top = photos.slice(0, mid),
            photos_bot = photos.slice(mid),
            random = Utils.random_seed(p.config.random_seed);

        return <div style={css.img_block}>
        <div style={merge_css(css.photo_line_abs, {})}>

        {this.photoline(photos_top, css, random)}
        </div>

            <img src={photo0} style={merge_css(css.img0, {top: mid ? 100 / (mid * 2) + '%' : 0})} alt=''/>
            { photos_bot.length ?
        <div style={merge_css(css.photo_line_abs, {bottom: 0, height: mid ? 100 / mid  + '%' : 0})}>

        {this.photoline(photos_bot, css, random)}
    </div> : null }

    </div>;
    }
}



