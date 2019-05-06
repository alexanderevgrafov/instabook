import * as  _ from 'underscore';
import {TemplateModel, merge_css} from "./TemplateModel";
import * as React from 'react'

export default
class Zero extends TemplateModel {
    name='comic';
    native = 'Comic Sans font';
    type = 'text';
    icon = '';

    getStyles(p) {
        return {
            body: {
                fontFamily: "Comic Sans MS"
            }
        };
    }
}