import React from 'react-type-r'
import { define } from 'type-r'
import { createBrowserHistory } from 'history'
import {Router, Switch, Route} from 'react-router'
import AdminTools from './AdminTools'
import ApplicationPage from './ApplicationPage'
import 'scss/app.scss'

const history = createBrowserHistory();

@define
export default class Application extends React.Component {
    render() {
        return <Router history={history}>
            <Switch>
                <Route path='/admin' component={AdminTools}/>
                <Route path='/' component={ApplicationPage}/>
            </Switch>
        </Router>;
    }
}
