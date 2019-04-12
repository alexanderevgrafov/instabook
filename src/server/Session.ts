export class Session {
    public client_name: string;
    public username: string;
    public password: string;

    private socket = null;

    constructor( params ) {
        this.socket = params.socket;
    }

    public log = (...params) => this.doLog('log', ...params);
    public warn = (...params) => this.doLog('warn', ...params);
    public error = (...params) => this.doLog('error', ...params);

    private doLog(level: string, ...params) {
        console[level]('[' + (this.client_name || '---') + ']' + (level !== 'log' ? ('[' + level + ']') : '') + ': ', ...params);
    }

    public emit(name, ...data) {
        this.socket && this.socket.emit(name, ...data);
    }
}