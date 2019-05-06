import * as  _ from 'underscore';
import {TemplateModel, merge_css} from "./TemplateModel";
import * as React from 'react'

export default
class Zero extends TemplateModel {
    name= 'times';
    native = 'Times';
    type = 'text';
    icon = '';
    params = {    };

    getStyles(p) {
        return {
            body: {
                fontFamily: "Times New Roman"
            }
        };
    }
}