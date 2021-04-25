<template>
  <div class="main-wrapper">
    <!-- svg canvas -->
    <div class="outline" id="container"></div>
    <!-- preview -->
    <div class="flex filled no-select">
      <span id="label">Hover over bubbles</span>
    </div>
    <!-- toggle -->
    <div class="switch no-select">
      <input id="my-switch" type="checkbox" class="switch-checkbox" />
      <label class="switch-label" for="my-switch"></label>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  mounted() {
    const width = 248,
      height = 296;

    var nodes = [
        { radius: 0, x: 0, y: 0, t: "" },
        {
          radius: 40,
          x: randomPos().w,
          y: randomPos().h,
          label: "IN",
          name: "Instagram",
        },
        {
          radius: 60,
          x: randomPos().w,
          y: randomPos().h,
          label: "YT",
          name: "YouTube",
        },
        {
          radius: 40,
          x: randomPos().w,
          y: randomPos().h,
          label: "FB",
          name: "Facebook",
        },
        {
          radius: 50,
          x: randomPos().w,
          y: randomPos().h,
          label: "AR",
          name: "Are.na",
        },
        {
          radius: 30,
          x: randomPos().w,
          y: randomPos().h,
          label: "RE",
          name: "Reddit",
        },
      ],
      root = nodes[0];

    root.radius = 0;
    root.fixed = true;

    const forceX = d3.forceX(width / 2).strength(0.1);
    const forceY = d3.forceY(height / 2).strength(0.1);

    //define and stop the simulation
    var simulation = d3
      .forceSimulation()
      .nodes(nodes)
      .force("x", forceX)
      .force("y", forceY)
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("charge", d3.forceManyBody().strength(0))
      .force(
        "collision",
        d3.forceCollide().radius((d) => {
          return d.radius;
        })
      )
      .force("tick", () => {
        svg.selectAll("g").attr("transform", (d) => {
          return `translate(${d.x},${d.y})`;
        });
      });

    var svg = d3
      .select("#container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var sketch = svg.selectAll("g").data(nodes.slice(1));
    // append container
    var container = sketch.enter().append("g");
    // append circle
    container
      .style("cursor", "pointer")
      .append("circle")
      .attr("r", (d) => {
        return d.radius;
      })
      .style("fill", "rgb(187, 21, 40)")
      .on("mouseover", function(d) {
        console.log(d);
        d3.select(this).style("fill", "rgb(198, 115, 125)");
        // elem.innerHTML = `${d.name} (${d.radius}min)`;
      })
      .on("mouseout", function(d) {
        d3.select(this).style("fill", "rgb(187, 21, 40)");
        // elem.innerHTML = "Hover over bubbles";
      });
    // append text
    container
      .append("text")
      .text((d) => {
        return d.label;
      })
      .style("text-anchor", "middle")
      .style("pointer-events", "none")
      .style("fill", "rgb(209, 209, 209)")
      .style("dominant-baseline", "middle");
    function randomPos() {
      let rw = Math.floor(Math.random() * width);
      let rh = Math.floor(Math.random() * height);
      return { w: rw, h: rh };
    }
  },
};
</script>

<style scoped>
@font-face {
  font-family: Space-Mono;
  src: url("ttf/Space.ttf");
}
:root {
  --myPadding: 8px;
  --master-width: 100%;
  --master-height: 60px;
  --button-height: calc(var(--master-height) - calc(var(--myPadding) * 2));
  --button-end: calc(100% - calc(var(--button-height) + var(--myPadding)));
  --bg: rgb(209, 209, 209);
  --medium: rgb(152, 126, 232);
  --light: rgb(94, 43, 255);
}
* {
  font-size: 16px;
  scrollbar-width: none;
  box-sizing: border-box;
  font-family: Space-Mono;
  -ms-overflow-style: none;
}
body {
  margin: 0;
  width: 280px;
  height: 480px;
}
text {
  pointer-events: none;
}
g:hover {
  cursor: pointer;
}

.main-wrapper {
  gap: 1em;
  width: 100%;
  height: 100%;
  padding: 1em;
  display: grid;
  background-color: var(--bg);
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto auto auto var(--master-height) var(
      --master-height
    );
  grid-template-areas:
    "canvas canvas canvas"
    "canvas canvas canvas"
    "canvas canvas canvas"
    "canvas canvas canvas"
    "preview preview preview"
    "toggle toggle toggle";
}
.flex {
  display: flex;
  align-items: center;
  justify-content: center;
}
.outline {
  background: transparent;
  color: var(--light);
  border: 1px solid var(--light);
}
.filled {
  border: none;
  color: var(--bg);
  background: var(--light);
}
.main-wrapper div {
  width: 100%;
  height: 100%;
}
.main-wrapper div:nth-of-type(1) {
  overflow: hidden;
  grid-area: canvas;
  border-radius: 20px;
}
.main-wrapper div:nth-of-type(2) {
  grid-area: preview;
  border-radius: 100px;
}
.main-wrapper div:nth-of-type(3) {
  border: none;
  grid-area: toggle;
  position: relative;
}
#no-border {
  border: none !important;
}
::-moz-selection {
  background: var(--light);
  color: var(--bg);
}
::selection {
  background: var(--light);
  color: var(--bg);
}
.no-select {
  user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
button,
button:focus,
button:active {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  cursor: pointer;
  color: var(--bg);
  border-radius: inherit;
  background-color: transparent;
  transition: all 0.2s;
}
button:hover {
  cursor: pointer;
  color: var(--light);
  background: var(--bg);
  border: 1px solid var(--light);
  transition: all 0.2s;
}
.switch-checkbox {
  opacity: 0;
  position: absolute;
  pointer-events: none;
}
.switch-label {
  padding: 0;
  display: block;
  cursor: pointer;
  overflow: hidden;
  height: var(--master-height);
  line-height: var(--master-height);
  border-radius: var(--master-height);
  border: 1px solid var(--light);
  transition: all 0.2s;
}
.switch-label:before {
  bottom: 0;
  margin: 0px;
  content: "";
  display: block;
  position: absolute;
  border-radius: 100px;
  top: var(--myPadding);
  right: var(--button-end);
  width: var(--button-height);
  height: var(--button-height);
  background: var(--light);
  transition: all 0.2s;
}
.switch-checkbox:checked + .switch-label {
  background: var(--light);
}
.switch-checkbox:checked + .switch-label:before {
  right: var(--myPadding);
  background: var(--bg);
}
</style>
