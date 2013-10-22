jQuery(document).ready(function(){
    InitAll4btc();
});

function payCoins(sNumber, btcprice)
{
    jQuery('#loading-page').hide();
    btcprice = btc_string_to_satoshi(btcprice, '.');
    bitcoin.sendMoney(sNumber, btcprice, function(status, transaction_hash){
        if (status == true){
            animatePage('.page','#end-page');
        }
    });
}

function animatePage(page_hide,page_show)
{
    jQuery(page_hide).hide();
    jQuery(page_show).show();
}

function showError(sText)
{
    jQuery('#loading-page').hide();
    jQuery('#error-page').show();
    jQuery('#error-page span').empty().html(sText);
}

function payUrl(data,type)
{

    if(data[0]=='ERROR')
    {
        //showError(data[1]);

        jQuery('#loading-page').hide();
        jQuery('#error-page').show();

        var spanError = jQuery('#error-page span');

        spanError.empty();

        jQuery.each(data[1], function(key, value) {
            spanError.append("<div>" + value + "</div>");
        });

        return;
    }

    var urlPayment = data[1]; //ebay

    if(type=='amazon')
    {
        urlPayment = urlPayment.payment_url;
    }

    jQuery.ajax({type: 'GET',async:true,
        url:urlPayment,data:{

        },success:function(htmlData)
        {
            //var htm = jQuery.parseHTML(htmlData);
            var htm = jQuery.parseHTML(htmlData.replace(/<img[^>]+>/,""));
            var pay = $(htm).find('#amountSpan').text();
            var number = $(htm).find('#addressCode').text();

            if(number)
            {
                payCoins(number, pay);
            }else{
                showError('Time out');
            }

        },error: function (xhr, ajaxOptions, thrownError) {
            showError('Server error. Please, try again later');
        }}

    );

}

function resizeWindow()
{
    var iMenuHeight = jQuery("#menu").height();
    var iWindowHeight = jQuery(window).height();

    var iTextHeight = jQuery('#middle-text').height();
    var iMiddleTextMargin = (iWindowHeight)/2-iTextHeight/2;
    if(iMiddleTextMargin>0)
        jQuery('#middle-text').css("top",iMiddleTextMargin);

    iTextHeight = jQuery('#loading-middle').height();
    iMiddleTextMargin = (iWindowHeight)/2-iTextHeight/2;
    if(iMiddleTextMargin>0)
        jQuery('#loading-middle').css("top",iMiddleTextMargin);

    jQuery('.page').css("min-height",iWindowHeight-iMenuHeight);

}

function InitAll4btc()
{
    resizeWindow();

    $( window ).resize(function() {
        resizeWindow();
    });

    if(localStorage.user_data_first_name)
    {
        jQuery('#website-page').show();
        jQuery('#id-first-name').val(localStorage.user_data_first_name);
        jQuery('#id-last-name').val(localStorage.user_data_last_name);
        jQuery('#id-e-mail').val(localStorage.user_data_email);
        jQuery('#id-street').val(localStorage.user_data_street);
        jQuery('#id-city').val(localStorage.user_data_city);
        jQuery('#id-post-code').val(localStorage.user_data_post_code);
        jQuery('#id-state').val(localStorage.user_data_state);
        jQuery('#id-country').val(localStorage.user_data_country);
        jQuery('#id-company-name').val(localStorage.user_data_company_name);
        jQuery('#id-street-no').val(localStorage.user_data_street_no);
        jQuery('#id-phone').val(localStorage.user_data_phone);
    }else{
        jQuery('#user-data-page').show();
    }

    jQuery('#error-page-btn').click(function()
    {
        jQuery('#error-page').hide();
    });

    jQuery('.shop-button').click(function()
    {
        var sId = $(this).attr('id');
        sId = sId.substring(5);

        animatePage('#website-page','#'+sId+'-page');
    });

    jQuery('#edit-profile').click(function()
    {
        animatePage('#website-page','#user-data-page');
    });

    jQuery('.cancel-buy').click(function()
    {
        animatePage('.page','#website-page');
    });

    jQuery('#bitcoin-buy').click(function()
    {
        if(!jQuery('#bitcoin-page form').valid())
            return false;

        jQuery('#loading-page').show();
        var productUrl = jQuery('#other-link').val();
        var productPrice = jQuery('#other-price').val();
        var productCurrency = jQuery('#other-currency').val();

        var fakeUrl = 'https://all4btc.com/api/get_bill.php?';
        fakeUrl += 'product_url='+encodeURIComponent(productUrl);
        fakeUrl += '&price='+productPrice;
        fakeUrl += '&currency='+productCurrency;
        fakeUrl += '&notes=';
        fakeUrl += '&name='+localStorage.user_data_first_name;
        fakeUrl += '&email='+localStorage.user_data_email;
        fakeUrl += '&phone='+localStorage.user_data_phone;
        fakeUrl += '&address_street_and_number='+encodeURIComponent(localStorage.user_data_street+' '+localStorage.user_data_street_no);
        fakeUrl += '&address_city='+localStorage.user_data_city;
        fakeUrl += '&address_zip='+localStorage.user_data_post_code;
        fakeUrl += '&address_country='+localStorage.user_data_country;
        fakeUrl += '&_form=all4btc';

        jQuery.ajax(
            {
                dataType: "json",
                type: 'GET',
                async:true,
                url:fakeUrl,
                success:function(data)
                {
                    payUrl(data,'ebay');
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    showError('Server error. Please, try again later');
                }
            }
        );
    });

    jQuery('#ebay-buy').click(function()
    {

        if(!jQuery('#ebay-page form').valid())
            return false;

        jQuery('#loading-page').show();

        var href = jQuery('#ebay-link').val();

        //var iItemId = '370915500844';

        var re = /\d{12}/
        var iItemId = re.exec(href);

        if(!iItemId)
        {
            showError('Incorrect link');
            return false;
        }

        var fakeUrl = 'https://all4btc.com/checkitem.php?';
        fakeUrl += 'item='+iItemId;
        fakeUrl += '&quantity=1';
        fakeUrl += '&country='+localStorage.user_data_country;
        fakeUrl += '&postal='+localStorage.user_data_post_code;

        jQuery.ajax(
            {
                dataType: "json",
                type: 'GET',
                async:true,
                url:fakeUrl,
                success:function(data)
                {
                    if(data.Success)
                    {

                        var fakeUrl = 'https://all4btc.com/api/get_bill.php?';
                        fakeUrl += 'item='+iItemId;
                        fakeUrl += '&quantity=1';
                        fakeUrl += '&name='+localStorage.user_data_first_name;
                        fakeUrl += '&email='+localStorage.user_data_email;
                        fakeUrl += '&phone='+localStorage.user_data_phone;
                        fakeUrl += '&address_street_and_number='+encodeURIComponent(localStorage.user_data_street+' '+localStorage.user_data_street_no);
                        fakeUrl += '&address_city='+localStorage.user_data_city;
                        fakeUrl += '&address_zip='+localStorage.user_data_post_code;
                        fakeUrl += '&address_country='+localStorage.user_data_country;
                        fakeUrl += '&item_data='+data;
                        fakeUrl += '&_form=ebay';

                        jQuery.ajax(
                        {
                            dataType: "json",
                            type: 'GET',
                            async:true,
                            url:fakeUrl,
                            success:function(data)
                            {
                                payUrl(data,'ebay');
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                showError('Server error. Please, try again later');
                            }
                        }
                        );

                    }else{
                        showError("Sorry, that item's not available");
                    }

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    showError('Server error. Please, try again later');
                }
            }
        );

    });

    jQuery('#amazon-buy').click(function()
    {
        if(!jQuery('#amazon-page form').valid())
            return false;

        jQuery('#loading-page').show();

        var href = jQuery('#amazon-link').val();

        var path = href.split( '/' );

        if(path[2]=='www.amazon.com' || path[2]=='www.amazon.co.uk' || path[2]=='www.amazon.de')
        {
            var domain = path[2].split('.');

            var re = /\/([A-Z0-9]{10})(\/|\?|\b)/i
            var asin = re.exec(href);
            if (asin[1])
            {
                jQuery.ajax({dataType: "json",type: 'POST',async:true,
                    url:'http://81.169.232.252:8080/api/1/buy_at_amazon',data:{
                        name:localStorage.user_data_first_name+' '+localStorage.user_data_last_name,
                        items:asin[1],
                        company_name:localStorage.user_data_company_name,
                        street_with_number:localStorage.user_data_street,
                        city:localStorage.user_data_city,
                        state:localStorage.user_data_state,
                        zip:localStorage.user_data_post_code,
                        email:localStorage.user_data_email,
                        country_code:localStorage.user_data_country,
                        amazon_domain:domain[2]+((domain[2]=='co')?'.uk':'')
                    },success:function(data)
                    {
                        payUrl(data,'amazon');
                    },error: function (xhr, ajaxOptions, thrownError) {
                        showError('Server error. Please, try again later');
                    }
                });

            }else{
                showError('no product could be found');
            }
        }else{
            showError('Incorrect link');
        }
    });


    var container = jQuery('#user-data-form-error-continer');

    jQuery('#user-data-form').validate({
            errorContainer: container,
            errorLabelContainer: jQuery("span", container),
            wrapper: 'div',
            submitHandler: function(form)
            {
                localStorage.user_data_first_name=form.elements["first-name"].value;
                localStorage.user_data_last_name=form.elements["last-name"].value;
                localStorage.user_data_email=form.elements["e-mail"].value;
                localStorage.user_data_street=form.elements["street"].value;
                localStorage.user_data_street_no=form.elements["street-no"].value;
                localStorage.user_data_city=form.elements["city"].value;
                localStorage.user_data_post_code=form.elements["post-code"].value;
                localStorage.user_data_state=form.elements["state"].value;
                localStorage.user_data_country=form.elements["country"].value;
                localStorage.user_data_company_name=form.elements["company-name"].value;
                localStorage.user_data_phone=form.elements["phone"].value;
                animatePage('#user-data-page','#website-page');

            },
            rules: {
                'first-name': {required:true},
                'last-name': {required:true},
                'e-mail': {required:true,email:true},
                'street': {required:true},
                'street-no': {required:true},
                'city': {required:true},
                'post-code': {required:true},
                'state': {required:true},
                'country': {required:true}
            },
            messages: {
                'e-mail': {
                    required:'E-mail field is required.'
                },
                'first-name': {
                    required:'First name field is required.'
                },
                'last-name': {
                    required:'Last name field is required.'
                },
                'street': {
                    required:'Street field is required.'
                },
                'street-no': {
                    required:'Street number field is required.'
                },
                'city': {
                    required:'City field is required.'
                },
                'post-code': {
                    required:'Post code field is required.'
                },
                'state': {
                    required:'State field is required.'
                },
                'country': {
                    required:'Country field is required.'
                },
            }
        });

    container = jQuery('#amazon-page .page-error-continer');

    jQuery('#amazon-page form').validate({
            errorContainer: container,
            errorLabelContainer: jQuery("span", container),
            wrapper: 'div',
            rules: {
                'link': {required:true,url: true}
            },
            messages: {
                'link': {
                    required:'Product URL field is required.',
                    url:'That is not a valid URL'
                }
            }
        });

    container = jQuery('#ebay-page .page-error-continer');

    jQuery('#ebay-page form').validate({
            errorContainer: container,
            errorLabelContainer: jQuery("span", container),
            wrapper: 'div',
            rules: {
                'link': {required:true,url: true}
            },
            messages: {
                'link': {
                    required:'Product URL field is required.',
                    url:'That is not a valid URL'
                }
            }
        });

    container = jQuery('#bitcoin-page .page-error-continer');

    jQuery('#bitcoin-page form').validate({
            errorContainer: container,
            errorLabelContainer: jQuery("span", container),
            wrapper: 'div',
            rules: {
                'link': {required:true,url: true},
                'price': {required:true}
            },
            messages: {
                'link': {
                    required:'Product URL field is required.',
                    url:'That is not a valid URL'
                },
                'price': {
                    required:'Price field is required.'
                }
            }
        });
}
     