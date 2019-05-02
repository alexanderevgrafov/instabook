import * as  _ from 'underscore';
import * as fs from "fs"
import * as Handlebars from "handlebars";

const TMPL_PATH = './src/templates/';

const PAGE_BREAK = '<div style="page-break-before:always;"></div>';
const templates : { [propName: string]: Function } ={};

Handlebars.registerHelper('page_break', function() {
    return PAGE_BREAK;
});

_.each('page0,page1'.split(','), name=>{
    fs.readFile(TMPL_PATH + name+'.handlebars', (err,data)=>{
        templates[name] = Handlebars.compile( data.toString() );
    });
});


export {
    templates,
    PAGE_BREAK
}


