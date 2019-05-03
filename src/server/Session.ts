import {Record, Collection, type, define, auto} from 'type-r'
import {InstaFolder} from '../js/models/InstaModels'
import { WsInputObject } from './interfaces'

@define
class InstaFolderCollection extends InstaFolder.Collection {
}

@define
export class Session extends Record {
    @auto client_name: string;
    @auto username: '';
    @auto password: '';
    @type(InstaFolder.Collection).as folders: Collection<InstaFolder>;
    @auto socket: any;

    log = (...params) => this.dolog('log', ...params);
//    log_warn = (...params) => this.dolog('warn', ...params);
    log_error = (...params) => this.dolog('error', ...params);

    private dolog(level: string, ...params) {
        console[level]('[' + (this.client_name || '---') + ']' + (level !== 'log' ? ('[' + level + ']') : '') + ': ', ...params);
    }

    emit(name: string, ...data) {
        this.socket && this.socket.emit(name, ...data);
    }

    ws_success(input: WsInputObject, output: any) {
        this.emit('answer', {__status: 'ok', __sig: input.signature, answer: output});
        this.log('Answer emitted: ', output)
    }

    ws_error(input: WsInputObject, output: Error) {
        this.emit('answer', {__status: 'error', __sig: input.signature, msg: output.message});
        this.log_error('Error emitted: ', output.message);
    }
}