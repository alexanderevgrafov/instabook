import * as _ from 'underscore';
import {Collection, define, Record} from 'type-r'

import {papers} from './papers';

import times_new from './design/times_new';
import img1_9 from './design/img1_9';
import chess from './design/chess';
import square_plus from './design/square_plus';
import comic_sans from './design/comic_sans';

import {TemplateModel} from "./design/TemplateModel";
//import {InMedia} from "../js/models/InModels";

const template_classes = {
    img1_9, times_new, chess, square_plus, comic_sans
};

@define
export class TemplateModelCollection extends Collection<TemplateModel> {}

const templates: TemplateModelCollection = new TemplateModelCollection;

_.mapObject(template_classes, constr => templates.add(new constr));

export {
    papers,
    templates,
    TemplateModel
}