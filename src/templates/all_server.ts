/*import {TemplateDescription} from '../server/interfaces'


const TMPL_PATH = '../../src/templates/design/',
    cache: { [propName: string]: TemplateDescription } = {};

const templates = function (name: string): TemplateDescription {
    if (!cache['design_' + name]) {

        try {
            cache['design_' + name] = require(TMPL_PATH + name + '.ts');
        } catch(e) {
            console.error ('all_server: in ' + __dirname + ' ---> ', e);
        }
    }

    return cache['design_' + name];
};
*/

import * as zero from './design/zero';
import * as number1 from './design/number1';
import * as third from './design/third';

const templates: any= {zero, number1, third};


const papers = {
    a5 : `
  <style>
    body {
        margin: 0
    }

    .body {
        width: 147mm;
        height: 209mm;
        overflow: hidden;
        box-sizing: border-box;
        font-weight: 400;
        line-height: 1.6;
        text-align: left;
        font-size: 14pt;
    }
</style>
  `
};

export {
    templates,
    papers
}


