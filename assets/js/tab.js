import * as d3 from "d3";

const data = document.getElementById("data");
const prompt = document.getElementById("prompt");
const preview = document.getElementById("preview");
const bubbles = document.getElementById("bubblesContainer");

let width = window.innerWidth;
let height = window.innerHeight;
let nodes = [];
let totalVisits = 0;

getHistory();

function randomPos() {
  let rw = Math.floor(Math.random() * width);
  let rh = Math.floor(Math.random() * height);
  return { w: rw, h: rh };
}
function getTime(bool) {
  var value;
  var date = new Date();
  var start = date.setHours(0, 0, 0, 0);
  var end = date.setHours(23, 59, 59, 999);
  var offset = date.getTimezoneOffset();
  start + offset;
  end + offset;
  bool ? (value = start) : (value = end);
  return value;
}
function getTotalVisits() {
  for (let i = 0; i < nodes.length; i++) {
    totalVisits += nodes[i].visitCount;
  }
}
function setRadius(visits) {
  let totalArea = (width * height) / 3;
  let visitsFr = visits / totalVisits;
  let area = totalArea * visitsFr;
  let radius = Math.sqrt(area / Math.PI);
  return radius;
}
function getHistory() {
  chrome.history.search(
    {
      startTime: getTime(true),
      endTime: getTime(false),
      maxResults: 100000,
      text: "",
    },
    (res) => {
      nodes = res;
      // handle empty response
      if (!nodes.length) return;
      toggleHide();
      // get total visits
      getTotalVisits();
      // sort array
      nodes.sort((a, b) => parseFloat(b.visitCount) - parseFloat(a.visitCount));
      // trim array
      nodes.splice(5, nodes.length);
      // set key values
      for (let i = 0; i < nodes.length; i++) {
        let temp = nodes[i];
        temp.x = randomPos().x;
        temp.y = randomPos().y;
        temp.radius = setRadius(temp.visitCount);
      }
      sketch();
    }
  );
}
function sketch() {
  let forceX = d3.forceX(width / 2).strength(0.05);
  let forceY = d3.forceY(height / 2).strength(0.05);
  // define d3 instance
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

  // create svg
  var svg = d3
    .select("#bubblesContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var sketch = svg.selectAll("g").data(nodes);
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
        data.innerHTML = string;
      } else {
        data.innerHTML = i.title;
      }
    })
    // mouse out
    .on("mouseout", function() {
      d3.select(this).style("fill", "rgb(14, 136, 19)");
      data.innerHTML = "Hover over Bubbles";
    })
    // open url event
    .on("click", function(d, i) {
      window.open(i.url, "_blank");
    });

  // append text
  container
    .append("text")
    .text((d) => {
      return d.visitCount;
    })
    .style("font-size", "24px")
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    .style("fill", "rgb(209, 209, 209)")
    .style("dominant-baseline", "middle");

  // resize event
  window.addEventListener("resize", () => {
    location.reload();
  });
}
function toggleHide() {
  prompt.classList.toggle("hide");
  bubbles.classList.toggle("hide");
  preview.classList.toggle("hide");
}
