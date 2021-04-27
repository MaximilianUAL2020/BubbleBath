import Vue from "vue";
import Tab from "./components/Tab.vue";

const app = new Vue({
  el: "#app",
  render: (createElement) => createElement(Tab),
});
