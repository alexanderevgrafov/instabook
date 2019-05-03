import * as  _ from 'underscore';
import * as fs from "fs"
import * as Handlebars from "handlebars";
import { TemplateDescription } from './interfaces'

const TMPL_PATH = './src/templates/',
    PAGE_BREAK = `<div style='page-break-before:always;'></div>`,
    cache: { [propName: string]: TemplateDescription } = {},
    templates = function (name: string): TemplateDescription {

        if (!cache[name]) {
            let tmpl_file_name = '',
                dir = fs.readdirSync(TMPL_PATH + name, 'utf8');

            // template file can have any name, generally.  but the extension is HBS
            for (let i in dir) {
                const name = dir[i].split('.');

                if (name.pop() === 'hbs') {
                    tmpl_file_name = dir[i];
                    break;
                }
            }

            // TODO: Add require for template params as well - usefull to validate request
            if (!tmpl_file_name) {
                throw new Error('Template file for `' + name + '` not found');
            }

            const data = fs.readFileSync(TMPL_PATH + name + '/' + tmpl_file_name, 'utf8');

            cache[name] = {tmpl: Handlebars.compile(data)};
        }

        return cache[name];
    };

Handlebars.registerHelper('page_break', function () {
    return PAGE_BREAK;
});

export {
    templates,
    PAGE_BREAK
}


