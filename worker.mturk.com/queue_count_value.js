const queueCountValue = {
  execute: function () {
    console.log(`queueCountValue.execute()`);
    
    const total = [...document.getElementsByClassName(`reward-column`)]
    .map(element => +element.textContent.replace(/[^0-9.]/g, ``))
    .reduce((a, b) => a + b, 0);
    
    document.getElementsByClassName(`task-queue-header`)[0].children[0].children[0].textContent +=
      ` - HITs: ${-- document.getElementsByClassName(`reward-column`).length} | Value: $${total.toFixed(2)}`
    ;
  }
};

if (document.querySelector(`[data-react-class="require('reactComponents/taskQueueTable/TaskQueueTable')['default']"]`)) {
  queueCountValue.execute();
}
