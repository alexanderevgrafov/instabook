//import icon from '../icons/zero.png';

const icon = '';

const params = {
    'native'   : 'Number 1',
    'max_pics' : 5
};

const css = p => {
    return `
<style>
    .body {
        background-color: #d7efff;
        font-size: 14pt;
        font-family: "Arial";
    }

    .img0 {
        display: block;
        width: 50%;
        margin: 0 auto 0 0;
    }

    .post {
        font-size: ` + (p.config.post_font_size/100) + `em;
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