import zh from "../i18n/zh";
import en from "../i18n/ct";

export default class I18n {
    constructor(lang) {
        this.lang = lang || localStorage.language || navigator.language.split('-')[0];
        this.resource = this.lang == "zh" ? zh : en;
    }

    //Internationalizate whole page
    fillPage() {
        this.fill2($("[i18n]"));
    }

    //Internationalizate the children of this special 'JQuery element'
    fillArea(element) {
        //this.fill(element.find('[i18n]'));原来i18n方法
        this.fill2(element.find("[i18n]"));
        try {
            Permission.check(element);
        } catch (e) {
            console.log("check permission failed:" + e);
        }
    }

    fillAreaAttribute(element, attributeName) {
        this.fill(element.find("[i18n][" + attributeName + "]"), attributeName);
    }

    fill(arrElement, attributeName) {
        for (var i = 0, arrPath, text, len = arrElement.length; i < len; i++) {
            arrPath = arrElement[i].attributes["i18n"].value.split(".");

            text = this.resource;
            for (var j = 0; j < arrPath.length; j++) {
                text = text && text[arrPath[j]];
            }

            if (!attributeName) {
                arrElement[i].innerHTML = text;
            } else {
                arrElement[i].setAttribute(attributeName, text);
            }
        }
    }
    getI18nValue(i18nKey) {
        if (!i18nKey) {
            return "";
        }
        var arrPath = i18nKey.split(".");

        var text = this.resource;
        for (var j = 0; j < arrPath.length; j++) {
            text = text && text[arrPath[j]];
        }
        return text;
    }

    fill2(arrElement) {
        for (var i = 0, len = arrElement.length; i < len; i++) {
            var i18nValue = arrElement[i].attributes["i18n"];
            var items = i18nValue.value.split(";"),
                item,
                attrMap;
            for (var j = 0; j < items.length; j++) {
                item = items[j];
                if (!item) {
                    continue;
                }
                if (item.indexOf("=") === -1) {
                    i18nValue = this.getI18nValue(item);
                    arrElement[i].innerHTML = i18nValue;
                } else {
                    attrMap = item.split("=");
                    if (!attrMap[0]) {
                        continue;
                    }
                    arrElement[i].setAttribute(attrMap[0], this.getI18nValue(attrMap[1]));
                }
            }
        }
    }

    //params: strPath: ex, observerScreen.menu.NAV_OBSERVER_TITLE. return: value
    findContent(strPath) {
        var arrPath = strPath.split(".");
        var text = this.resource;
        for (var i = 0, len = arrPath.length; i < len; i++) {
            text = text && text[arrPath[i]];
        }
        return text;
    }
}
