import {Session} from './Session'

export interface WsHandler {
    (s: Session, data: any): Promise<{}>;

}

export interface WsInputObject {
    signature: string;
}

export interface TemplateDescription {
    params: object;

    page1(object): string;

    page2(object): string;

    css(object): string;

    icon: string;
}
