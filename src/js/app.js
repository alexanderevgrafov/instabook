import "reflect-metadata";

import 'whatwg-fetch'
import { polyfill } from 'es6-promise';
polyfill();

import React  from 'react-type-r'
import * as ReactDOM from 'react-dom'
import Application from "./pages/index";

ReactDOM.render( React.createElement( Application, {} ), document.getElementById( 'app-mount-root' ) );