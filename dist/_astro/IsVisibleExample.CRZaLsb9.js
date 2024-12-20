import{r as v,a as y}from"./index.CcfSqGrV.js";var f={exports:{}},t={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var p;function E(){if(p)return t;p=1;var c=v(),d=Symbol.for("react.element"),m=Symbol.for("react.fragment"),x=Object.prototype.hasOwnProperty,_=c.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,R={key:!0,ref:!0,__self:!0,__source:!0};function s(o,e,u){var r,n={},i=null,a=null;u!==void 0&&(i=""+u),e.key!==void 0&&(i=""+e.key),e.ref!==void 0&&(a=e.ref);for(r in e)x.call(e,r)&&!R.hasOwnProperty(r)&&(n[r]=e[r]);if(o&&o.defaultProps)for(r in e=o.defaultProps,e)n[r]===void 0&&(n[r]=e[r]);return{$$typeof:d,type:o,key:i,ref:a,props:n,_owner:_.current}}return t.Fragment=m,t.jsx=s,t.jsxs=s,t}var l;function h(){return l||(l=1,f.exports=E()),f.exports}var O=h();function w(){return y.useEffect(()=>{console.log("%cLazy loaded Javascript coming in HOT!!","font-size: 20px; font-weight: bold; color: #39ff14; text-shadow: 0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14; padding: 1rem;")},[]),O.jsx("div",{style:{fontFamily:"var(--p-font)",fontSize:"1.8rem"},children:"Loaded with client:visible!"})}export{w as default};
