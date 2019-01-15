function DynamicCss() {
    var mStyle = document.createElement("style");
    mStyle.appendChild(document.createTextNode(""));
    document.head.appendChild(mStyle);
    var mSheet = mStyle.sheet;
    var mRuleMap = {};
    var _delRule = mSheet.deleteRule || mSheet.removeRule;

    this.getStyleSheet = function() {
        return mSheet;
    }
    this.delRuleItem = function(selector) {
        var rule = mRuleMap[selector];
        if(rule!==undefined) {
            _delRule(rule[1]);
        }
    }
    this.addRuleItem = function(selector, rules) {
        var orgRule = mRuleMap[selector];
        var index = mSheet.cssRules.length;
        if(orgRule!==undefined) {
            index = orgRule[1];
            _delRule(index);
        }
        mRuleMap[selector] = [rules, index];
        if("insertRule" in mSheet) {
            mSheet.insertRule(selector + "{ " + rules + " }", index);
        } else if("addRule" in mSheet) {
            mSheet.addRule(selector, rules, index);
        }
    }

    this.once = function(node, event, callback) {
        var handler = function() {
            callback();
            node.removeEventListener(event, handler);
        }
        node.addEventListener(event, handler)
    }

    this.tempId = function(prefix) {
        return prefix + (new Date()).getTime()+'_'+(parseInt(Math.random()*1000));
    }
}
window.Dcss = new DynamicCss();
Dcss.hasClass=function (ele, cls) {
    return ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
};
Dcss.addClass=function (ele, cls) {
    if (!this.hasClass(ele, cls)) ele.className += " " + cls;
};
Dcss.removeClass=function (ele, cls) {
    var finalCls = "";
    var head = true;
    cls = cls.replace(/^\s+|\s+$/g,'');
    var arr = ele.className.match(/[^\x20\t\r\n\f]+/g);
    for(var i=0;i<arr.length;i++) {
        if(arr[i]!==cls) {
            if(!head) finalCls += " ";
            finalCls += arr[i];
            head = false;
        }
    }
    ele.className = finalCls;
};
Dcss.transitionBuilder = function(theId, configs) {
    var node = document.getElementById(theId);
    if(node==null) {
        throw new Error('None element: id=' + theId);
    }
    var state = 1;
    var onend = configs.onend || false;
    var next = configs.next || false;
    var oldAttr = {};
    var props;
    var cssArr = ['all'];
    var transitionFlag = true;
    cssArr.push(configs.duration || '1s');
    cssArr.push(configs.effect || 'ease');

    cssArr.push(configs.delay || '0s');
    var endHandler = function(e) {
        if(e.target === this && transitionFlag) {
            transitionFlag = false;
            onend && onend();
            next && next.begin();
            state = 3;
        }
    };

    this.props = function(theProps) {
        props = theProps;
        return this;
    }
    this.begin = function() {
        if(state!=1)return;
        state = 2;
        node.style['transition'] = cssArr.join(" ");
        node.addEventListener('transitionend', endHandler);
        for(var key in props) {
            oldAttr[key] = node.style[key];
            node.style[key] = props[key];
        }
        return this;
    }
    this.reset = function() {
        if(state==1)return this;
        state = 1;
        for(var key in oldAttr) {
            node.style[key] = oldAttr[key];
        }
        return this;
    }
}
Dcss.animationBuilder = function(theId, configs) {
    var node = document.getElementById(theId);
    if(node==null) {
        throw new Error('None element: id=' + theId);
    }
    var state = 1;
    var onstart = configs.onstart || false;
    var onend = configs.onend || false;
    var oniteration = configs.oniteration || false;
    var next = configs.next || false;
    var endHandler = function(){
        onend && onend();
        next && next.begin();
        state = 3;
    };
    var aniName = Dcss.tempId('DcssAN');
    var aniClsName = Dcss.tempId('DcssCls');
    var cssArr = ['animation:',aniName];
    cssArr.push(configs.duration || '1s');
    cssArr.push(configs.effect || 'ease');
    cssArr.push(configs.delay || '0s');
    cssArr.push(""+configs.count || '1');
    cssArr.push(configs.direction || 'normal');
    var frames = {};
    this.frame = function(process, value) {
        if(frames[process] === undefined) {
            frames[process] = '';
        }
        frames[process] += (value+";");
        return this;
    }
    this.begin = function() {
        if(state!=1)return this;
        state = 2;
        var frameStr = '';
        for(var f in frames) {
            frameStr += f;
            frameStr += "{" + frames[f] + "}";
        }
        try{
            Dcss.addRuleItem("@keyframes " + aniName + " ", frameStr);
            Dcss.addRuleItem("." + aniClsName, cssArr.join(" "));
        } catch(e){}
        Dcss.addClass(node, aniClsName);
        onstart && node.addEventListener('animationstart', onstart);
        oniteration && node.addEventListener('animationiteration', oniteration);
        node.addEventListener('animationend', endHandler);
        return this;
    }
    this.reset = function() {
        if(state==1)return this;
        state = 1;
        Dcss.removeClass(node, aniClsName);
        Dcss.delRuleItem("@keyframes " + aniName);
        Dcss.delRuleItem("." + aniClsName);
        onstart && node.removeEventListener('animationstart', onstart);
        oniteration && node.removeEventListener('animationiteration', oniteration);
        node.removeEventListener('animationend', endHandler);
        return this;
    }
}
Dcss.rotate = function(theId,degrees,timeMillis,callback) {
    var dcssTranz = new Dcss.transitionBuilder(theId, {
        duration: timeMillis + 'ms',
        onend: function() {
            callback && callback();
        }
    }).props({transform:'rotate('+degrees+'deg)'}).begin();
}
Dcss.hoverRotate = function(theId,degrees,timeMillis,callback) {
    var dcssTranz = new Dcss.transitionBuilder(theId, {
        duration: timeMillis + 'ms',
        onend: function() {
            callback && callback();
        }
    }).props({transform:'rotate('+degrees+'deg)'});
    var node = document.getElementById(theId);
    node.addEventListener('mouseenter', function() {
        dcssTranz.begin();
    });
    node.addEventListener('mouseleave', function() {
        dcssTranz.reset();
    });
}
Dcss.scale = function(theId,timeMillis,x,y) {
    var sy = y===undefined ? x : y;
    var dcssTranz = new Dcss.transitionBuilder(theId, {
        duration: timeMillis + 'ms'
    }).props({transform:'scale('+x+','+sy+')'}).begin();
}
Dcss.hoverScale = function(theId,timeMillis,x,y) {
    var sy = y===undefined ? x : y;
    var dcssTranz = new Dcss.transitionBuilder(theId, {
        duration: timeMillis + 'ms'
    }).props({transform:'scale('+x+','+sy+')'});
    var node = document.getElementById(theId);
    node.addEventListener('mouseenter', function() {
        dcssTranz.begin();
    });
    node.addEventListener('mouseleave', function() {
        dcssTranz.reset();
    });
}
