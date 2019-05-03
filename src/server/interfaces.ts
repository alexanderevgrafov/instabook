import {Session} from './Session'

export interface WsHandler {
    (s: Session, data: any): Promise<{}>;

}

export interface WsInputObject {
    signature: string;
}

export interface TemplateDescription {
    tmpl: Function,
    params?: { [propName: string]: string }
}

