import "bootstrap/dist/css/bootstrap.min.css";

import "bootstrap";

import "fonts/iconfont/iconfont.css";
import "style/common.less";
import "style/home.less";
import "style/about_us.less";

import nav from "./view/nav.html";
import footer from "./view/footer.html";
import home from "./view/home.html";
import about_us from "./view/about_us.html";

import I18n from "i18n";

const pageMap = {
    home,
    about_us,
};
$(document).ready(() => {
    let config = {};
    let hash_param = {};
    let I18N_RESOURCE = {};

    let navCtn = document.getElementById("navCtn");
    let pageCtn = document.getElementById("pageCtn");
    let footerCtn = document.getElementById("footerCtn");

    function initConfig() {
        let param = (function() {
            let arr = location.hash.match(/(\w+)=((\w|\.)+)/g) || [];
            let obj = {};
            arr.forEach(function(item) {
                let stack = item.split("=");
                let key = stack[0];
                let value = stack[1] || true;
                if(!key) return;
                obj[key] = value;
            });
            return obj;
        })();
        config = param;
        hash_param = $.extend({},param);
        try {
            config.language = config.language || localStorage.language || navigator.language.split("-")[0];
        } catch(e) {
            config.language = "zh";
        }

        document.body.setAttribute("language",config.language);
    }

    function i18n($dom) {
        let i18n = new I18n(config.language);
        i18n.fillArea($dom || $(document.body));
        I18N_RESOURCE = i18n.resource;
    }

    function initLayout() {
        navCtn.innerHTML = nav;
        footerCtn.innerHTML = footer;

        if((config.service == "cn")) {
            let copyright = document.createElement("a");
            copyright.id = "copyright";
            copyright.href = "http://beian.miit.gov.cn";
            copyright.innerHTML = `沪ICP备14049393号-4`;
            copyright.setAttribute("target","_blank");
            mainCtn.appendChild(copyright);
        }
        initPageContent();
    }

    function initPageContent() {
        let page = config.page || "home";

        let archer;
        [page,archer] = page.split(".");
        pageCtn.innerHTML = pageMap[page];
        pageCtn.dataset.page = page;
        if(archer) {
            var archerDom = document.querySelector(`[data-module="${archer}"]`);
            if(archerDom) {
                mainCtn.scrollTo(0,archerDom.offsetTop);
            } else {
                mainCtn.scrollTo(0,0);
            }
        } else {
            mainCtn.scrollTo(0,0);
        }
        $(navCtn)
            .find("a")
            .removeClass("active");
        if(navCtn.querySelector(`[href="#page=${page}"]`)) {
            navCtn.querySelector(`[href="#page=${page}"]`).classList.add("active");
        } else {
            navCtn.querySelector(`[href="#page=${config.page || "home"}"]`).classList.add("active");
        }
    }

    function getUserId() {
        let arr,
            reg = new RegExp("(^| )userId=([^;]*)(;|$)");
        return (arr = document.cookie.match(reg)) ? unescape(arr[2]) : 0;
    }

    function getIPs() {
        let ip_dups = {};
        let RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        if(!RTCPeerConnection) {
            let iframe = document.createElement("iframe");
            //invalidate content script
            iframe.sandbox = "allow-same-origin";
            iframe.style.display = "none";
            document.body.appendChild(iframe);
            let win = iframe.contentWindow;
            window.RTCPeerConnection = win.RTCPeerConnection;
            window.mozRTCPeerConnection = win.mozRTCPeerConnection;
            window.webkitRTCPeerConnection = win.webkitRTCPeerConnection;
            RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        }
        //minimal requirements for data connection
        let mediaConstraints = {
            optional: [{
                RtpDataChannels: true
            }]
        };
        let servers = undefined;
        let listenStatus = true;
        //add same stun server for chrome
        if(window.webkitRTCPeerConnection) servers = {
            iceServers: []
        };
        //construct a new RTCPeerConnection
        return new Promise((resolve,reject) => {
            let pc = new RTCPeerConnection(servers);
            //listen for candidate events
            pc.onicecandidate = function(ice) {
                //skip non-candidate events
                if(ice.candidate && listenStatus) {
                    listenStatus = false;
                    let ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/,
                        ip_addr;
                    let ipArray = ip_regex.exec(ice.candidate.candidate);
                    if(ice.candidate.candidate && ipArray && ipArray.length > 0) {
                        ip_addr = ipArray[1];
                        resolve(ip_addr);
                    } else {
                        listenStatus = false;
                        reject("");
                    }
                }
            };
            //create a bogus data channel
            pc.createDataChannel("");
            //create an offer sdp
            pc.createOffer(
                function(result) {
                    //trigger the stun server request
                    pc.setLocalDescription(
                        result,
                        function() {},
                        function() {}
                    );
                },
                function() {}
            );
        }).catch(error => {
            console.log("error:",error);
        });
    }

    function hrefLoad(href) {
        let suffix = Object.keys(hash_param)
            .filter(key => {
                return key != "page";
            })
            .map(item => {
                return `${item}=${hash_param[item]}`;
            })
            .join("&");
        location.hash = href + (suffix ? `&${suffix}` : "");
    }

    function attachEvent() {
        window.onhashchange = () => {
            console.log("hash-change");
            initConfig();
            initPageContent();
            i18n($(pageCtn));
        };
        $(navCtn)
            .find(`[href]`)
            .on("click",e => {
                e.preventDefault();
                e.stopPropagation();
                hrefLoad(e.currentTarget.getAttribute("href"));
            });
        $(footerCtn)
            .find(`[href]`)
            .on("click",e => {
                e.preventDefault();
                e.stopPropagation();
                hrefLoad(e.currentTarget.getAttribute("href"));
            });
        $("#btnChangeLang").on("click","span",e => {
            config.language = e.currentTarget.dataset.type || "zh";
            i18n();
        })

    }

    function baiduStatistics() {
        var _hmt = _hmt || [];
        (function() {
            var hm = document.createElement("script");
            //中文
            hm.src = "https://hm.baidu.com/hm.js?0c0f0d8c555b99d149c415e8ab83fae7";
            if(location.host.indexOf("rnbtechgroup.com") > -1) {
                //英文
                hm.src = "https://hm.baidu.com/hm.js?552e17a6e2984ed887c0022e7ac6fa69";
            }
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm,s);
        })();
    }
    initConfig();
    initLayout();
    i18n();
    attachEvent();
    baiduStatistics();
});