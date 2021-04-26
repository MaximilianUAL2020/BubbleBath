<template>
  <div class="main-wrapper">
    <!-- svg canvas -->
    <div class="flex outline no-select" id="container"></div>
    <!-- preview -->
    <div class="flex outline no-select">
      <span id="label">{{ state }}</span>
    </div>
    <!-- clear -->
    <div class="no-select">
      <button @click="clearHistory" :disabled="!nodes.length">
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
      width: 246,
      height: 296,
      nodes: "",
      totalVisits: 0,
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
    getTotalVisits() {
      let temp = 0;
      for (let i = 0; i < this.nodes.length; i++) {
        temp += this.nodes[i].visitCount;
      }
      this.totalVisits = temp;
    },
    setRadius(visits) {
      let totalArea = (this.width * this.height) / 2;
      let visitsFr = visits / this.totalVisits;
      let area = totalArea * visitsFr;
      let radius = Math.sqrt(area / Math.PI);
      return radius;
    },
    getHistory() {
      chrome.history.search(
        {
          startTime: this.getTime(true),
          endTime: this.getTime(false),
          maxResults: 100000,
          text: "",
        },
        (res) => {
          this.nodes = res;
          if (!this.nodes.length) return;
          // get total visits
          this.getTotalVisits();
          // sort array
          this.nodes.sort(
            (a, b) => parseFloat(b.visitCount) - parseFloat(a.visitCount)
          );
          // trim array
          this.nodes.splice(5, this.nodes.length);
          // set key values
          for (let i = 0; i < this.nodes.length; i++) {
            let temp = this.nodes[i];
            temp.x = this.randomPos().x;
            temp.y = this.randomPos().y;
            temp.radius = this.setRadius(temp.visitCount);
          }
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
        .style("fill", "rgb(23, 150, 23)")
        // mouse over
        .on("mouseover", function(d, i) {
          d3.select(this).style("fill", "rgb(116, 180, 116)");
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
          d3.select(this).style("fill", "rgb(23, 150, 23)");
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
      chrome.history.deleteAll(() => {
        this.nodes = "";
      });
    },
  },
  computed: {
    state() {
      if (this.nodes.length) {
        return "Hover over Bubbles";
      } else {
        return "No History";
      }
    },
  },
  mounted() {
    this.getHistory();
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
