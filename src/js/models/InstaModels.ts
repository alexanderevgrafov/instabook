import {Record, Collection, type, predefine, define, definitions, auto} from 'type-r'

@define
export class InstaUser extends Record {
    static attributes = {
        allowed_commenter_type: '',
        can_boost_post: false,
        can_see_organic_insights: false,
        full_name: '',
        has_anonymous_profile_picture: true,
        is_private: false,
        is_unpublished: false,
        is_verified: false,
        pk: '',
        profile_pic_url: '',
        reel_auto_archive: 'unset',
        show_insights_terms: false,
        username: '',
    }
}

@define
export class InstaImageVersion extends Record {
    static attributes = {
        width: 0,
        height: 0,
        url: ''
    };
}

@define
export class InstaImageVersionCollection extends InstaImageVersion.Collection {
    static comparator = 'width';

    small() {
        return this.at(0);
    };

    big() {
        return this.at(this.length - 1);
    };

    parse(data) {
        return data.candidates
    }
}

@define
export class InstaCaption extends Record {
    @auto bit_flags: 0;
    @auto content_type: '';
//        created_at         : type( Timestamp ),
//        created_at_utc     : type( Timestamp ),
//    @auto did_report_as_spam: false;
    @auto has_translation: true;
    @auto media_id: 0;
    @auto pk: 0;
//    @auto share_enabled: false;
    @auto status: 'Active';
    @auto text: '';
    @auto type: 0;
    @auto user_id: 0;
}

@define
export class PostConfig extends Record {
    @auto('zero') tmpl: string;
    @auto(100) post_font_size: number;
    @auto(false) double_side: boolean;
}

@define
class InstaMediaCollection extends Collection<InstaMedia> {}

@define
export class InstaMedia extends Record {
    static Collection = InstaMediaCollection;
    @auto id: '';
    @auto carousel_media: InstaMediaCollection;
    @auto(1) media_type: number;
    @type(InstaImageVersionCollection).as image_versions2: InstaImageVersionCollection;
    @auto(0) carousel_media_count: number;
    @auto caption: InstaCaption;
    @auto like_count: 0;
    @auto original_height: 0;
    @auto original_width: 0;
    @auto taken_at: 0;
    @auto user: InstaUser;
    @auto video_duration: 0;
/*
can_view_more_preview_comments    : false,
can_viewer_reshare                : true,
can_viewer_save                   : true,
caption_is_edited                 : false,
client_cache_key                  : '',
code                              : '',
   @auto comment_count: 0;
comment_likes_enabled             : true,
comment_threading_enabled         : true,
   @auto device_timestamp: 0;
filter_type                       : 0,
has_audio                         : true,
has_liked                         : false,
has_more_comments                 : false,
has_viewer_saved                  : true,
inline_composer_display_condition : '',
is_dash_eligible                  : 1,
lat                               : 0,
lng                               : 0,
       likers: (5) [{…}, {…}, {…}, {…}, {…}]
       location: {pk: "213063425", name: "Arambol, Goa, India", address: "", city: "", short_name: "Arambol", …}
        max_num_visible_preview_comments  : 0,
        number_of_qualities               : 1,
        organic_tracking_token            : '',
photo_of_you                      : false,
pk                                : '',
preview_comments                  : [],
saved_collection_ids              : [ '18023306578072901' ],
   @auto video_codec: '';
video_dash_manifest: ""
video_versions: (3) [{…}, {…}, {…}],
   @auto view_count: 0;
*/

    get fullURL() {
        let img = this.media_type === 8 ? this.carousel_media.at(0).fullURL : this.image_versions2.big();

        return img ? img.url : '';
    }

    get quickURL() {
        let small = this.media_type === 8 ? this.carousel_media.at(0).quickURL : this.image_versions2.small();

        return small ? small.url : '';
    }
}

@define
export class InstaPost extends Record {
    @auto media: InstaMedia;
    @auto(false) is_selected: boolean;
    @type(PostConfig)/*.toJSON(false)*/.as config: PostConfig;

    get media_urls() {
        return this.media.media_type === 1
            ? [this.media.fullURL]
            : this.media.media_type === 8
                ? this.media.carousel_media.map((m: InstaMedia) => {
                    return m.fullURL;
                })
                : ['media_type not supported by media_urls()'];
    }

    get post_text() {
        const text = this.media.caption && this.media.caption.text || '--no-caption-in-model--';

        return text.replace(new RegExp(String.fromCharCode(10), 'g'), '<br/>');
    }

    parse(data) {
        data.id = data.media && data.media.id;
        return data;
    }
}

@define
export class InstaFolder extends Record {
    static idAttribute = 'collection_id';

    @auto collection_id: string;
    @auto collection_media_count: number;
    @auto collection_name: string;
    @auto collection_type: string;
    @auto cover_media: InstaMedia;
    @type(InstaPost.Collection).as items: Collection<InstaPost>;

    get selection() {
        return this.items.filter(x => x.is_selected);
    }
}
