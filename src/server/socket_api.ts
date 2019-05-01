import {Session} from "./Session";
import * as _ from 'underscore'
import {exec} from 'child_process';
import {WsHandler} from './interfaces'
import {PDFgenerate} from './pdf'

const inst_api = (s: Session, cmd: string, args: [] = []) => {
    return new Promise((resolve, reject) => {
        exec(`php ./src/server/inst_api.php ${s.username} ${s.password} ${cmd} ` + args.join(' '),
            {maxBuffer: 1024 * 1024},
            (error, stdout, stderr) => {

                // fs.writeFile('inta_log.txt', Date().toString() + ': ' + error + ' :' + stdout + ' :' + stderr, {flag: 'a'}, () => {
                //
                // });

                if (error) {
                    reject('Fatal exec error: ' + error);
                } else {
                    try {
                        const obj = JSON.parse(stdout);

                        if (obj.status !== 'ok') {
                            reject(obj.error_message || {fuck: 'ttt'});
                        } else {
                            obj.command = cmd;

                            resolve(obj);
                        }
                    } catch (e) {
                        reject('FATAL JSON parse error: \n' + stdout + '\n\n** STDERR: ' + stderr);
                    }
                }
            });
    });
};

const disconnect = s => s.log('WS client is disconnected');

const hola: WsHandler = (s, data: string) => {
    s.log('Hola from', data);
    s.client_name = data;

    return Promise.resolve('Hellow');
};

const login: WsHandler = (s, data) => {
    s.log('Login:', data);

    s.username = data.name;
    s.password = data.pwd;

    return inst_api(s, 'login')
        .then(res => {
            s.log('Server actions after successful LOGIN', res);
            return res;
        })
};

const cmd: WsHandler = (s, data) => {
    const {cmd, ...params} = data;

    s.log(cmd + ':', params);

    return inst_api(s, cmd, params.args).then((obj: any) => {
        switch (cmd) {
            case 'folders':
                s.folders.add(obj.items, {parse: true});
                break;
            case 'folder_content':
                const {folders} = s,
                    folder = folders.get(obj.collection_id);

                if (folder) {
                    folder.items.add(_.map(obj.items, item => {
                        item.id = item.media && item.media.id;
                        return item;
                    }), {parse: true});
                }
                break;
        }
        return obj;
    });
};

export const api_map = {
    hola,
    disconnect,
    login,
    get_folders: (s, dt) => cmd(s, {cmd: 'folders'}),
    get_folder_items: (s, dt) => cmd(s, _.extend(dt, {cmd: 'folder_content'})),
    gen_pdf: PDFgenerate
};