# Dcss
> Dynamic Css
1. Add css styles dynamically with JavaScript.
2. Use css animation/transition by JavaScript.

```
var dcss1 = new Dcss.animationBuilder('Area1', {
        duration: '2s',
        effect: 'linear',
        count: 3
}).frame('0%', 'height:100px;background:#00f').frame('50%', 'height:200px;background:#f00').begin();
```
> Run the demo for more detail.

