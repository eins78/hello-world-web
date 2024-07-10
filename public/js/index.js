var p=Object.defineProperty;var d=(o,e,t)=>e in o?p(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var i=(o,e)=>p(o,"name",{value:e,configurable:!0});var u=(o,e,t)=>d(o,typeof e!="symbol"?e+"":e,t);import{html as b,css as v,LitElement as y}from"lit";import{customElement as j,property as x}from"lit/decorators.js";function a(o,e,t,l){var m=arguments.length,n=m<3?e:l===null?l=Object.getOwnPropertyDescriptor(e,t):l,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(o,e,t,l);else for(var f=o.length-1;f>=0;f--)(s=o[f])&&(n=(m<3?s(n):m>3?s(e,t,n):s(e,t))||n);return m>3&&n&&Object.defineProperty(e,t,n),n}i(a,"_ts_decorate");console.log("Hello from views/index.ts");var c=class c extends y{name="Somebody";render(){return b` <p>Hello, ${this.name}!</p>
      <slot></slot>`}};i(c,"AppShell"),u(c,"styles",v`
    p {
      color: tomato;
    }
  `);var r=c;a([x()],r.prototype,"name",void 0);r=a([j("app-shell")],r);export{r as AppShell};
