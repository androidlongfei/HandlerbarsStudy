$(function () {
    $(function () {
        //nav menu
        initImgSlides();
        navEvent();
    });

    function initImgSlides() {
        var thumbs = $(".item .thumb");
        //console.log(thumbs.length);
        for (var i = 0; i < thumbs.length; i++) {
            var thumb = thumbs.eq(i);
            thumb.click(function () {
                var parentId = $(this).attr("pararentId");
                var liveLittleImgs = $(parentId).find(".active .thumb img");
                console.log(parentId + ",item count" + liveLittleImgs.length);
                var currentClickImg = $(this).children("img").eq(0);
                clickLittleImg(currentClickImg, liveLittleImgs);
            });
        }

        //点击小图片，设置透明度
        function clickLittleImg(currentClickImg, liveLittleImgs) {
            if (!currentClickImg.hasClass("imgClick")) {
                clearImgClickColor(liveLittleImgs);
                currentClickImg.addClass("imgClick");
            }
        }

        function clearImgClickColor(liveLittleImgs) {
            for (var i = 0; i < liveLittleImgs.length; i++) {
                var imgItem = liveLittleImgs.eq(i);
                if (imgItem.hasClass("imgClick")) {
                    imgItem.removeClass("imgClick");
                }
            }
        }

        var a_big_rights = $("a.right.carousel-control span.sr-only");
        for (var i = 0; i < a_big_rights.length; i++) {
            var a_big_right = a_big_rights.eq(i).parent().eq(0);
            a_big_right.click(function () {
                var carousel = $(this).parent();
                var thumbcarousel = carousel.next('div.clearfix').eq(0);
                var a_little_right = thumbcarousel.find('a.right.carousel-control');
                var allLittleThumb = thumbcarousel.find(".thumb");
                var items = carousel.find('.carousel-inner .item');
                for (var i = 0; i < items.length; i++) {
                    var item = items.eq(i);
                    if (item.hasClass('active')) {
                        if (items.length <= 6) {
                            var nextItemIndex = i + 1;
                            if (nextItemIndex > items.length - 1) {
                                nextItemIndex = 0;
                            }
                            allLittleThumb.eq(nextItemIndex).trigger("click");
                        } else {
                            if ((i + 1) % 6 == 0 || (i + 1) == items.length) {
                                a_little_right.trigger("click");
                            } else {
                                var nextItemIndex = i + 1;
                                if (nextItemIndex < items.length) {
                                    allLittleThumb.eq(nextItemIndex).trigger("click");
                                }
                            }
                        }
                        break;
                    }
                }

            })
        }

        var a_big_lefts = $("a.left.carousel-control span.sr-only");
        for (var i = 0; i < a_big_lefts.length; i++) {
            var a_big_left = a_big_lefts.eq(i).parent();
            a_big_left.click(function () {
                var carousel = $(this).parent();
                var thumbcarousel = carousel.next('div.clearfix').eq(0);
                var a_little_left = thumbcarousel.find('a.left.carousel-control');
                var allLittleThumb = thumbcarousel.find(".thumb");
                var items = carousel.find('.carousel-inner .item');
                console.log("items.length:" + items.length);
                for (var i = 0; i < items.length; i++) {
                    var item = items.eq(i);
                    if (item.hasClass('active')) {

                        if (items.length <= 6) {
                            var preItemIndex = i - 1;
                            if (preItemIndex < 0) {
                                preItemIndex = items.length - 1;
                            }
                            allLittleThumb.eq(preItemIndex).trigger("click");
                        } else {
                            console.log('left....i..' + i);
                            if ((i) % 6 == 0) {
                                a_little_left.trigger("click");
                            } else {
                                var preItemIndex = i - 1;
                                allLittleThumb.eq(preItemIndex).trigger("click");
                            }
                        }

                        break;
                    }
                }
            })
        }


        var indexArr = {};
        var a_rights = $(".thumbcarousel a.right.carousel-control");
        for (var i = 0; i < a_rights.length; i++) {
            //初始化索引
            var parentId = a_rights.eq(i).attr("pararentId");
            indexArr[parentId] = 1;
        }
        for (var i = 0; i < a_rights.length; i++) {
            var a_right = a_rights.eq(i);
            a_right.click(function (e) {
                if (e.hasOwnProperty('originalEvent')) {
                    //Probably a real click.
                    switchNextGrouplittleImg($(this), true);
                } else {
                    //Probably a fake click.
                    switchNextGrouplittleImg($(this), false);
                }
            });
        }

        //切换到下一组小图片
        function switchNextGrouplittleImg(little_right, isRealClick) {
            var parentId = little_right.attr("pararentId");
            var littleDivIndex = indexArr[parentId];
            var littleImgDivs = $(parentId).find(".carousel-inner .item");
            var littleDivMax = littleImgDivs.length;
            if (littleDivMax < 2) {
                return;
            }

            if (littleDivIndex < littleDivMax) {
                littleDivIndex++;
            } else {
                littleDivIndex = 1;
            }
            var currentLittleDiv = littleImgDivs.eq(littleDivIndex - 1);
            var itemDiv = currentLittleDiv.children(".thumb").first();
            var liveLittleImgs = $(parentId).find(".active .thumb img");
            clearImgClickColor(liveLittleImgs);
            setChoiceLittleImgDiv(itemDiv, isRealClick);
            indexArr[parentId] = littleDivIndex;
        }

        var a_lefts = $(".thumbcarousel a.left.carousel-control");
        for (var i = 0; i < a_lefts.length; i++) {
            var a_left = a_lefts.eq(i);
            a_left.click(function (e) {
                if (e.hasOwnProperty('originalEvent')) {
                    //Probably a real click.
                    switchPreviousLittleImg($(this), true);
                } else {
                    //Probably a fake click.
                    switchPreviousLittleImg($(this), false);
                }

            });
        }

        //切换到上一组小图片
        function switchPreviousLittleImg(a_left, isRealClick) {
            var parentId = a_left.attr("pararentId");
            var littleDivIndex = indexArr[parentId];
            //alert("start:"+littleDivIndex);
            var littleImgDivs = $(parentId).find(".carousel-inner .item");
            var littleDivMax = littleImgDivs.length;
            if (littleDivMax < 2) {
                return;
            }
            littleDivIndex--;
            if (littleDivIndex < 1) {
                littleDivIndex = littleDivMax;
            }
            var currentLittleDiv = littleImgDivs.eq(littleDivIndex - 1);
            var itemDiv = currentLittleDiv.children(".thumb").last();
            //var liveLittleImgs = $(parentId).find(".active .thumb img");
            var liveLittleImgs = $(parentId).find(".thumb img");
            clearImgClickColor(liveLittleImgs);
            setChoiceLittleImgDiv(itemDiv, isRealClick);
            indexArr[parentId] = littleDivIndex;
            //alert("end:"+indexArr[parentId]);
        }

        //设置选中小图片
        function setChoiceLittleImgDiv(littleImgDiv, isRealClick) {
            var indexData = littleImgDiv.attr("data-slide-to");
            console.log('indexData:' + indexData);
            var littleImgItem = littleImgDiv.children("img").eq(0);
            if (!littleImgItem.hasClass("imgClick")) {
                littleImgItem.addClass("imgClick");
            }

            var targetId = littleImgDiv.attr("data-target");
            var maxImgDivs = $(targetId).find(".carousel-inner .item");

            var a_big_img_index = 0;
            for (var i = 0; i < maxImgDivs.length; i++) {
                var maxImgDiv = maxImgDivs.eq(i);
                if (maxImgDiv.hasClass("active")) {
                    maxImgDiv.removeClass("active");
                    a_big_img_index = i;
                }
            }

            if (isRealClick) {
                //小图标点击事件
                maxImgDivs.eq(indexData).addClass("active");
            } else {
                //大图标点击事件
                maxImgDivs.eq(a_big_img_index).addClass("active");
            }
        }
    }

    function navEvent() {

        var aItems = $(".dropdown-menu a");
        for (var i = 0; i < aItems.length; i++) {
            var aItem = aItems.eq(i);
            //下拉菜单item点击
            aItem.click(function (e) {
                var li = $(this).parent().parent().parent(".dropdown");
                var children = li.children(".dropdown-toggle").eq(0);
                clearColor();
                children.addClass("active");
            })
        }

        var navs = $("li.dropdown > a");

        function clearColor() {
            for (var i = 0; i < navs.length; i++) {
                var a = navs.eq(i);
                a.parent().removeClass("open");
                a.removeClass("a-hover");
                a.removeClass("active");
            }
        }

        var lis = $("li.dropdown");

        for (var i = 0; i < lis.length; i++) {
            var li = lis.eq(i);
            //mouse enter,no bubbling
            li.mouseenter(function (e) {
                if ($(this).hasClass("active")) {
                    $(this).removeClass("active");
                }
                var a = $(this).children("a").eq(0);
                if (a.hasClass("active")) {
                    a.removeClass("active");
                    a.addClass('isMouseover');
                }
                if ($(this).children().size() > 1) {
                    //有下拉菜单
                    a.addClass("a-hover");
                    $(this).addClass("open");
                }

                $(this).find("li").each(function () {
                    $(this).removeClass("active");
                });

                a.click(function (e) {
                    clearColor();
                    $(this).addClass("active");
                })

            })

            //mouse leave,no bubbling
            li.mouseleave(function (e) {
                var a = $(this).children("a").eq(0);
                if ($(this).hasClass("open")) {
                    $(this).removeClass("open");
                    a.removeClass("a-hover");
                }
                if (a.hasClass("isMouseover")) {
                    a.addClass("active");
                    a.removeClass('isMouseover');
                }
            });
        }

        $(".navbar-nav a").each(function () {
            console.log($(this).attr('href'));
            $(this).attr('href', $(this).attr('href').substr($(this).attr('href').lastIndexOf('/') + 1));
            $(this).removeClass('active');
        });

        $('body').scrollspy({
            target: '#menu-nav'
        });
    }
});
