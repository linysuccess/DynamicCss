# Dcss
> Dynamic Css
1. Add css styles dynamically with JavaScript.
2. Use css animation/transition by JavaScript.

```
//add css styles with Dcss.addRuleItem
Dcss.addRuleItem('#Span1', 'background:#f00');
Dcss.addRuleItem('#Span2', 'background:#0f0');
Dcss.addRuleItem('#Span3', 'background:#00f');

//css animation
var dcssAni = new Dcss.animationBuilder('Area1', {
    duration: '2s',
    effect: 'linear',
    count: 3
}).frame('0%', 'width:200px;background:#f5f5f5').frame('50%', 'width:300px;background:#f00').begin();

//css transition
var dcssTranz = new Dcss.transitionBuilder('Circle1', {
    duration: '3s',
    effect: 'ease',
    delay: '1s',
    onend: function() {
        console.log('transition end...');
        dcssTranz.reset();
    }
}).props({
    'left': '40%',
    'background': '#3f9f00'
}).begin();

```
> Run the demo for more details.

