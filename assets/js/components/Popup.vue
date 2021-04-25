<template>
  <div class="main-wrapper">
    <!-- svg canvas -->
    <div class="flex outline no-select">
      <div v-if="nodes" id="container"></div>
      <span v-if="!nodes">no history</span>
    </div>
    <!-- preview -->
    <div class="flex outline no-select">
      <span id="label">{{ state }}</span>
    </div>
    <!-- clear -->
    <div>
      <button @click="clearHistory" :disabled="!nodes">
        Clear History
      </button>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  data() {
    return {
      width: 248,
      height: 296,
      nodes: true,
    };
  },
  methods: {
    randomPos() {
      let rw = Math.floor(Math.random() * this.width);
      let rh = Math.floor(Math.random() * this.height);
      return { w: rw, h: rh };
    },
    getTime(bool) {
      var value;
      var date = new Date();
      var start = date.setHours(0, 0, 0, 0);
      var end = date.setHours(23, 59, 59, 999);
      var offset = date.getTimezoneOffset();
      start + offset;
      end + offset;
      bool ? (value = start) : (value = end);
      return value;
    },
    setRadius(count) {
      let radius;
      if (count < 500) {
        radius = 25;
      } else if (count > 500 && count < 1000) {
        radius = count / 20;
      } else if (count > 1200) {
        radius = 40;
      }
      return radius;
    },
    history() {
      chrome.history.search(
        {
          startTime: this.getTime(true),
          endTime: this.getTime(false),
          maxResults: 100000,
          text: "",
        },
        (res) => {
          this.nodes = res;
          if (!this.nodes.length) {
            this.nodes = false;
            return;
          }
          this.nodes.sort(
            (a, b) => parseFloat(b.visitCount) - parseFloat(a.visitCount)
          );
          this.nodes.splice(5, this.nodes.length);
          for (let i = 0; i < this.nodes.length; i++) {
            let temp = this.nodes[i];
            temp.x = this.randomPos().x;
            temp.y = this.randomPos().y;
            temp.radius = this.setRadius(temp.visitCount);
          }
          console.log(this.nodes);
          this.d3();
        }
      );
    },
    d3() {
      const forceX = d3.forceX(this.width / 2).strength(0.05);
      const forceY = d3.forceY(this.height / 2).strength(0.05);
      const elem = document.getElementById("label");
      // define d3 instance
      var simulation = d3
        .forceSimulation()
        .nodes(this.nodes)
        .force("x", forceX)
        .force("y", forceY)
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
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
      // create svg
      var svg = d3
        .select("#container")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);
      var sketch = svg.selectAll("g").data(this.nodes);
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
        // mouse over
        .on("mouseover", function(d, i) {
          d3.select(this).style("fill", "rgb(198, 115, 125)");
          // create substring
          if (i.title.length > 18) {
            let sub = i.title.substring(0, 15);
            let string = sub + "...";
            elem.innerHTML = string;
          } else {
            elem.innerHTML = i.title;
          }
        })
        // mouse out
        .on("mouseout", function() {
          d3.select(this).style("fill", "rgb(187, 21, 40)");
          elem.innerHTML = "Hover over bubbles";
        })
        // click event
        .on("click", function(d, i) {
          chrome.tabs.query(
            {
              active: true,
              currentWindow: true,
            },
            (tabs) => {
              console.log(tabs[0]);
              chrome.tabs.sendMessage(tabs[0].id, {
                message: "url",
                url: i.url,
              });
            }
          );
        });
      // append text
      container
        .append("text")
        .text((d) => {
          return d.visitCount;
        })
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .style("fill", "rgb(209, 209, 209)")
        .style("dominant-baseline", "middle");
    },
    clearHistory() {
      const moonLanding = new Date("July 20, 69 00:20:18 GMT+00:00");
      let forever = moonLanding.getTime();
      chrome.browsingData.remove(
        {
          since: forever,
        },
        {
          appcache: true,
          cache: true,
          cacheStorage: true,
          cookies: true,
          downloads: false,
          fileSystems: false,
          formData: false,
          history: true,
          indexedDB: false,
          localStorage: false,
          passwords: false,
          serviceWorkers: false,
          webSQL: false,
        },
        () => {
          this.nodes = "";
        }
      );
    },
  },
  computed: {
    state() {
      if (this.nodes) {
        return "Hover over Bubbles";
      } else {
        return "Start Browsing";
      }
    },
  },
  mounted() {
    this.history();
  },
};
</script>

<style scoped>
#label {
  overflow: hidden;
  white-space: nowrap;
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
    "clear clear clear";
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
  grid-area: clear;
  border-radius: 100px;
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
  border-radius: inherit;
  background-color: transparent;
  color: var(--bg);
  background: var(--light);
  border: 1px solid var(--bg);
  transition: all 0.2s;
}
button:hover {
  cursor: pointer;
  background: transparent;
  color: var(--light);
  border: 1px solid var(--light);
  transition: all 0.2s;
}
button:disabled {
  cursor: not-allowed;
  background: transparent;
  color: var(--medium);
  border: 1px solid var(--medium);
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
