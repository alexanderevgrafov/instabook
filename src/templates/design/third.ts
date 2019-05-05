//import icon from '../icons/zero.png';

const icon = '';

const params = {
    'native'   : 'Third',
    'max_pics' : 10
};

const css = p => {
    return `
<style>
    .body {
        background-color: #ffe2ee;
        font-size: 14pt;
        font-family: "Comic Sans MS";
    }

    .img0 {
        display: block;
        width: 50%;
        margin: 0 0 0 auto;
    }

    .post {
        font-size: `+(p.config.post_font_size/100) + `em;
    }
</style>`;
};

const page1 = p => {
    return `<div class='img_block'>
        <img src='${p.media_urls[0]}' class='img0' alt=''/>
    </div>`;

};

const page2 = p => {
    return `
    <div class='post'>${p.post_text}</div>
    `;
};

export { params, page1, page2, css, icon }