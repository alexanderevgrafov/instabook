//import 'type-r/globals'
import React, { define } from 'react-type-r'
import { Record } from 'type-r'
import * as socketIOClient from 'socket.io-client';
import { Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import { Input, Button } from 'ui/Controls'
import config from '../../server/config'

let ws;
//import 'bootstrap/dist/css/bootstrap.min.css'

//import 'sass/app.scss'

@define
class ApplicationState extends Record {
    static attributes = {
        user_name : '',
        user_pwd  : ''
    }
}

@define
export class Application extends React.Component {
    static state = ApplicationState;

    componentWillMount() {
        ws = socketIOClient( (config.ws_server_addr || 'http://localhost') + ':' + config.ws_server_port );
        ws.emit( 'hola', '-client-' );
    }

    onInstLogin = () => {
        const { user_name, user_pwd } = this.state;
        ws.emit( 'login', { user_name, user_pwd } );
    };

    render() {
        return <div>
            <h1>Instagramm login:</h1>
            <div>username: <Input valueLink={this.state.linkAt( 'user_name' )}/></div>
            <div>password: <Input valueLink={this.state.linkAt( 'user_pwd' )} type='password'/></div>
            <Button onClick={this.onInstLogin} label='Login'/>
        </div>;
    }
}
