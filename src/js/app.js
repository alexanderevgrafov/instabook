import "reflect-metadata";

import 'whatwg-fetch'
import { polyfill } from 'es6-promise';
polyfill();

import React  from 'react-type-r'
import * as ReactDOM from 'react-dom'
import { ApplicationPage } from "./pages/ApplicationPage";

ReactDOM.render( React.createElement( ApplicationPage, {} ), document.getElementById( 'app-mount-root' ) );