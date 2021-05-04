<template>
  <div class="main-wrapper">
    <!-- preview -->
    <section
      v-if="nodes.length && !tooSmall.state"
      id="preview"
      class="no-select"
    >
      <span id="label">Loading Bubbles...</span>
    </section>
    <!-- bubbles -->
    <div id="bubblesWrapper" class="flex no-select">
      <div v-if="nodes.length && !tooSmall.state" id="bubblesContainer"></div>
      <span v-if="!nodes.length || tooSmall.state">{{ tooSmall.text }}</span>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  data() {
    return {
      nodes: [null],
      totalVisits: 0,
      width: window.innerWidth,
      height: window.innerHeight,
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
    },
    setRadius(visits) {
      let totalArea = (this.width * this.height) / 3;
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
          // remove loading state from label
          const label = document.getElementById("label");
          if (!this.tooSmall.state) label.innerHTML = "Hover over Bubbles";
          // sort array
          this.nodes.sort(
            (a, b) => parseFloat(b.visitCount) - parseFloat(a.visitCount)
          );
          // trim array
          this.nodes.splice(100, this.nodes.length);
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
      const forceX = d3.forceX(this.width / 2).strength(0.01);
      const forceY = d3.forceY(this.height / 2).strength(0.01);
      const label = document.getElementById("label");
      const smallWidth = window.matchMedia("(max-width: 1400px)");
      const smallHeight = window.matchMedia("(max-height: 800px)");

      // define d3 instance
      var simulation = d3
        .forceSimulation()
        .nodes(this.nodes)
        .force("x", forceX)
        .force("y", forceY)
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        .force(
          "charge",
          d3.forceManyBody().strength(this.nodes.length < 10 ? -5 : -10)
        )
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
          if (i.title.length > 36) {
            let sub = i.title.substring(0, 33);
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
          window.open(i.url, "_blank");
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
        .style(
          "font-size",
          `${smallWidth.matches || smallHeight.matches ? "12px" : "16px"}`
        );

      // resize event
      window.addEventListener("resize", () => {
        location.reload();
      });
    },
  },
  computed: {
    tooSmall() {
      let value;
      const smallWidth = window.matchMedia("(max-width: 600px)");
      const smallHeight = window.matchMedia("(max-height: 600px)");
      smallWidth.matches || smallHeight.matches
        ? (value = { state: true, text: "Too Small" })
        : (value = { state: false, text: "Empty History" });
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
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.no-select {
  user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.flex {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
#bubblesWrapper {
  z-index: 100;
  position: absolute;
}
#preview {
  top: 20px;
  left: 20px;
  z-index: 0;
  display: flex;
  min-width: 20%;
  position: fixed;
  border-radius: 50px;
  align-items: center;
  max-width: max-content;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--light);
}
#label {
  padding: 20px;
}
#bubblesContainer {
  width: 100%;
  height: 100%;
}
</style>
