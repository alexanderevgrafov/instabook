import {Session} from './Session'

export interface WsHandler {
    (s: Session, data: any): Promise<{}>;
}
