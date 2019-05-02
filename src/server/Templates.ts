import * as  _ from 'underscore';
import * as fs from "fs"
import * as Handlebars from "handlebars";

interface TemplateDescription {
    tmpl: Function,
    params?: { [propName: string]: string }
}

const TMPL_PATH = './src/templates/',
    PAGE_BREAK = `<div style='page-break-before:always;'></div>`,
    cache: { [propName: string]: TemplateDescription } = {},
    templates = function (name: string): TemplateDescription {

        if (!cache[name]) {
            // fs.readFileSync(TMPL_PATH + name + '/' + name + '.hbs', (err, data) => {
            //     cache[name] = Handlebars.compile(data.toString());
            // });
            let tmpl_file_name = '',
                dir = fs.readdirSync(TMPL_PATH + name, 'utf8');

            // template file can have any name, generally.  but the extention is HBS
            for (let i in dir) {
                const name = dir[i].split('.');

                if (name.pop() === 'hbs') {
                    tmpl_file_name = dir[i];
                    break;
                }
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


