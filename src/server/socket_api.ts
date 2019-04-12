const { exec } = require('child_process');

const inst_api = (s, cmd, args = [] )=>{
    exec(`php ./src/server/inst_api.php ${s.username} ${s.password} ${cmd} ` + args.join(' '),
        {maxBuffer: 1024 * 1024},
        (error, stdout, stderr) => {
        if (error) {
            console.error('exec error: ' + error);
        } else {
            try {
                const obj = JSON.parse(stdout);
                obj.command = cmd;
                s.emit('answer', obj);
                s.log('Answer emitted', obj);
            } catch(e) {
                console.error('** JSON PARSE failed for: \n', stdout, '\n\n** STDERR: ', stderr );
            }
        }
    });
};

export const disconnect = s => s.log('WS client is disconnected');

export const hola = (s, data) => {
    s.log('Hola from', data);
    s.client_name = data;
};

export const login = (s, data) => {
    s.log('Login:', data);
    s.username = data.name;
    s.password = data.pwd;

    inst_api(s, 'login');
};

export const cmd = (s, data) => {
    const { cmd, ...params } = data;
    s.log(cmd + ':', params);

    inst_api(s, cmd, params.args);
};