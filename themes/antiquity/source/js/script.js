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
  static BrowserType() {
    // 权重：系统 + 系统版本 > 平台 > 内核 + 载体 + 内核版本 + 载体版本 > 外壳 + 外壳版本
    const ua = navigator.userAgent.toLowerCase();
    const testUa = regexp => regexp.test(ua);
    const testVs = regexp => ua.match(regexp)
      .toString()
      .replace(/[^0-9|_.]/g, "")
      .replace(/_/g, ".");
    // 系统
    let system = "unknow";
    if (testUa(/windows|win32|win64|wow32|wow64/g)) {
      system = "windows"; // windows系统
    } else if (testUa(/macintosh|macintel/g)) {
      system = "macos"; // macos系统
    } else if (testUa(/x11/g)) {
      system = "linux"; // linux系统
    } else if (testUa(/android|adr/g)) {
      system = "android"; // android系统
    } else if (testUa(/ios|iphone|ipad|ipod|iwatch/g)) {
      system = "ios"; // ios系统
    }
    // 系统版本
    let systemVs = "unknow";
    if (system === "windows") {
      if (testUa(/windows nt 5.0|windows 2000/g)) {
        systemVs = "2000";
      } else if (testUa(/windows nt 5.1|windows xp/g)) {
        systemVs = "xp";
      } else if (testUa(/windows nt 5.2|windows 2003/g)) {
        systemVs = "2003";
      } else if (testUa(/windows nt 6.0|windows vista/g)) {
        systemVs = "vista";
      } else if (testUa(/windows nt 6.1|windows 7/g)) {
        systemVs = "7";
      } else if (testUa(/windows nt 6.2|windows 8/g)) {
        systemVs = "8";
      } else if (testUa(/windows nt 6.3|windows 8.1/g)) {
        systemVs = "8.1";
      } else if (testUa(/windows nt 10.0|windows 10/g)) {
        systemVs = "10";
      }
    } else if (system === "macos") {
      systemVs = testVs(/os x [\d._]+/g);
    } else if (system === "android") {
      systemVs = testVs(/android [\d._]+/g);
    } else if (system === "ios") {
      systemVs = testVs(/os [\d._]+/g);
    }
    // 平台
    let platform = "unknow";
    if (system === "windows" || system === "macos" || system === "linux") {
      platform = "desktop"; // 桌面端
    } else if (system === "android" || system === "ios" || testUa(/mobile/g)) {
      platform = "mobile"; // 移动端
    }
    // 内核和载体
    let engine = "unknow";
    let supporter = "unknow";
    if (testUa(/applewebkit/g)) {
      engine = "webkit"; // webkit内核
      if (testUa(/edge/g)) {
        supporter = "edge"; // edge浏览器
      } else if (testUa(/opr/g)) {
        supporter = "opera"; // opera浏览器
      } else if (testUa(/chrome/g)) {
        supporter = "chrome"; // chrome浏览器
      } else if (testUa(/safari/g)) {
        supporter = "safari"; // safari浏览器
      }
    } else if (testUa(/gecko/g) && testUa(/firefox/g)) {
      engine = "gecko"; // gecko内核
      supporter = "firefox"; // firefox浏览器
    } else if (testUa(/presto/g)) {
      engine = "presto"; // presto内核
      supporter = "opera"; // opera浏览器
    } else if (testUa(/trident|compatible|msie/g)) {
      engine = "trident"; // trident内核
      supporter = "iexplore"; // iexplore浏览器
    }
    // 内核版本
    let engineVs = "unknow";
    if (engine === "webkit") {
      engineVs = testVs(/applewebkit\/[\d._]+/g);
    } else if (engine === "gecko") {
      engineVs = testVs(/gecko\/[\d._]+/g);
    } else if (engine === "presto") {
      engineVs = testVs(/presto\/[\d._]+/g);
    } else if (engine === "trident") {
      engineVs = testVs(/trident\/[\d._]+/g);
    }
    // 载体版本
    let supporterVs = "unknow";
    if (supporter === "chrome") {
      supporterVs = testVs(/chrome\/[\d._]+/g);
    } else if (supporter === "safari") {
      supporterVs = testVs(/version\/[\d._]+/g);
    } else if (supporter === "firefox") {
      supporterVs = testVs(/firefox\/[\d._]+/g);
    } else if (supporter === "opera") {
      supporterVs = testVs(/opr\/[\d._]+/g);
    } else if (supporter === "iexplore") {
      supporterVs = testVs(/(msie [\d._]+)|(rv:[\d._]+)/g);
    } else if (supporter === "edge") {
      supporterVs = testVs(/edge\/[\d._]+/g);
    }
    // 外壳和外壳版本
    let shell = "none";
    let shellVs = "unknow";
    if (testUa(/micromessenger/g)) {
      shell = "wechat"; // 微信浏览器
      shellVs = testVs(/micromessenger\/[\d._]+/g);
    } else if (testUa(/qqbrowser/g)) {
      shell = "qq"; // QQ浏览器
      shellVs = testVs(/qqbrowser\/[\d._]+/g);
    } else if (testUa(/ucbrowser/g)) {
      shell = "uc"; // UC浏览器
      shellVs = testVs(/ucbrowser\/[\d._]+/g);
    } else if (testUa(/qihu 360se/g)) {
      shell = "360"; // 360浏览器(无版本)
    } else if (testUa(/2345explorer/g)) {
      shell = "2345"; // 2345浏览器
      shellVs = testVs(/2345explorer\/[\d._]+/g);
    } else if (testUa(/metasr/g)) {
      shell = "sougou"; // 搜狗浏览器(无版本)
    } else if (testUa(/lbbrowser/g)) {
      shell = "liebao"; // 猎豹浏览器(无版本)
    } else if (testUa(/maxthon/g)) {
      shell = "maxthon"; // 遨游浏览器
      shellVs = testVs(/maxthon\/[\d._]+/g);
    }
    return Object.assign({
      engine, // webkit gecko presto trident
      engineVs,
      platform, // desktop mobile
      supporter, // chrome safari firefox opera iexplore edge
      supporterVs,
      system, // windows macos linux android ios
      systemVs
    }, shell === "none" ? {} : {
      shell, // wechat qq uc 360 2345 sougou liebao maxthon
      shellVs
    });
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
    //console.log(document.body.clientWidth+"document.body.clientWidth")

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
  
  console.log(
    "utils.BrowserType()['supporter'] = " + utils.BrowserType()["supporter"]
  );
  var offset = 100,
        offset_opacity = 1200,
        scroll_top_duration = 700,
        $back_to_top = $('.cd-top');
        $changeSkin_gear = $(".changeSkin-gear");
        $cd_top_is_visible = $(".cd-top.cd-is-visible");

  if(utils.BrowserType()['supporter']=='safari'){
    $("body").css({
        "background-image": "url(https://s2.hdslb.com/bfs/static/blive/blfe-dynamic-web/static/img/background.bc725153.png)",
        "background-color": "#D2E9FA",
        "background-repeat": "no-repeat",
        // "background-attachment": "local",
        "background-size": "cover",
        //"position": "absolute",
        // "right": "0",
        // "width": "100%",
        // "transition": "0.2s ease-out",
        // "z-index": "1"
    });
  }else{
    $("body").css({
      // 随机图片：https://api.ixiaowai.cn/api/api.php
      // 随机图片：https://laosepi.org/pic.php
      //"background-image": "url(/images/bg.jpg)"}); //默认
      //"background-image": "url(https://s2.hdslb.com/bfs/static/blive/blfe-dynamic-web/static/img/background.bc725153.png)"}); //bilibili
      "background-image": "url(https://api.ixiaowai.cn/api/api.php)"});
  }
  window.onscroll = function () {
        if ($(this).scrollTop() > offset_opacity) {
          $back_to_top.addClass('cd-fade-out');
          return;
        }else{
          if ($(this).scrollTop() > offset) {
              $back_to_top.addClass('cd-is-visible');
              $changeSkin_gear.css("bottom", "0");
              if ($(window).height() > 950) {
                  $cd_top_is_visible.css("top", "0");
              } else {
                  $cd_top_is_visible.css("top", ($(window).height() - 950) + "px");
              }
          } else {
              $changeSkin_gear.css("bottom", "-999px");
              $cd_top_is_visible.css("top", "-900px");
              $back_to_top.removeClass('cd-is-visible cd-fade-out');
          }
        }
    };

  //smooth scroll to top
  $back_to_top.on('click', function (event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: 0,
        }, scroll_top_duration);
        return false;
  });

})(jQuery);