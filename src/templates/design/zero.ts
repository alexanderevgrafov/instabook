import * as  _ from 'underscore';
//import icon from '../icons/zero.png';

const params = {
    'native'   : 'Zero',
    'max_pics' : 1
}, icon='';

const css = p => {
    return `
<style>
    .body {
        background-color: #ffe2ee;
        font-size: 14pt;
        font-family: "Times New Roman";
    }

    .img0 {
        display: block;
        width: 100%;
        margin: 0 auto;
    }
    
    .flex_line {
        display:flex;
    }
    
    .flex_line > * {
        flex:1 1;
    }
    
    .w100 {
    width:100%;
    }
    
    .photoline {
    width:100%;
    }

    .post {
        font-size: ` + (p.config.post_font_size / 100) + `em;
    }
</style>`;
};

const page1 = p => {
    const photos = p.media_urls;



    return `<table class='img_block'>
<img src='${p.media_urls[0]}' class='img0' alt=''/>
<table class='photoline'><tr>
`           + (_.map( p.media_urls.slice( 1 ), url =>
            `<td style='width:`+(100/(photos.length-1))+`%'><img src='${url}' class='w100' alt=''/></td>`
        ).join(''))
           + `</tr></table></div>`;

};

const page2 = p => {
    return `
    <div class='post'>${p.post_text}</div>
    `;
};

export { params, page1, page2, css, icon }