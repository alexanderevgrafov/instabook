import { InstaFolder } from '../js/models/InstaModels'

interface WsInputObject {
    signature: string;
}

export class Session {
    public client_name: string;
    public username: string;
    public password: string;

    private socket = null;

    public folders = null;

    constructor(params) {
        this.socket = params.socket;
        this.folders = new InstaFolder.Collection();
    }

    public log = (...params) => this.dolog('log', ...params);
    public log_warn = (...params) => this.dolog('warn', ...params);
    public log_error = (...params) => this.dolog('error', ...params);

    private dolog(level: string, ...params) {
        console[level]('[' + (this.client_name || '---') + ']' + (level !== 'log' ? ('[' + level + ']') : '') + ': ', ...params);
    }

    public emit(name: string, ...data) {
        this.socket && this.socket.emit(name, ...data);
    }

    public ws_success(input: WsInputObject, output: any) {
        this.emit('answer', {__status: 'ok', __sig: input.signature, answer: output});
        this.log('Answer emitted: ', output)
    }

    public ws_error(input: WsInputObject, output: Error) {
        this.emit('answer', {__status: 'error', __sig: input.signature, msg: output.message});
        this.log_error('Error emitted: ', output.message);
    }
}