import {Session} from "./Session";

const {exec} = require('child_process');

const inst_api = (s, cmd, args = []) => {
    return new Promise((resolve, reject) => {
        exec(`php ./src/server/inst_api.php ${s.username} ${s.password} ${cmd} ` + args.join(' '),
            {maxBuffer: 1024 * 1024},
            (error, stdout, stderr) => {
                if (error) {
                    reject('Fatal exec error: ' + error);
                } else {
                    try {
                        const obj = JSON.parse(stdout);

                        if (obj.status!=='ok') {
                            reject(obj.error_message || { fuck: 'ttt'} );
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

export const disconnect = s => s.log('WS client is disconnected');

export const hola = (s: Session, data: string) => {
    s.log('Hola from', data);
    s.client_name = data;

    return Promise.resolve('Hellow');
};

export const login = (s: Session, data) => {
    s.log('Login:', data);

    s.username = data.name;
    s.password = data.pwd;

    return inst_api(s, 'login')
        .then(res => {
            s.log('Server actions after successful LOGIN', res);
            return res;
        })
        // .catch(err => {
        //         console.error('Server have login trouble: ', err);
        //  //   return {status:err};
        //         throw new Error(err)
        //     }
        // );
};

export const cmd = (s: Session, data) => {
    const {cmd, ...params} = data;

    s.log(cmd + ':', params);

    return inst_api(s, cmd, params.args);
};