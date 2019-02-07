//import 'type-r/globals'
import React, { define } from 'react-mvx'

import { Route, Switch } from 'react-router'
import { BrowserRouter } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'

//import 'sass/app.scss'

@define
export class Application extends React.Component {

    render() {
        return (
            <h1>Here we are!</h1>
        );
    }
}
