import "reflect-metadata";
import React  from 'react-type-r'
import * as ReactDOM from 'react-dom'
import { Application } from "./pages/index";

ReactDOM.render( React.createElement( Application, {} ), document.getElementById( 'app-mount-root' ) );