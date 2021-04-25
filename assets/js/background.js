let history;

chrome.history.search(
  {
    startTime: getTime(true),
    endTime: getTime(false),
    maxResults: 100000,
    text: "",
  },
  (res) => {
    console.log(res);
    console.log(res.length);
    history = res;
    history.sort((a, b) => parseFloat(b.visitCount) - parseFloat(a.visitCount));
    history.splice(5, history.length);
    console.log(history);
  }
);

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
