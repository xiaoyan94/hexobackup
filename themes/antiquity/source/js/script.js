// Author: Ray-Eldath
// refer to:
//  - https://github.com/theme-next/hexo-theme-next/blob/master/source/js/src/utils.js
class utils {
  static getContentVisibilityHeight() {
      var docHeight = $('.visible').height(),
          winHeight = $(window).height(),
          contentVisibilityHeight = (docHeight > winHeight) ? (docHeight - winHeight) : ($(document).height() -
              winHeight);
      return contentVisibilityHeight;
  }
  static isMobile() {
      return window.screen.width < 767;
  }
}

(function($){
  // Search
  var $searchWrap = $('#search-form-wrap'),
    isSearchAnim = false,
    searchAnimDuration = 200;

  var startSearchAnim = function(){
    isSearchAnim = true;
  };

  var stopSearchAnim = function(callback){
    setTimeout(function(){
      isSearchAnim = false;
      callback && callback();
    }, searchAnimDuration);
  };

  $('#nav-search-btn').on('click', function(){
    if (isSearchAnim) return;

    startSearchAnim();
    $searchWrap.addClass('on');
    stopSearchAnim(function(){
      $('.search-form-input').focus();
    });
  });

  $('.search-form-input').on('blur', function(){
    startSearchAnim();
    $searchWrap.removeClass('on');
    stopSearchAnim();
  });

  // Share
  $('body').on('click', function(){
    $('.article-share-box.on').removeClass('on');
  }).on('click', '.article-share-link', function(e){
    e.stopPropagation();

    var $this = $(this),
      url = $this.attr('data-url'),
      encodedUrl = encodeURIComponent(url),
      id = 'article-share-box-' + $this.attr('data-id'),
      offset = $this.offset();

    if ($('#' + id).length){
      var box = $('#' + id);

      if (box.hasClass('on')){
        box.removeClass('on');
        return;
      }
    } else {
      var html = [
        '<div id="' + id + '" class="article-share-box">',
          '<input class="article-share-input" value="' + url + '">',
          '<div class="article-share-links">',
            '<a href="https://twitter.com/intent/tweet?url=' + encodedUrl + '" class="article-share-twitter" target="_blank" title="Twitter"></a>',
            '<a href="https://www.facebook.com/sharer.php?u=' + encodedUrl + '" class="article-share-facebook" target="_blank" title="Facebook"></a>',
            '<a href="http://pinterest.com/pin/create/button/?url=' + encodedUrl + '" class="article-share-pinterest" target="_blank" title="Pinterest"></a>',
            '<a href="https://plus.google.com/share?url=' + encodedUrl + '" class="article-share-google" target="_blank" title="Google+"></a>',
          '</div>',
        '</div>'
      ].join('');

      var box = $(html);

      $('body').append(box);
    }

    $('.article-share-box.on').hide();

    box.css({
      top: offset.top + 25,
      left: offset.left
    }).addClass('on');
  }).on('click', '.article-share-box', function(e){
    e.stopPropagation();
  }).on('click', '.article-share-box-input', function(){
    $(this).select();
  }).on('click', '.article-share-box-link', function(e){
    e.preventDefault();
    e.stopPropagation();

    window.open(this.href, 'article-share-box-window-' + Date.now(), 'width=500,height=450');
  });

  // Caption
  $('.article-content').each(function(i){
    $(this).find('img').each(function(){
      if ($(this).parent().hasClass('fancybox')) return;

      var alt = this.alt;

      if (alt) $(this).after('<span class="caption">' + alt + '</span>');

      $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>');
    });

    $(this).find('.fancybox').each(function(){
      $(this).attr('rel', 'article' + i);
    });
  });

  if ($.fancybox){
    $('.fancybox').fancybox();
  }

  // Mobile nav
  var $fullpage = $('#fullpage'),
    isMobileNavAnim = false,
    mobileNavAnimDuration = 200;

  var startMobileNavAnim = function(){
    isMobileNavAnim = true;
  };

  var stopMobileNavAnim = function(){
    setTimeout(function(){
      isMobileNavAnim = false;
    }, mobileNavAnimDuration);
  }

  $('#nav-toggle').on('click', function(){
    if (isMobileNavAnim) return;

    startMobileNavAnim();
    $fullpage.toggleClass('mobile-nav-on');
    stopMobileNavAnim();
  });

  $('#wrapper').on('click', function(){
    if (isMobileNavAnim || !$fullpage.hasClass('mobile-nav-on')) return;

    $fullpage.removeClass('mobile-nav-on');
  });

  if (utils.isMobile()) {
    $('#moblieGoTop').show();
  }else{
    $('#moblieGoTop').hide();
  }
  // $('#moblieGoTop').click(
  // function topFunction() {
  //   document.body.scrollTop = 0;
  //   document.documentElement.scrollTop = 0;
  // })
  if (document.body.clientWidth <= 860) {
    console.log(document.body.clientWidth+"document.body.clientWidth")

    $('#moblieGoTop').on('click', function (event) {
      event.preventDefault();
      $('html, body').animate({
          scrollTop: 0,
      }, scroll_top_duration);
      return false;
    });
    window.onscroll = function () {
        scrollFunction()
    };
    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          $("#moblieGoTop")[0].style.display = "block";
        } else {
          $("#moblieGoTop")[0].style.display = "none";
        }
    }

  }
  

  var offset = 100,
        offset_opacity = 1200,
        scroll_top_duration = 700,
        $back_to_top = $('.cd-top');
    $(window).scroll(function () {
        if ($(this).scrollTop() > offset) {
            $back_to_top.addClass('cd-is-visible');
            $(".changeSkin-gear").css("bottom", "0");
            if ($(window).height() > 950) {
                $(".cd-top.cd-is-visible").css("top", "0");
            } else {
                $(".cd-top.cd-is-visible").css("top", ($(window).height() - 950) + "px");
            }
        } else {
            $(".changeSkin-gear").css("bottom", "-999px");
            $(".cd-top.cd-is-visible").css("top", "-900px");
            $back_to_top.removeClass('cd-is-visible cd-fade-out');
        }
        if ($(this).scrollTop() > offset_opacity) {
            $back_to_top.addClass('cd-fade-out');
        }
    });
    //smooth scroll to top
    $back_to_top.on('click', function (event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: 0,
        }, scroll_top_duration);
        return false;
    });

})(jQuery);