/**
 * Handlebar Article templates for listing
 */

Acme.templates = {};

Handlebars.registerHelper('fixPrice', function(text) {
    if (!text) return "";
    return text.replace(/\$/g, "");
});



Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

// **********************************************************
//                         CARDS
// **********************************************************

var cardTemplateTop = 
'<div class="{{containerClass}} "> \
    <a  href="{{url}}" \
        class="swap" \
        data-id="{{params.id}}" \
        data-guid="{{params.guid}}" \
        data-position="{{position}}" \
        data-social={{params.social}} \
        data-article-image="{{{image}}}" \
        data-article-text="{{params.title}}" \
        title="{{titleString}}"> \
        \
        <article class="{{cardType}}c-cards-view {{# ifCond params.social "==" 1}} social {{/ifCond}} {{params.category}} {{hasMediaClass}} {{status}} {{lightbox}}">';

var cardTemplateBottom = 
        '</article>\
        \
        {{#if userHasBlogAccess}} \
            <div class="btn_overlay articleMenu"> \
                <button \
                    title       = "Hide" \
                    data-guid   = "{{guid}}" \
                    class       = "btnhide social-tooltip HideBlogArticle" \
                    type        = "button" \
                    data-social = "0"> \
                    <i class="fa fa-eye-slash">\
                    </i><span class="u-display-none">Hide</span> \
                </button> \
                \
                <button \
                    onclick="window.location=\'{{{editUrl}}}\'; return false;" \
                    title="Edit" \
                    class="btnhide social-tooltip" \
                    type="button"> \
                    <i class="fa fa-edit"></i>\
                    <span class="u-display-none">Edit</span> \
                </button> \
                \
                <button data-position="{{position}}" \
                        data-social="0" \
                        data-id="{{articleId}}" \
                        title="{{pinTitle}}" \
                        class="btnhide social-tooltip PinArticleBtn {{# ifCond isPinned "==" 1 }}selected{{/ifCond}}" \
                        type="button" \
                        data-status="{{isPinned}}"> \
                    <i class="fa fa-thumb-tack"></i>\
                    <span class="u-display-none">{{pinText}}</span> \
                </button> \
            </div> \
         {{/if}}\
    </a>\
</div>';



Acme.templates.systemCardTemplate = 
    cardTemplateTop + 
        '{{#if params.hasMedia}}\
            <figure class="{{cardType}}c-cards-view__media" {{params.videoClass}}>\
                <img class="img-fluid lazyload" data-original="{{params.image}}" src="{{params.image}}" style="background-image:url("{{placeholder}}"")>\
                <div class="video-icon"></div> \
            </figure>\
        {{/if}} \
        \
        <div class="social-icon"></div>\
        \
        <div class="{{cardType}}c-cards-view__container">\
            <div class="{{cardType}}c-cards-view__category">{{ params.category }}</div>\
            <h2 class="{{cardType}}c-cards-view__heading js-c-cards-view-heading j-truncate">{{{ params.title }}}</h2>\
            <p class="{{cardType}}c-cards-view__description js-c-cards-view-description j-truncate">{{{ params.content }}}</p>\
            <div class="{{cardType}}c-cards-view__author">\
                <div class="{{cardType}}c-cards-view__author-name">{{ params.author }}</div>\
                <time class="{{cardType}}c-cards-view__time" datetime="{{params.publishDate}}">{{params.publishDate}}</time>\
            </div>\
        </div>'+ 
    cardTemplateBottom;



    Acme.templates.property_card = 
    cardTemplateTop +  
        '{{#if hasMedia}} \
            <figure class="c-cards-view__media {{figureClass}}"> \
                <picture> \
                    <source media="(max-width: 620px)" srcset="{{imageUrl}}"> \
                    <img class="img-fluid" src="{{imageUrl}}" data-original="{{imageUrl}}"> \
                </picture> \
            </figure> \
        {{/if}} \
        \
        <div class="c-cards-view__container"> \
            <div class="c-cards-view__category">{{label}}</div> \
            <h2 class="c-cards-view__heading js-c-cards-view-heading j-truncate">{{ title }}</h2> \
            <p class="c-cards-view__description js-c-cards-view-description j-truncate">{{{ excerpt }}}</p> \
                \
            <div class="c-cards-view__additioanl-info"> \
            <div class="c-cards-view__additioanl-info__price">{{ additionalInfo.pricerange }}</div> \
            <div class="c-cards-view__additioanl-info__features"> \
                {{#if additionalInfo.bedroom_count }} \
                    <div class="c-cards-view__additioanl-info__features-list"> \
                        <span class="icon fa fa-bed"></span> \
                        <span class="text">{{ additionalInfo.bedroom_count }}</span> \
                    </div> \
                {{/if}} \
                \
                {{#if additionalInfo.bathroom_count }} \
                    <div class="c-cards-view__additioanl-info__features-list"> \
                        <span class="icon fa fa-bath"></span> \
                        <span class="text">{{ additionalInfo.bathroom_count }}</span> \
                    </div> \
                {{/if}} \
                \
                {{#if additionalInfo.car_count }} \
                    <div class="c-cards-view__additioanl-info__features-list"> \
                        <span class="icon fa fa-car"></span> \
                        <span class="text">{{ additionalInfo.car_count }}</span> \
                    </div> \
                {{/if}} \
            </div> \
        </div> \
        <div class="c-cards-view__author"> \
            <div class="c-cards-view__time">{{publishDate}}</div> \
        </div>' +

    cardTemplateBottom;













// **********************************************************
//                       CARDS END
// **********************************************************




Acme.templates.spinnerTmpl = '<div class="spinner"></div>';
Acme.templates.spinner = 
    '<div id="{{name}}" class="flex_col {{name}}"> \
        <div id="dialog" class="{{name}}__window"> \
            <div class="{{name}}__header"> \
                <h2 class="{{name}}__title">{{title}}</h2> \
            </div> \
            <div class="{{name}}__content-window" id="dialogContent"></div> \
        </div> \
    </div>';



Acme.templates.carousel_item = 
'<li class="carousel-tray__item swap-images"> \
    <div data-id="{{imageid}}" class="carousel-tray__delete"> \
        <span class="o-close"></span> \
    </div> \
    <img class="carousel-tray__img" src="{{imagePath}}" /> \
</li>';

Acme.templates.swappingHelper = 
'<div class="SwappingHelper" style="display:none"> \
    <div style="width: 270px; height: 105px; padding: 3px; background-color: #FFF; max-width: 270px; max-height: 105px; overflow: hidden; z-index: 999 !important;"> \
        <img class="article-image" src="" style="width:97px; height: 97px; float: left;" /> \
        <p class="article-text" style="width: 165px; float: left; padding-left: 3px;color: #394659;font-size: 14px; font-family: Droid Serif,serif; line-height: 20px; margin-top:0px;"></p> \
    </div> \
</div>';






// Acme.templates.managed_user = 
// '<div class="u-float-left"> \
//     <p class="userdetails__name"> \
//         <span class="j-firstname">{{firstname}}</span> \
//         <span class="j-lastname">{{lastname}}</span> \
//     </p> \
//     <p class="j-username userdetails__username">{{username}}</p> \
// </div>\
// <a class="j-delete userdetails__button userdetails__button__delete u-float-right"></a> \
// <a class="j-edit userdetails__button userdetails__button__edit u-float-right"></a>';


Acme.templates.managed_user = 
'<li id="{{id}}" class="c-managed-user"> \
    <p class="c-managed-user__email j-email">{{email}}</p> \
    <a class="c-managed-user__close j-delete "></a> \
    <a class="c-managed-user__edit j-edit"></a> \
</li>';





Acme.templates.subscribeTerms =  
    '<p class="password-reset-form__p u-margin-bottom-20 centerText">Please agree to the terms of use.</p> \
    <div class="centerText"> \
        <button class="c-button c-button--blue">Okay</button> \
    </div>';






    
    

Acme.templates.ads_infinite = 
    "<div class='advert-desktop advert-tablet col-sm-9 hidden-xs u-margin-top-30' data-adsize='banner' style='padding:0;'></div>\
    <div class='col-xs-9 visible-xs-block' style='padding:0;width:300px;height:250px;'><div class='advert-mobile' data-adsize='mrec'></div></div>\
    <hr class='divide18 col-xs-9 visible-xs-block'>";



Acme.templates.modal = 
// style="scrolling == unusable position:fixed element might be fixing login for ios safari
// also margin-top:10px
'<div id="{{name}}" class="flex_col {{name}}" data-behaviour="close"> \
    <div id="dialog" class="{{name}}__window"> \
        <div class="{{name}}__container" style="scrolling == unusable position:fixed element"> \
            <div class="{{name}}__header"> \
                <a class="{{name}}__close" href="javascript:;" data-behaviour="close"></a> \
            </div> \
            <div class="{{name}}__content-window" id="dialogContent" style="scrolling == unusable position:fixed element"></div> \
        </div> \
    </div> \
</div>';
    
    
// Acme.templates.carousel_item = 
// '<div class="carousel-tray__item" style="background-image:url( {{imagePath}} )"> \
//     <span data-id="{{imageid}}" class="carousel-tray__delete"></span> \
// </div>';

Acme.templates.listingDeleteTmpl =  
    '<p style="margin-bottom:20px">{{title}}</p> \
    <div> \
        <form> \
            <button class="c-button c-button--inline c-button--rounded c-button--blue-bordered u-margin-right-10" data-role="okay">DELETE</button> \
            <button class="c-button c-button--inline c-button--rounded c-button--blue-bordered" data-role="cancel">CANCEL</button> \
        </form> \
    </div>';
    


Acme.templates.listingSavedTmpl =  
'<p>Following approval it will be posted to the events page within 24 hours.</p> \
<div class="u-margin-top-10"> \
    <form> \
        <button class="c-button c-button--inline c-button--rounded c-button--blue-bordered">Okay</button> \
    </form> \
</div>';




Acme.templates.socialPopup =
'<div class="modal social--modal social--modal--md" id="ModalSocialCard"> \
    <div class="modal-dialog"> \
        <div class="modal-content modal-content--md"> \
            <div class="o-modal__container card-social-popup-desktop"> \
                \
                <div class="o-modal__container-head"> \
                    <button type="button" class="close" data-dismiss="modal">&times;</button> \
                </div> \
                \
                <div class="o-modal__container-body c-cards-view social facebook"> \
                        <figure class="c-cards-view__media"> \
                            <img src="{{media.path}}" alt="Image" class="img-fluid" /> \
                            <div class="video-icon"></div> \
                            <div class="social-icon"></div> \
                        </figure> \
                        \
                        <div class="c-cards-view__container"> \
                            <div class="c-cards-view__category">{{source}}</div> \
                            <div class="c-cards-view__heading">{{content}}</div> \
                            <div class="c-cards-view__author"> \
                                <div class="c-cards-view__author-name">{{user.name}}</div> \
                                <div class="c-cards-view__time">{{publishDate}}</div> \
                            </div> \
                        </div> \
                </div> \
            </div> \
        </div> \
    </div> \
</div>';











// **********************************************************
//                       FORMS
// **********************************************************

Acme.templates.signinFormTmpl = 
'<form id="loginForm" class="vertical-form" action="#" method="post" autocomplete="off"> \
    <div class="c-form c-login-modal"> \
        <input id="email" class="c-form__input" name="username" placeholder="Username or Email Address" aria-required="true" type="text"> \
        <input id="password" class="c-form__input" name="password" placeholder="Password" aria-required="true" type="password"> \
        <div id="login-error" class="c-login-modal__error u-display-none">Incorrect username or password</div> \
        <a href="javascript:;" class="c-login-modal__password-link" data-layout="forgot">Forgot password?</a> \
    </div> \
    \
    <div class="c-form__buttons"> \
        <button id="modal-signinBtn" type="submit" class="c-button c-button--rounded c-button--blue j-signin">Log in</button> \
    </div> \
    \
    <div class="c-login-modal__subaction"> \
        <span>Trouble logging in? <a href="'+_appJsConfig.appHostName +'/faq" target="_blank">Read our FAQs</a></span> \
    </div> \
</form>';



Acme.templates.forgotFormTmpl = 
'<form id="forgotForm" class="vertical-form" action="#" method="post" autocomplete="off"> \
    <div class="c-form c-forgot-modal__description"> \
        Enter your email below and we will send you a link to set your password. \
    </div> \
    \
    <input id="email" class="c-form__input" name="email" placeholder="Username or Email Address" aria-required="true" type="text"> \
    <div class="c-form__help-block">Please enter your email address</div> \
    \
    <div class="c-form__buttons"> \
        <button type="submit" class="c-button c-button--rounded c-button--blue-bordered j-forgot-email">Send Email</button> \
    </div> \
</form>';



Acme.templates.userPlanMessage = 
'<p style="font-size:18px;margin-bottom:15px;">{{{title}}}</p> \
<p class="modal__message">{{{message}}}</p> \
<form name="loginForm" id="loginForm" class="active u-margin-top-20" action="javascript:void(0);" method="post" accept-charset="UTF-8" autocomplete="off"> \
    <button id="cancelbutton" class="c-button c-button--rounded c-button--blue-bordered" data-role="cancel">OK</button> \
</form>';

Acme.templates.userPlanOkCancel = 
'<p style="font-size:18px;margin-bottom:15px;">{{title}}</p> \
 <p>{{message}}</p> \
<form name="loginForm" id="loginForm" class="active u-margin-top-20" action="javascript:void(0);" method="post" accept-charset="UTF-8" autocomplete="off"> \
    <button id="okaybutton" class="c-button c-button--inline c-button--rounded c-button--blue-bordered" data-role="okay">OK</button> \
    <button id="cancelbutton" class="c-button c-button-inline c-button--rounded c-button--blue-bordered" data-role="cancel">Cancel</button> \
</form>';


Acme.templates.create_user = 
'<div id="newUser" class="c-managed-user-new u-margin-bottom-60"> \
    <div id="cancelUserCreate" class="c-managed-user__close c-managed-user__close--top"></div> \
    <div class="row u-desktop-padding-top-20 u-margin-bottom-15"> \
        <div class="col col-lg-split has-error"> \
            <input id="newuserfirstname" class="form-control" name="firstname" placeholder="First Name" aria-required="true" type="text"> \
        </div> \
        <div class="col col-lg-split"> \
            <input id="newuserlastname" class="form-control" name="lastname" placeholder="Last Name" aria-required="true" type="text"> \
        </div> \
    </div> \
    <div class="row"> \
        <div class="col"> \
            <input id="newuseruseremail" class="form-control" name="email" placeholder="Email" aria-required="true" type="text"> \
        </div> \
    </div> \
    \
    <div id="userError" class="help-block"></div> \
    \
    <button id="saveUser" type="button" class="c-button c-button--rounded c-button--blue-bordered u-margin-top-40">Save</button> \
</div>';

Acme.templates.mailChimpSignup = 
'<form class="vertical-form mailchimp-modal__form" action="javascript:void(0)" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate> \
    <div class="c-form mailchimp-modal__title"> \
        {{mctitle}}\
    </div> \
    <div class="c-form mailchimp-modal__description"> \
        {{mcdescription}}\
    </div> \
    <div id="mc_embed_signup_scroll" class="mailchimp-modal__inputs">\
        <input type="text" value="" name="FNAME" class="c-form__input field form-control u-margin-bottom-15" id="mce-FNAME" placeholder="First Name" required>\
        <input type="text" value="" name="LNAME" class="c-form__input field form-control u-margin-bottom-15" id="mce-LNAME" placeholder="Last Name" required>\
        <input type="email" value="" name="EMAIL" class="c-form__input field form-control u-margin-bottom-15" id="mce-EMAIL" placeholder="Email address" required>\
        <div class="c-form mailchimp-modal__errortext" id="mailchimp-modal__errortext"></div>\
        <div style="position: absolute; left: -5000px;" aria-hidden="true">\
            <input type="text" name="b_7ca16e173650b89f4d8302a86_9e8e5c87da" tabindex="-1" value="">\
        </div>\
        <div class="c-form__buttons mailchimp-modal__buttons">\
            <button value="Sign up" name="subscribe" id="j-insider-subscribe" class="button c-button c-button--blue-bordered c-button--wide">Sign up</button>\
            <button value="Close" name="close" id="j-insider-close" class="button c-button c-button--blue-bordered c-button--wide j-close-button d-none">Close</button>\
        </div> \
    </div>\
</form>';