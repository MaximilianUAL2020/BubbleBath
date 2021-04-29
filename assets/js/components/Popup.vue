<template>
  <div class="main-wrapper">
    <!-- svg canvas -->
    <div class="flex outline no-select">
      <div v-if="nodes.length" id="bubblesContainer"></div>
      <span v-if="!nodes.length">Empty History</span>
    </div>
    <!-- preview -->
    <div class="flex outline no-select">
      <span ref="label" id="label">{{ state }}</span>
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
      nodes: [null],
      totalVisits: 0,
    };
  },
  methods: {
    randomPos() {
      let rw = Math.floor(Math.random() * this.width);
      let rh = Math.floor(Math.random() * this.height);
      return { w: rw, h: rh };
    },
    now() {
      let date = new Date();
      let now = date.getTime();
      return now;
    },
    getTotalVisits() {
      for (let i = 0; i < this.nodes.length; i++) {
        let temp = this.nodes[i];
        if (!temp.visitCount) temp.visitCount = 1;
        if (!temp.title) temp.title = "?";
        this.totalVisits += temp.visitCount;
      }
      console.log("total visits: " + this.totalVisits);
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
          endTime: this.now(),
          startTime: 0,
          maxResults: 100000,
          text: "",
        },
        (res) => {
          this.nodes = res;
          // handle empty response
          if (!this.nodes.length) return;
          // sort array
          this.nodes.sort(
            (a, b) => parseFloat(b.visitCount) - parseFloat(a.visitCount)
          );
          // trim array
          this.nodes.splice(5, this.nodes.length);
          // get total visits
          this.getTotalVisits();
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
      const label = document.getElementById("label");

      // define d3 instance
      var simulation = d3
        .forceSimulation()
        .nodes(this.nodes)
        .force("x", forceX)
        .force("y", forceY)
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        .force("charge", d3.forceManyBody().strength(-5))
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
        .select("#bubblesContainer")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

      var sketch = svg.selectAll("g").data(this.nodes);
      var container = sketch.enter().append("g");

      // append circle
      container
        .style("cursor", "pointer")
        .append("circle")
        .attr("r", (d) => {
          return d.radius;
        })
        .style("fill", "rgb(14, 136, 19)")
        // mouse over
        .on("mouseover", function(d, i) {
          d3.select(this).style("fill", "rgb(112, 173, 114)");
          // trim long strings
          if (i.title.length > 18) {
            let sub = i.title.substring(0, 15);
            let string = sub + "...";
            label.innerHTML = string;
          } else {
            label.innerHTML = i.title;
          }
        })
        // mouse out
        .on("mouseout", function() {
          d3.select(this).style("fill", "rgb(14, 136, 19)");
          label.innerHTML = "Hover over bubbles";
        })
        // open url event
        .on("click", function(d, i) {
          chrome.tabs.query(
            {
              active: true,
              currentWindow: true,
            },
            (tabs) => {
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
        .style("alignment-baseline", "middle")
        .style("dominant-baseline", "middle")
        .style("pointer-events", "none")
        .style("text-anchor", "middle")
        .style("text-align", "center")
        .append("tspan")
        .text((d) => {
          return d.visitCount;
        })
        .style("fill", "rgb(209, 209, 209)")
        .style("font-size", `16px`);
    },
    clearHistory() {
      chrome.history.deleteAll(() => {
        this.nodes = [];
        this.$refs.label.innerHTML = "Start Browsing";
      });
    },
  },
  computed: {
    state() {
      let value;
      if (!this.nodes.length) {
        value = "Start Browsing";
      } else {
        value = "Hover over Bubbles";
      }
      return value;
    },
  },
  mounted() {
    this.getHistory();
  },
};
</script>

<style scoped>
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
#label {
  overflow: hidden;
  white-space: nowrap;
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
</style>

<template></template>
